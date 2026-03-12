// ── Constantes para o sistema de hand-tracking ─────────────────────────────
export const HandTrackingConstants = {
  // Configurações de scroll
  SCROLL_SPEED: 800,
  SCROLL_NOISE_THRESHOLD: 0.003,
  
  // Distâncias de detecção (em pixels)
  PINCH_DISTANCE: 40,
  SCROLL_FINGER_DISTANCE: 60,
  
  // Índices MediaPipe dos landmarks de mão
  FINGER_TIPS: [8, 12, 16, 20] as const,
  FINGER_PIPS: [6, 10, 14, 18] as const,
  THUMB_TIP_INDEX: 4,
  WRIST_INDEX: 0,
} as const;