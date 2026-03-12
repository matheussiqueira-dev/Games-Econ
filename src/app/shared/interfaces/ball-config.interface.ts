// ── Configuração de renderização para bolas visuais do hand-tracking ─────
export interface iBallConfig {
  radius: number;
  glowBlur: number;
  glowColor: string;
  bodyStops: { offset: number; color: string }[];
  innerRadius: number;
  highlightOffset: number;
  borderColor: string;
  borderWidth: number;
}