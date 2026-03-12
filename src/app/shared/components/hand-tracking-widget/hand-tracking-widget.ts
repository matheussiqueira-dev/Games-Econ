import { Component, AfterViewInit, OnDestroy, OnChanges, SimpleChanges, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { HandTrackingService } from '../../services/hand-tracking-service';
import { iLandmark } from '../../interfaces/landmark.interface';
import { iBallConfig } from '../../interfaces/ball-config.interface';
import { HandTrackingConstants } from '../../utils/hand-tracking-constants';
import { CoordinateUtils, DOMUtils } from '../../utils/coordinate-utils';

@Component({
  selector: 'app-hand-tracking-widget',
  imports: [],
  templateUrl: './hand-tracking-widget.html',
  styleUrl: './hand-tracking-widget.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HandTrackingWidget implements AfterViewInit, OnDestroy, OnChanges {

  readonly handTrackingEnabled = input<boolean>(true);

  private readonly handTracking = inject(HandTrackingService);

  // ── Constantes referenciadas de utils ────────────────────────────────────────────
  private readonly constants = HandTrackingConstants;

  private readonly CURSOR_BALL: iBallConfig = {
    radius: 10,
    glowBlur: 15,
    glowColor: 'rgba(0, 200, 255, 0.95)',
    bodyStops: [
      { offset: 0,   color: 'rgba(180, 240, 255, 1.0)'  },
      { offset: 0.5, color: 'rgba(0,   180, 255, 0.85)' },
      { offset: 1,   color: 'rgba(0,    80, 200, 0.4)'  },
    ],
    innerRadius: 1,
    highlightOffset: 0.3,
    borderColor: 'rgba(120, 230, 255, 0.9)',
    borderWidth: 1.5,
  };

  private readonly SCROLL_BALL: iBallConfig = {
    radius: 20,
    glowBlur: 30,
    glowColor: 'rgba(0, 179, 255, 0.64)',
    bodyStops: [
      { offset: 0,   color: 'rgba(140, 230, 255, 0.85)' },
      { offset: 0.4, color: 'rgba(0,  160, 255, 0.55)'  },
      { offset: 1,   color: 'rgba(0,   60, 180, 0.0)'   },
    ],
    innerRadius: 5,
    highlightOffset: 0.28,
    borderColor: 'rgba(100, 220, 255, 0.6)',
    borderWidth: 1.5,
  };

  // ── Estado do scroll ──────────────────────────────────────────────────────
  private prevFingerY: number | null = null;
  private prevFingerX: number | null = null;

  // ── Estado do cursor (hover) ──────────────────────────────────────────────
  private lastHoveredElement: Element | null = null;

  ngAfterViewInit(): void {
    // Inicializa UMA única vez — a câmera fica ativa em segundo plano sempre
    // O toggle apenas controla o que é desenhado no canvas, não para/reinicia a câmera
    setTimeout(() => this.setup(), 1000);
  }

  ngOnDestroy(): void {
    this.handTracking.stop();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const change = changes['handTrackingEnabled'];
    if (!change || change.firstChange) return;

    if (this.handTrackingEnabled()) {
      this.handTracking.resumeCamera();
      return;
    }

    this.handTracking.pauseCamera();
    this.clearCanvas();
  }

  private clearCanvas(): void {
    const canvas = document.getElementById('ht-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  }

  private async setup(): Promise<void> {
    try {
      const videoElement  = document.getElementById('ht-video')  as HTMLVideoElement;
      const canvasElement = document.getElementById('ht-canvas') as HTMLCanvasElement;

      if (!videoElement || !canvasElement) {
        console.error('[HandTrackingWidget] Elementos não encontrados, tentando novamente...');
        setTimeout(() => this.setup(), 500);
        return;
      }

      await this.handTracking.initialize(
        videoElement,
        (res) => this.onResults(res, videoElement, canvasElement)
      );
      await this.handTracking.start();
      this.injectHoverMirrorStyles();

      console.log('[HandTrackingWidget] Hand tracking iniciado.');
    } catch (error) {
      console.error('[HandTrackingWidget] Falha ao iniciar:', error);
      setTimeout(() => this.setup(), 2000);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // onResults() — Callback chamado pelo MediaPipe a cada frame.
  // ─────────────────────────────────────────────────────────────────────────
  private onResults(res: any, videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement): void {
    const ctx = canvasElement.getContext('2d')!;

    if (!this.handTrackingEnabled()) {
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      return;
    }

    canvasElement.width  = videoElement.videoWidth;
    canvasElement.height = videoElement.videoHeight;
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (!res.multiHandLandmarks) return;

    for (const landmarks of res.multiHandLandmarks) {
      this.handTracking.drawHandSkeleton(ctx, landmarks);
      this.processGesture(ctx, landmarks, canvasElement);
    }
  }

  private processGesture(ctx: CanvasRenderingContext2D, landmarks: iLandmark[], canvasElement: HTMLCanvasElement): void {
    const raisedTips = this.getExtendedFingerTips(landmarks);

    if (raisedTips.length === 2) {
      this.handleTwoFingerScroll(ctx, landmarks, raisedTips, canvasElement);
      return;
    }

    if (raisedTips.length === 1) {
      this.handleOneFingerCursor(ctx, landmarks, raisedTips, canvasElement);
      return;
    }

    this.resetScrollState();
    this.clearHover();
  }

  private resetScrollState(): void {
    this.prevFingerY = null;
    this.prevFingerX = null;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // handleTwoFingerScroll() — 2 dedos levantados: scroll + bola visual
  // ─────────────────────────────────────────────────────────────────────────
  private handleTwoFingerScroll(
    ctx: CanvasRenderingContext2D,
    landmarks: iLandmark[],
    raisedTips: number[],
    canvasElement: HTMLCanvasElement
  ): void {
    const p1   = landmarks[raisedTips[0]];
    const p2   = landmarks[raisedTips[1]];
    const dist = CoordinateUtils.landmarkDistance(p1, p2, canvasElement.width, canvasElement.height);

    if (dist >= this.constants.SCROLL_FINGER_DISTANCE) {
      this.resetScrollState();
      return;
    }

    this.applyScroll((p1.x + p2.x) / 2, (p1.y + p2.y) / 2);
    this.drawBall(ctx, (p1.x + p2.x) / 2, (p1.y + p2.y) / 2, canvasElement.width, canvasElement.height, this.SCROLL_BALL);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // handleOneFingerCursor() — 1 dedo levantado: cursor + hover + pinch-click
  // ─────────────────────────────────────────────────────────────────────────
  private handleOneFingerCursor(
    ctx: CanvasRenderingContext2D,
    landmarks: iLandmark[],
    raisedTips: number[],
    canvasElement: HTMLCanvasElement
  ): void {
    const tip   = landmarks[raisedTips[0]];
    const thumb = landmarks[this.constants.THUMB_TIP_INDEX];
    const dist  = CoordinateUtils.landmarkDistance(tip, thumb, canvasElement.width, canvasElement.height);

    const { x: screenX, y: screenY } = CoordinateUtils.toViewportCoords(tip, canvasElement);

    this.simulateHover(screenX, screenY);

    if (dist < this.constants.PINCH_DISTANCE) {
      DOMUtils.simulateClickAt(screenX, screenY);
    }

    this.drawBall(ctx, tip.x, tip.y, canvasElement.width, canvasElement.height, this.CURSOR_BALL);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // simulateHover()
  // Dispara eventos de mousemove, mouseenter/mouseleave para que os
  // componentes reajam ao "hover" da bola cursor como se fosse um mouse real.
  // ─────────────────────────────────────────────────────────────────────────
  private simulateHover(screenX: number, screenY: number): void {
    const currentElement = document.elementFromPoint(screenX, screenY);

    const eventInit: MouseEventInit = {
      bubbles: true,
      cancelable: true,
      clientX: screenX,
      clientY: screenY,
      view: window,
    };

    // Se o elemento mudou → dispara leave/enter + remove/adiciona classe ht-hover
    if (currentElement !== this.lastHoveredElement) {
      if (this.lastHoveredElement) {
        this.lastHoveredElement.dispatchEvent(new MouseEvent('mouseleave', { ...eventInit, bubbles: false }));
        this.lastHoveredElement.dispatchEvent(new MouseEvent('mouseout', eventInit));
        // Remove ht-hover de todo o caminho ancestral anterior
        this.setHoverClass(this.lastHoveredElement, false);
      }
      if (currentElement) {
        currentElement.dispatchEvent(new MouseEvent('mouseenter', { ...eventInit, bubbles: false }));
        currentElement.dispatchEvent(new MouseEvent('mouseover', eventInit));
        // Adiciona ht-hover ao elemento e seus ancestrais
        this.setHoverClass(currentElement, true);
      }
      this.lastHoveredElement = currentElement;
    }

    // Sempre dispara mousemove no elemento atual
    if (currentElement) {
      currentElement.dispatchEvent(new MouseEvent('mousemove', eventInit));
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // setHoverClass()
  // Adiciona ou remove a classe 'ht-hover' no elemento e em todos os seus
  // ancestrais até o <body>. Isso permite que regras CSS que usam :hover
  // também funcionem com .ht-hover (ex: .btn:hover, .btn.ht-hover { ... })
  // ─────────────────────────────────────────────────────────────────────────
  private setHoverClass(el: Element | null, add: boolean): void {
    let current = el;
    while (current && current !== document.documentElement) {
      if (add) {
        current.classList.add('ht-hover');
      } else {
        current.classList.remove('ht-hover');
      }
      current = current.parentElement;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // clearHover()
  // Limpa o estado de hover quando o cursor virtual sai de cena.
  // ─────────────────────────────────────────────────────────────────────────
  private clearHover(): void {
    if (this.lastHoveredElement) {
      this.lastHoveredElement.dispatchEvent(new MouseEvent('mouseleave', { bubbles: false }));
      this.lastHoveredElement.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
      this.setHoverClass(this.lastHoveredElement, false);
      this.lastHoveredElement = null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // drawBall() — Desenha uma bola estilizada com glow, gradiente e brilho.
  // Recebe posição normalizada (0..1) e configuração visual.
  // ─────────────────────────────────────────────────────────────────────────
  private drawBall(ctx: CanvasRenderingContext2D, nx: number, ny: number, w: number, h: number, config: iBallConfig): void {
    const x = nx * w;
    const y = ny * h;
    const { radius, glowBlur, glowColor, bodyStops, innerRadius, highlightOffset, borderColor, borderWidth } = config;

    ctx.save();

    // Glow externo
    ctx.shadowBlur  = glowBlur;
    ctx.shadowColor = glowColor;

    // Corpo — gradiente radial
    const body = ctx.createRadialGradient(x, y, innerRadius, x, y, radius);
    for (const stop of bodyStops) {
      body.addColorStop(stop.offset, stop.color);
    }
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.fill();

    // Reflexo interno (highlight)
    ctx.shadowBlur = 0;
    const hx = x - radius * highlightOffset;
    const hy = y - radius * highlightOffset;
    const highlight = ctx.createRadialGradient(hx, hy, innerRadius * 0.5, hx, hy, radius * 0.55);
    highlight.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
    highlight.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = highlight;
    ctx.fill();

    // Borda luminosa
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth   = borderWidth;
    ctx.stroke();

    ctx.restore();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // getExtendedFingerTips() — Retorna índices das pontas dos dedos estendidos.
  // ─────────────────────────────────────────────────────────────────────────
  private getExtendedFingerTips(landmarks: iLandmark[]): number[] {
    const wrist = landmarks[this.constants.WRIST_INDEX];

    return this.constants.FINGER_TIPS.filter((tipIdx, i) => {
      const tip = landmarks[tipIdx];
      const pip = landmarks[this.constants.FINGER_PIPS[i]];
      return Math.hypot(tip.x - wrist.x, tip.y - wrist.y)
           > Math.hypot(pip.x - wrist.x, pip.y - wrist.y);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // applyScroll() — Calcula delta e rola a página.
  // Ambos os eixos são invertidos (câmera espelhada).
  // ─────────────────────────────────────────────────────────────────────────
  private applyScroll(currentX: number, currentY: number): void {
    if (this.prevFingerY === null || this.prevFingerX === null) {
      this.prevFingerY = currentY;
      this.prevFingerX = currentX;
      return;
    }

    const deltaY = currentY - this.prevFingerY;
    const deltaX = currentX - this.prevFingerX;
    this.prevFingerY = currentY;
    this.prevFingerX = currentX;

    const threshold = this.constants.SCROLL_NOISE_THRESHOLD;
    const scrollY   = Math.abs(deltaY) >= threshold ? -deltaY * this.constants.SCROLL_SPEED : 0;
    const scrollX   = Math.abs(deltaX) >= threshold ? -deltaX * this.constants.SCROLL_SPEED : 0;

    if (scrollX === 0 && scrollY === 0) return;

    this.getScrollableParent().scrollBy({ top: scrollY, left: scrollX, behavior: 'auto' });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // getScrollableParent() — Busca o elemento scrollável dentro da widget.
  // ─────────────────────────────────────────────────────────────────────────
  private getScrollableParent(): Element {
    const widget = document.querySelector('app-hand-tracking-widget');
    if (!widget) return document.documentElement;

    return DOMUtils.findScrollableElement(widget) ?? document.documentElement;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // injectHoverMirrorStyles() — Duplica regras CSS :hover como .ht-hover
  // para que o cursor virtual ative estilos visuais de hover.
  // ─────────────────────────────────────────────────────────────────────────
  private injectHoverMirrorStyles(): void {
    if (document.getElementById('ht-hover-mirror')) return;

    const mirrorRules: string[] = [];

    for (const sheet of Array.from(document.styleSheets)) {
      try {
        const rules = sheet.cssRules ?? sheet.rules;
        if (!rules) continue;

        for (const rule of Array.from(rules)) {
          if (!(rule instanceof CSSStyleRule)) continue;
          if (!rule.selectorText?.includes(':hover')) continue;

          const newSelector = rule.selectorText.replace(/:hover/g, '.ht-hover');
          mirrorRules.push(`${newSelector} { ${rule.style.cssText} }`);
        }
      } catch {
        // Stylesheets cross-origin — ignorar
      }
    }

    if (mirrorRules.length === 0) return;

    const style= document.createElement('style');
    style.id = 'ht-hover-mirror';
    style.textContent = mirrorRules.join('\n');
    document.head.appendChild(style);
  }
}
