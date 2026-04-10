import { Injectable } from '@angular/core';
import { LoggerService } from './logger.service';

/** Representa um erro normalizado exposto ao template. */
export interface AppError {
  /** Mensagem amigável para exibir ao usuário. */
  message: string;
  /** Código de status HTTP (quando aplicável). */
  statusCode?: number;
  /** Identificador técnico para diagnóstico. */
  code?: string;
}

/**
 * Serviço centralizado de tratamento de erros.
 *
 * Converte erros brutos (HTTP, runtime, desconhecidos) em uma estrutura
 * padronizada `AppError` e registra via `LoggerService`.
 *
 * Uso:
 * ```ts
 * try { ... }
 * catch (err) {
 *   const appError = this.errorHandler.handle(err, '[MyService] contexto');
 *   this.error.set(appError.message);
 * }
 * ```
 */
@Injectable({ providedIn: 'root' })
export class ErrorHandlerService {
  constructor(private readonly logger: LoggerService) {}

  /**
   * Normaliza qualquer erro para `AppError` e o registra.
   * @param error Erro capturado (qualquer tipo).
   * @param context Prefixo para identificar a origem do erro no log.
   */
  handle(error: unknown, context = '[App]'): AppError {
    const appError = this.normalize(error);
    this.logger.error(`${context} ${appError.message}`, error);
    return appError;
  }

  // ── Privado ─────────────────────────────────────────────────────────────

  private normalize(error: unknown): AppError {
    // Objeto com status HTTP (HttpErrorResponse-like)
    if (this.isHttpError(error)) {
      return {
        message: this.extractHttpMessage(error),
        statusCode: error['status'] as number,
        code: `HTTP_${error['status']}`,
      };
    }

    // Error nativo do JavaScript
    if (error instanceof Error) {
      return { message: error.message, code: error.name };
    }

    // String pura
    if (typeof error === 'string') {
      return { message: error };
    }

    return { message: 'Ocorreu um erro inesperado. Tente novamente.' };
  }

  private isHttpError(error: unknown): error is Record<string, unknown> {
    return (
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof (error as Record<string, unknown>)['status'] === 'number'
    );
  }

  private extractHttpMessage(error: Record<string, unknown>): string {
    const status = error['status'] as number;

    if (typeof error['error'] === 'object' && error['error'] !== null) {
      const body = error['error'] as Record<string, unknown>;
      if (typeof body['message'] === 'string') return body['message'];
    }

    const fallback: Record<number, string> = {
      0:   'Sem conexão com o servidor.',
      400: 'Requisição inválida.',
      401: 'Credenciais incorretas.',
      403: 'Acesso não autorizado.',
      404: 'Recurso não encontrado.',
      409: 'Conflito: esse recurso já existe.',
      422: 'Dados inválidos.',
      429: 'Muitas tentativas. Aguarde e tente novamente.',
      500: 'Erro interno do servidor.',
      503: 'Serviço indisponível.',
    };

    return fallback[status] ?? `Erro ${status}.`;
  }
}
