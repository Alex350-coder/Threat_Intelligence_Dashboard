import rateLimit from 'express-rate-limit';
import type { AppConfig } from '../config/env.js';
import type { ApiErrorResponse } from '@tid/shared';

export function createRateLimiter(config: AppConfig): ReturnType<typeof rateLimit> {
  return rateLimit({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMaxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
      const body: ApiErrorResponse = {
        ok: false,
        error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later.' },
      };
      res.status(429).json(body);
    },
  });
}
