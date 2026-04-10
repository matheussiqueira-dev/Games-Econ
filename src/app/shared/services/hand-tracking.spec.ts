import { TestBed } from '@angular/core/testing';
import { HandTrackingService } from './hand-tracking-service';
import { LoggerService } from '../../core/services/logger.service';
import type { NormalizedLandmark } from '../../../types/mediapipe';

/** Fabrica um landmark normalizado com coordenadas arbitrarias. */
function makeLandmark(x: number, y: number, z = 0): NormalizedLandmark {
  return { x, y, z };
}

/**
 * Cria um array de 21 landmarks com todas as coordenadas zeradas.
 * Os testes sobrescrevem apenas os pontos relevantes.
 */
function makeHandLandmarks(): NormalizedLandmark[] {
  return Array.from({ length: 21 }, () => makeLandmark(0, 0));
}

// Stub silencioso do LoggerService
const loggerStub = {
  debug: () => {},
  info:  () => {},
  warn:  () => {},
  error: () => {},
};

describe('HandTrackingService', () => {
  let service: HandTrackingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        HandTrackingService,
        { provide: LoggerService, useValue: loggerStub },
      ],
    });
    service = TestBed.inject(HandTrackingService);
  });

  afterEach(() => {
    service.stop();
  });

  // ── Criacao ───────────────────────────────────────────────────────────

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  // ── checkFingers ──────────────────────────────────────────────────────

  describe('checkFingers()', () => {
    it('retorna true quando 3 ou mais dedos estao abertos', () => {
      const landmarks = makeHandLandmarks();
      // Pulso na origem (0,0)
      // Pontas dos dedos longe do pulso (distancia maior que PIP)
      // Indice 8 (tip) vs 6 (pip) — indicador
      landmarks[8]  = makeLandmark(0, 0.8);  // tip indicador — longe
      landmarks[6]  = makeLandmark(0, 0.4);  // pip indicador — perto
      // Indice 12 (tip) vs 10 (pip) — medio
      landmarks[12] = makeLandmark(0.1, 0.8);
      landmarks[10] = makeLandmark(0.1, 0.4);
      // Indice 16 (tip) vs 14 (pip) — anelar
      landmarks[16] = makeLandmark(0.2, 0.8);
      landmarks[14] = makeLandmark(0.2, 0.4);

      expect(service.checkFingers(landmarks, 3)).toBe(true);
    });

    it('retorna false quando menos de 3 dedos estao abertos (punho fechado)', () => {
      const landmarks = makeHandLandmarks();
      // Todos os landmarks na origem — distancia tip == pip == 0 => nenhum dedo aberto
      expect(service.checkFingers(landmarks, 3)).toBe(false);
    });

    it('respeita o parametro minFingers customizado', () => {
      const landmarks = makeHandLandmarks();
      // Apenas 1 dedo aberto: indicador
      landmarks[8] = makeLandmark(0, 0.8);
      landmarks[6] = makeLandmark(0, 0.4);

      expect(service.checkFingers(landmarks, 1)).toBe(true);
      expect(service.checkFingers(landmarks, 2)).toBe(false);
    });
  });

  // ── checkPinch ────────────────────────────────────────────────────────

  describe('checkPinch()', () => {
    it('retorna true quando polegar e indicador estao proximos', () => {
      const landmarks = makeHandLandmarks();
      landmarks[4] = makeLandmark(0.5, 0.5);   // polegar
      landmarks[8] = makeLandmark(0.52, 0.51); // indicador muito proximo

      expect(service.checkPinch(landmarks, 0.05)).toBe(true);
    });

    it('retorna false quando polegar e indicador estao distantes', () => {
      const landmarks = makeHandLandmarks();
      landmarks[4] = makeLandmark(0.1, 0.1); // polegar
      landmarks[8] = makeLandmark(0.9, 0.9); // indicador distante

      expect(service.checkPinch(landmarks, 0.05)).toBe(false);
    });

    it('usa o threshold customizado', () => {
      const landmarks = makeHandLandmarks();
      landmarks[4] = makeLandmark(0.5, 0.5);
      landmarks[8] = makeLandmark(0.6, 0.5); // distancia = 0.1

      expect(service.checkPinch(landmarks, 0.05)).toBe(false);
      expect(service.checkPinch(landmarks, 0.15)).toBe(true);
    });
  });

  // ── smoothLandmark ────────────────────────────────────────────────────

  describe('smoothLandmark()', () => {
    it('retorna o landmark bruto quando alpha=1 (sem suavizacao)', () => {
      const raw  = makeLandmark(1, 1, 1);
      const prev = makeLandmark(0, 0, 0);
      const result = service.smoothLandmark(raw, prev, 1);

      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(1);
      expect(result.z).toBeCloseTo(1);
    });

    it('retorna o landmark anterior quando alpha=0 (maximo de suavizacao)', () => {
      const raw  = makeLandmark(1, 1, 1);
      const prev = makeLandmark(0.2, 0.3, 0.4);
      const result = service.smoothLandmark(raw, prev, 0);

      expect(result.x).toBeCloseTo(0.2);
      expect(result.y).toBeCloseTo(0.3);
      expect(result.z).toBeCloseTo(0.4);
    });

    it('interpola corretamente com alpha padrao (0.7)', () => {
      const raw  = makeLandmark(1, 0, 0);
      const prev = makeLandmark(0, 0, 0);
      const result = service.smoothLandmark(raw, prev);

      expect(result.x).toBeCloseTo(0.7);
      expect(result.y).toBeCloseTo(0);
    });
  });

  // ── stop() ────────────────────────────────────────────────────────────

  describe('stop()', () => {
    it('pode ser chamado sem initialize() sem lancar excecao', () => {
      expect(() => service.stop()).not.toThrow();
    });

    it('pode ser chamado multiplas vezes sem erro', () => {
      expect(() => {
        service.stop();
        service.stop();
      }).not.toThrow();
    });
  });
});
