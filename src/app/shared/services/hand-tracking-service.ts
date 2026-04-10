import { Injectable, OnDestroy } from '@angular/core';
import { LoggerService } from '../../core/services/logger.service';
import { environment } from '../../../environments/environment';
import type {
  HandResults,
  HandsOptions,
  NormalizedLandmark,
} from '../../../types/mediapipe';

export type { HandResults, NormalizedLandmark };

export type HandTrackingConfig = Pick<
  HandsOptions,
  'maxNumHands' | 'modelComplexity' | 'minDetectionConfidence' | 'minTrackingConfidence'
>;

interface RetryConfig {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_HANDS_CONFIG: HandTrackingConfig = {
  maxNumHands: 2,
  modelComplexity: 1,
  minDetectionConfidence: environment.handDetectionMinConfidence,
  minTrackingConfidence: environment.handDetectionMinConfidence,
};

const DEFAULT_RETRY: RetryConfig = {
  maxAttempts: 5,
  baseDelayMs: 1000,
  maxDelayMs: 16000,
};

/**
 * Servico singleton para rastreamento de maos via MediaPipe.
 *
 * Responsabilidades:
 * - Inicializar o modelo MediaPipe Hands (com retry exponencial).
 * - Gerenciar o ciclo de vida da camera (start / pause / resume / stop).
 * - Expor helpers de desenho e deteccao de gestos.
 */
@Injectable({ providedIn: 'root' })
export class HandTrackingService implements OnDestroy {
  private hands?: InstanceType<typeof Hands>;
  private camera?: InstanceType<typeof Camera>;
  private retryAttempt = 0;
  private retryTimeoutId?: ReturnType<typeof setTimeout>;

  constructor(private readonly logger: LoggerService) {}

  ngOnDestroy(): void {
    this.stop();
  }

