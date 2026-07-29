import type { ApiErrorCode } from '@tid/shared';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ApiErrorCode;

  constructor(code: ApiErrorCode, message: string, statusCode: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
  }

  static badRequest(message: string): AppError {
    return new AppError('BAD_REQUEST', message, 400);
  }

  static notFound(message: string): AppError {
    return new AppError('NOT_FOUND', message, 404);
  }

  static rateLimited(message: string): AppError {
    return new AppError('RATE_LIMITED', message, 429);
  }

  static internal(message = 'Internal server error'): AppError {
    return new AppError('INTERNAL_ERROR', message, 500);
  }
}
