import { Injectable } from '@angular/core';

// ─── Tipos globais do MediaPipe (carregados via CDN) ─────────────────────────
declare function drawConnectors(ctx: CanvasRenderingContext2D, landmarks: any, connections: any, style: any): void;
declare function drawLandmarks(ctx: CanvasRenderingContext2D, landmarks: any, style: any): void;
declare const HAND_CONNECTIONS: any;
declare class Hands {
  constructor(config: any);
  setOptions(options: any): void;
  onResults(callback: (results: any) => void): void;
  send(input: any): Promise<void>;
  close(): void;
}
declare class Camera {
  constructor(video: HTMLVideoElement, config: any);
  start(): void;
  stop(): void;
}

// ─── Interface de configuração do MediaPipe ───────────────────────────────────
export interface HandsConfig {
  maxNumHands: number;
  modelComplexity: number;
  minDetectionConfidence: number;
  minTrackingConfidence: number;
}

// ─── Interface do canvas para desenho dos landmarks ──────────────────────────
export interface DrawingElements {
  videoElement: HTMLVideoElement;
  canvasElement: HTMLCanvasElement;
}

@Injectable({
  providedIn: 'root', // Singleton — uma única instância para toda a aplicação
})
export class HandTrackingService {

  // Instâncias internas do MediaPipe
  private hands?: any;
  private camera?: any;

  // Configuração padrão do modelo
  private defaultConfig: HandsConfig = {
    maxNumHands: 2,
    modelComplexity: 1,
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5,
  };

  // ─────────────────────────────────────────────────────────────────────────
  // initialize()
  // Inicializa o MediaPipe Hands e a Camera.
  // Recebe o elemento de vídeo, o callback onResults e configurações opcionais.
  // O callback é definido pelo COMPONENTE — cada feature passa o seu próprio.
  // ─────────────────────────────────────────────────────────────────────────
  async initialize(
    videoElement: HTMLVideoElement,
    onResultsCallback: (results: any) => void,
    configOverrides?: Partial<HandsConfig>
  ): Promise<void> {
    if (typeof Hands === 'undefined' || typeof Camera === 'undefined') {
      console.error('[HandTrackingService] MediaPipe não carregado ainda, tentando novamente...');
      setTimeout(() => this.initialize(videoElement, onResultsCallback, configOverrides), 1000);
      return;
    }

    const config = { ...this.defaultConfig, ...configOverrides };

    // Cria e configura o detector de mãos
    this.hands = new Hands({
      locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`
    });

    this.hands.setOptions(config);

    // Registra o callback definido pelo componente
    this.hands.onResults(onResultsCallback);

    // Cria a câmera e envia cada frame para o detector
    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        if (this.hands) {
          await this.hands.send({ image: videoElement });
        }
      },
      width: 1280,
      height: 720
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // start() — inicia a câmera e o loop de detecção
  // ─────────────────────────────────────────────────────────────────────────
  async start(): Promise<void> {
    if (!this.camera) {
      console.error('[HandTrackingService] Câmera não inicializada. Chame initialize() primeiro.');
      return;
    }
    await this.camera.start();
    console.log('[HandTrackingService] Câmera iniciada.');
  }

  // ─────────────────────────────────────────────────────────────────────────
  // pauseCamera() — pausa apenas a câmera, mantém o modelo Hands vivo
  // Use quando quiser desabilitar temporariamente sem recarregar o modelo CDN
  // ─────────────────────────────────────────────────────────────────────────
  pauseCamera(): void {
    try { this.camera?.stop?.(); } catch (e) { console.log('[HandTrackingService] Camera pause:', e); }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // resumeCamera() — retoma a câmera sem precisar reinicializar o modelo
  // ─────────────────────────────────────────────────────────────────────────
  async resumeCamera(): Promise<void> {
    if (!this.camera) {
      console.error('[HandTrackingService] Câmera não inicializada. Chame initialize() primeiro.');
      return;
    }
    try { await this.camera.start(); } catch (e) { console.log('[HandTrackingService] Camera resume:', e); }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // stop() — para TUDO e libera recursos (use no ngOnDestroy do componente)
  // ─────────────────────────────────────────────────────────────────────────
  stop(): void {
    try { this.camera?.stop?.(); } catch (e) { console.log('[HandTrackingService] Camera stop:', e); }
    try { this.hands?.close?.(); } catch (e) { console.log('[HandTrackingService] Hands close:', e); }
    this.camera = undefined;
    this.hands = undefined;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // drawHandSkeleton() — desenha o esqueleto da mão no canvas
  // Função genérica reutilizável por qualquer componente
  // ─────────────────────────────────────────────────────────────────────────
  drawHandSkeleton(ctx: CanvasRenderingContext2D, landmarks: any): void {
    ctx.save();
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00fbff';
    if (typeof drawConnectors !== 'undefined' && typeof HAND_CONNECTIONS !== 'undefined') {
      drawConnectors(ctx, landmarks, HAND_CONNECTIONS, { color: '#00d4ff', lineWidth: 3 });
    }
    if (typeof drawLandmarks !== 'undefined') {
      drawLandmarks(ctx, landmarks, { color: '#ffffff', lineWidth: 1, radius: 2 });
    }
    ctx.restore();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // checkOpen() — detecta se uma mão está aberta
  // Compara a distância da ponta de cada dedo ao pulso com a distância da
  // articulação do meio ao pulso. Se a ponta está mais longe → dedo aberto.
  // Retorna true se 3 ou mais dedos estiverem abertos.
  // ─────────────────────────────────────────────────────────────────────────
  checkFingers(landmarks: any[], minFingers: number = 3): boolean {
    let count = 0;
    const wrist = landmarks[0];           // ponto 0 = pulso
    const tips = [8, 12, 16, 20];         // pontas dos dedos indicador→mínimo
    const pips = [6, 10, 14, 18];         // articulações do meio

    for (let i = 0; i < tips.length; i++) {
      const tip = landmarks[tips[i]];
      const pip = landmarks[pips[i]];
      const distTip = Math.hypot(tip.x - wrist.x, tip.y - wrist.y);
      const distPip = Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
      if (distTip > distPip) count++;
    }

    return count >= minFingers;
  }

  
}


