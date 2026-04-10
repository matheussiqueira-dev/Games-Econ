/**
 * MediaPipe Hand Tracking — declarações de tipos globais.
 * Os scripts são carregados via CDN no index.html; esta definição fornece
 * segurança de tipos sem depender de um pacote npm externo.
 *
 * @see https://google.github.io/mediapipe/solutions/hands
 */

// ── Landmarks ──────────────────────────────────────────────────────────────

/** Ponto 3-D normalizado devolvido pelo MediaPipe (valores 0–1 para x/y). */
export interface NormalizedLandmark {
  x: number;
  y: number;
  z: number;
  /** Presença estimada (opcional — nem todos os modelos o fornecem). */
  visibility?: number;
}

/** Array com 21 landmarks que representam uma mão completa. */
export type HandLandmarks = NormalizedLandmark[];

/** Eixos da conexão entre dois landmarks. */
export interface LandmarkConnection {
  start: number;
  end: number;
}

// ── Resultados do detector ─────────────────────────────────────────────────

/** Categoria de lateralidade retornada pelo MediaPipe. */
export interface HandednessCategory {
  /** "Left" ou "Right" */
  label: string;
  /** Confiança da classificação (0–1). */
  score: number;
}

/** Payload completo de um frame do detector de mãos. */
export interface HandResults {
  /** Frame de vídeo do instante detectado. */
  image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement;
  /** Landmarks normalizados de cada mão detectada. */
  multiHandLandmarks: HandLandmarks[];
  /** Lateralidade de cada mão (mesmo índice que multiHandLandmarks). */
  multiHandedness: HandednessCategory[][];
}

// ── Configuração do detector ───────────────────────────────────────────────

export interface HandsConfig {
  /** Caminho base ou função localizadora dos arquivos WASM/modelo. */
  locateFile: (file: string) => string;
}

export interface HandsOptions {
  /** Número máximo de mãos a detectar. Padrão: 2. */
  maxNumHands: number;
  /** Complexidade do modelo (0 = leve, 1 = completo). Padrão: 1. */
  modelComplexity: 0 | 1;
  /** Confiança mínima para considerar uma detecção válida. Padrão: 0.5. */
  minDetectionConfidence: number;
  /** Confiança mínima para manter o rastreamento entre frames. Padrão: 0.5. */
  minTrackingConfidence: number;
}

// ── Instâncias do SDK ──────────────────────────────────────────────────────

export interface HandsInstance {
  setOptions(options: Partial<HandsOptions>): void;
  onResults(callback: (results: HandResults) => void): void;
  send(input: { image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement }): Promise<void>;
  close(): void;
}

export interface CameraConfig {
  onFrame: () => Promise<void>;
  width?: number;
  height?: number;
}

export interface CameraInstance {
  start(): Promise<void>;
  stop(): void;
}

// ── Estilos de desenho ─────────────────────────────────────────────────────

export interface DrawingStyle {
  color?: string;
  lineWidth?: number;
  radius?: number;
  fillColor?: string;
  visibilityMin?: number;
}

// ── Construtores globais (injetados via CDN) ───────────────────────────────

declare global {
  /** Detector de mãos do MediaPipe. */
  class Hands {
    constructor(config: HandsConfig);
    setOptions(options: Partial<HandsOptions>): void;
    onResults(callback: (results: HandResults) => void): void;
    send(input: { image: HTMLVideoElement | HTMLImageElement | HTMLCanvasElement }): Promise<void>;
    close(): void;
  }

  /** Utilitário de câmera do MediaPipe. */
  class Camera {
    constructor(videoElement: HTMLVideoElement, config: CameraConfig);
    start(): Promise<void>;
    stop(): void;
  }

  /** Conexões pré-definidas entre os 21 landmarks de uma mão. */
  const HAND_CONNECTIONS: LandmarkConnection[];

  /** Desenha as conexões entre landmarks no canvas. */
  function drawConnectors(
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    connections: LandmarkConnection[],
    style?: DrawingStyle
  ): void;

  /** Desenha os pontos de landmark individualmente no canvas. */
  function drawLandmarks(
    ctx: CanvasRenderingContext2D,
    landmarks: NormalizedLandmark[],
    style?: DrawingStyle
  ): void;
}

export {};
