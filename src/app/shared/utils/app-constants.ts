import { environment } from '../../../environments/environment';

/**
 * Constantes globais da aplicacao.
 *
 * Prefira `environment.*` para valores que variam entre dev e prod.
 * Use este arquivo para constantes que sao fixas em todos os ambientes.
 */
export const AppConstants = {
  /** Informacoes publicas do autor e projeto. */
  APP_NAME:    environment.app.name,
  APP_VERSION: environment.app.version,
  AUTHOR:      environment.app.author,
  WEBSITE:     environment.app.website,

  /** URL base da API — sempre use `environment.apiUrl` no HttpClient. */
  API_URL: environment.apiUrl,

  /** Locale padrao da aplicacao. */
  DEFAULT_LOCALE: 'pt-BR',

  /** Timeout global para requisicoes HTTP (ms). */
  REQUEST_TIMEOUT_MS: 8000,

  /** Configuracoes de autenticacao. */
  AUTH: {
    TOKEN_KEY:         'ge_auth_token',
    REFRESH_TOKEN_KEY: 'ge_refresh_token',
    SESSION_KEY:       'ge_session',
  },

  /** Rotas principais — evita strings magicas nos componentes. */
  ROUTES: {
    HOME:          '/',
    LOGIN:         '/login',
    SIGN_UP:       '/sign-up',
    DASHBOARD:     '/play-dashboard',
    PLAY:          '/play-game',
  },
} as const;
