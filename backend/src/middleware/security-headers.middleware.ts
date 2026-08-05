import type { Request, Response, NextFunction } from 'express';

export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  // This is a JSON-only API — it never renders HTML, so no source category needs to be allowed.
  res.setHeader('Content-Security-Policy', "default-src 'none'");

  // req.secure already resolves X-Forwarded-Proto correctly once Express's `trust proxy` hop
  // count is configured (see app.ts) — reading the header directly here would trust it even
  // when no proxy hop is configured to guarantee it's genuine.
  if (req.secure) {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains');
  }

  next();
}
