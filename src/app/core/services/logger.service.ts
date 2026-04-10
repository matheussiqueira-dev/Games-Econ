import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/** Níveis de log suportados, do menos para o mais severo. */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVEL_RANK: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Serviço centralizado de logging.
 *
 * Em produção apenas mensagens de nível `error` (ou superior) são exibidas.
 * Em desenvolvimento todos os níveis são exibidos, incluindo `debug`.
 *
 * Uso:
 * ```ts
 * this.logger.debug('[MyComponent] inicializando', { dados });
 * this.logger.error('[MyService] falha na requisição', error);
 * ```
 */
@Injectable({ providedIn: 'root' })
export class LoggerService {
  private readonly minLevel: LogLevel = environment.logLevel;
  private readonly prefix = `[${environment.app.name}]`;

  /** Mensagem de diagnóstico — só exibida em desenvolvimento. */
  debug(message: string, ...args: unknown[]): void {
    this.log('debug', message, ...args);
  }

  /** Mensagem informativa sobre fluxos normais da aplicação. */
  info(message: string, ...args: unknown[]): void {
    this.log('info', message, ...args);
  }

  /** Aviso sobre situação inesperada mas não crítica. */
  warn(message: string, ...args: unknown[]): void {
    this.log('warn', message, ...args);
  }

  /**
   * Erro que impede um fluxo de completar.
   * Em produção pode ser encaminhado a um serviço de rastreamento (ex.: Sentry).
   */
  error(message: string, error?: unknown): void {
    this.log('error', message, error);
    // TODO: integrar Sentry / Datadog em produção
    // if (environment.production) { Sentry.captureException(error); }
  }

  // ── Privado ─────────────────────────────────────────────────────────────

  private log(level: LogLevel, message: string, ...args: unknown[]): void {
    if (LOG_LEVEL_RANK[level] < LOG_LEVEL_RANK[this.minLevel]) {
      return;
    }

    const timestamp = new Date().toISOString();
    const label = `${this.prefix} [${level.toUpperCase()}] ${timestamp}`;

    switch (level) {
      case 'debug': console.debug(label, message, ...args); break;
      case 'info':  console.info(label, message, ...args);  break;
      case 'warn':  console.warn(label, message, ...args);  break;
      case 'error': console.error(label, message, ...args); break;
    }
  }
}