  async initialize(
    videoElement: HTMLVideoElement,
    onResultsCallback: (results: HandResults) => void,
    configOverrides?: Partial<HandTrackingConfig>
  ): Promise<void> {
    if (!this.isMediaPipeLoaded()) {
      await this.waitForMediaPipe(videoElement, onResultsCallback, configOverrides);
      return;
    }

    this.retryAttempt = 0;

    const config: HandTrackingConfig = { ...DEFAULT_HANDS_CONFIG, ...configOverrides };

    this.hands = new Hands({
      locateFile: (file: string) => `${environment.mediapipeCdn}/${file}`,
    });

    this.hands.setOptions(config);
    this.hands.onResults(onResultsCallback);

    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        if (this.hands) {
          await this.hands.send({ image: videoElement });
        }
      },
      width: 1280,
      height: 720,
    });

    this.logger.debug('[HandTrackingService] Inicializado com sucesso.');
  }

  async start(): Promise<void> {
    if (!this.camera) {
      this.logger.error('[HandTrackingService] start() chamado antes de initialize().');
      return;
    }
    await this.camera.start();
    this.logger.debug('[HandTrackingService] Camera iniciada.');
  }

  pauseCamera(): void {
    try {
      this.camera?.stop();
    } catch (err) {
      this.logger.warn('[HandTrackingService] Falha ao pausar camera.', err);
    }
  }

  async resumeCamera(): Promise<void> {
    if (!this.camera) {
      this.logger.error('[HandTrackingService] resumeCamera() chamado antes de initialize().');
      return;
    }
    try {
      await this.camera.start();
      this.logger.debug('[HandTrackingService] Camera retomada.');
    } catch (err) {
      this.logger.warn('[HandTrackingService] Falha ao retomar camera.', err);
    }
  }

  stop(): void {
    this.clearRetryTimeout();

    try { this.camera?.stop(); }
    catch (err) { this.logger.warn('[HandTrackingService] Erro ao parar camera.', err); }

    try { this.hands?.close(); }
    catch (err) { this.logger.warn('[HandTrackingService] Erro ao fechar Hands.', err); }

    this.camera = undefined;
    this.hands  = undefined;
    this.retryAttempt = 0;

    this.logger.debug('[HandTrackingService] Recursos liberados.');
  }

  drawHandSkeleton(ctx: CanvasRenderingContext2D, landmarks: NormalizedLandmark[]): void {
    ctx.save();
    ctx.shadowBlur  = 10;
    ctx.shadowColor = '#00fbff';

    if (typeof drawConnectors !== 'undefined' && typeof HAND_CONNECTIONS !== 'undefined') {
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00d4ff', lineWidth: 3 });
    }
    if (typeof drawLandmarks !== 'undefined') {
      drawLandmarks(ctx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 2 });
    }

    ctx.restore();
  }

  /**
   * Retorna true se pelo menos minFingers dedos estiverem abertos.
   * Indices MediaPipe: 0=pulso, 8/12/16/20=pontas, 6/10/14/18=articulacoes PIP.
   */
  checkFingers(landmarks: NormalizedLandmark[], minFingers = 3): boolean {
    const wrist = landmarks[0];
    const tips  = [8, 12, 16, 20] as const;
    const pips  = [6, 10, 14, 18] as const;
    let openCount = 0;

    for (let i = 0; i < tips.length; i++) {
      const tip = landmarks[tips[i]];
      const pip = landmarks[pips[i]];
      const distTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
      const distPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
      if (distTip > distPip) openCount++;
    }

    return openCount >= minFingers;
  }

  /**
   * Detecta gesto de pinca entre polegar (4) e indicador (8).
   * Limiar em espaco normalizado 0-1; ajuste empiricamente.
   */
  checkPinch(landmarks: NormalizedLandmark[], threshold = 0.05): boolean {
    const thumb = landmarks[4];
    const index = landmarks[8];
    const dist  = Math.hypot(thumb.x - index.x, thumb.y - index.y);
    return dist < threshold;
  }

  /**
   * Suavizacao exponencial (EMA) para reduzir jitter dos landmarks.
   * alpha=1 sem suavizacao, alpha=0 ignora frame atual.
   */
  smoothLandmark(
    raw: NormalizedLandmark,
    prev: NormalizedLandmark,
    alpha = 0.7
  ): NormalizedLandmark {
    return {
      x: alpha * raw.x + (1 - alpha) * prev.x,
      y: alpha * raw.y + (1 - alpha) * prev.y,
      z: alpha * raw.z + (1 - alpha) * prev.z,
    };
  }

  private isMediaPipeLoaded(): boolean {
    return typeof Hands !== 'undefined' && typeof Camera !== 'undefined';
  }

  private async waitForMediaPipe(
    videoElement: HTMLVideoElement,
    callback: (results: HandResults) => void,
    configOverrides?: Partial<HandTrackingConfig>
  ): Promise<void> {
    if (this.retryAttempt >= DEFAULT_RETRY.maxAttempts) {
      this.logger.error(
        `[HandTrackingService] MediaPipe nao carregado apos ${DEFAULT_RETRY.maxAttempts} tentativas. Verifique os scripts CDN no index.html.`
      );
      return;
    }

    const delay = Math.min(
      DEFAULT_RETRY.baseDelayMs * Math.pow(2, this.retryAttempt),
      DEFAULT_RETRY.maxDelayMs
    );

    this.retryAttempt++;
    this.logger.warn(
      `[HandTrackingService] MediaPipe nao disponivel. Tentativa ${this.retryAttempt}/${DEFAULT_RETRY.maxAttempts} em ${delay}ms.`
    );

    await new Promise<void>((resolve) => {
      this.retryTimeoutId = setTimeout(async () => {
        await this.initialize(videoElement, callback, configOverrides);
        resolve();
      }, delay);
    });
  }

  private clearRetryTimeout(): void {
    if (this.retryTimeoutId !== undefined) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = undefined;
    }
  }
}
