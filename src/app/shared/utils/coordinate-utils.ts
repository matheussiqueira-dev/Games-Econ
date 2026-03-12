import { iLandmark } from '../interfaces/landmark.interface';

// ── Utilitários para coordenadas e rendering ───────────────────────────────

export const CoordinateUtils = {
  /**
   * Converte landmark normalizado para coordenadas de viewport,
   * compensando o espelhamento CSS (scaleX(-1)) do canvas.
   */
  toViewportCoords(landmark: iLandmark, canvasElement: HTMLCanvasElement): { x: number; y: number } {
    const rect = canvasElement.getBoundingClientRect();
    return {
      x: rect.left + (1 - landmark.x) * rect.width,
      y: rect.top  + landmark.y * rect.height,
    };
  },

  /**
   * Calcula distância em pixels entre dois landmarks.
   */
  landmarkDistance(a: iLandmark, b: iLandmark, w: number, h: number): number {
    return Math.hypot((b.x - a.x) * w, (b.y - a.y) * h);
  },
} as const;

// ── Utilitários para manipulação do DOM ────────────────────────────────────

export const DOMUtils = {
  /**
   * Simula um clique em coordenadas específicas da tela.
   */
  simulateClickAt(screenX: number, screenY: number): void {
    const element = document.elementFromPoint(screenX, screenY);
    if (!element) return;

    element.dispatchEvent(new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
      clientX: screenX,
      clientY: screenY,
      view: window,
    }));
  },

  /**
   * Busca recursiva por elemento com overflow scrollável.
   */
  findScrollableElement(el: Element): Element | null {
    const style    = window.getComputedStyle(el);
    const overflow = style.overflow + style.overflowY;

    if (/(auto|scroll)/.test(overflow) && el.scrollHeight > el.clientHeight) {
      return el;
    }

    for (const child of Array.from(el.children)) {
      const found = this.findScrollableElement(child);
      if (found) return found;
    }

    return null;
  },
} as const;