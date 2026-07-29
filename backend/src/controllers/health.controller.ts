import type { Request, Response } from 'express';
import type { ApiSuccessResponse } from '@tid/shared';

export function getHealth(_req: Request, res: Response): void {
  const body: ApiSuccessResponse<{ status: string }> = { ok: true, data: { status: 'up' } };
  res.status(200).json(body);
}
