/**
 * Configuração do ambiente de produção.
 * Este arquivo substitui `environment.ts` durante `ng build --configuration production`.
 */
export const environment = {
  production: true,

  /** URL base da API back-end em produção. */
  apiUrl: 'https://api.games-econ.com/api',

  /** CDN raiz do MediaPipe. */
  mediapipeCdn: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',

  /** Em produção apenas erros são registrados. */
  logLevel: 'error' as const,

  /** Nível mínimo de confiança de detecção de mão aceito. */
  handDetectionMinConfidence: 0.6,

  /** Metadados do projeto. */
  app: {
    name: 'Games-ECON',
    version: '1.0.0',
    author: 'Matheus Siqueira',
    website: 'https://www.matheussiqueira.dev/',
  },
} as const;
