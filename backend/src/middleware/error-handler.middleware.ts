import type { Request, Response, NextFunction } from 'express';
import type { ApiErrorResponse } from '@tid/shared';
import { AppError } from '../errors/app-error.js';
import { logger } from '../config/logger.js';

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Express only recognizes error middleware with a 4-arg signature
  _next: NextFunction,
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : 'INTERNAL_ERROR';
  const message = isAppError ? err.message : 'Internal server error';

  logger.error('Request failed', {
    // req.path (not req.originalUrl) — keeps the query string out of error logs too, matching
    // request-logger.middleware.ts.
    path: req.path,
    method: req.method,
    statusCode,
    code,
    detail: err instanceof Error ? err.message : String(err),
  });

  const body: ApiErrorResponse = { ok: false, error: { code, message } };
  res.status(statusCode).json(body);
}
