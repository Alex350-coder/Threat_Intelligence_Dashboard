import type { Request, Response } from 'express';
import type { ApiSuccessResponse, HistoryEntry } from '@tid/shared';
import { z } from 'zod';
import { AppError } from '../errors/app-error.js';
import type { HistoryService } from '../services/history/history.service.js';

const listQuerySchema = z.object({
  limit: z.coerce.number().int().positive().max(500).optional(),
});

const idParamSchema = z.object({
  id: z.string().trim().min(1),
});

export function createHistoryController(history: HistoryService) {
  return {
    list(req: Request, res: Response): void {
      const parsed = listQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw AppError.badRequest('Query parameter "limit" must be a positive integer.');
      }

      const entries = history.list(parsed.data.limit);
      const body: ApiSuccessResponse<HistoryEntry[]> = { ok: true, data: entries };
      res.status(200).json(body);
    },

    remove(req: Request, res: Response): void {
      const parsed = idParamSchema.safeParse(req.params);
      if (!parsed.success) {
        throw AppError.badRequest('A history entry id is required.');
      }

      history.deleteById(parsed.data.id);
      res.status(204).send();
    },

    clear(_req: Request, res: Response): void {
      history.clear();
      res.status(204).send();
    },
  };
}
