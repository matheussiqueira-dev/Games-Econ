/**
 * Configuração do ambiente de desenvolvimento.
 * Substituída automaticamente pelo Angular CLI em builds de produção
 * usando `fileReplacements` no angular.json.
 */
export const environment = {
  production: false,

  /** URL base da API back-end. */
  apiUrl: 'http://localhost:3000/api',

  /** CDN raiz do MediaPipe — altere para espelhar interno se necessário. */
  mediapipeCdn: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands',

  /** Nível de log: 'debug' | 'info' | 'warn' | 'error'. */
  logLevel: 'debug' as const,

  /** Nível mínimo de confiança de detecção de mão aceito. */
  handDetectionMinConfidence: 0.5,

  /** Metadados do projeto. */
  app: {
    name: 'Games-ECON',
    version: '1.0.0',
    author: 'Matheus Siqueira',
    website: 'https://www.matheussiqueira.dev/',
  },
} as const;
