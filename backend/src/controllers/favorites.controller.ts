import type { Request, Response } from 'express';
import type { ApiSuccessResponse, FavoriteEntry, FavoriteToggleResult } from '@tid/shared';
import { z } from 'zod';
import { AppError } from '../errors/app-error.js';
import type { FavoritesService } from '../services/favorites/favorites.service.js';

const toggleRequestSchema = z.object({
  ioc: z.string().trim().min(1).max(2048),
  type: z.enum(['ip', 'domain', 'url', 'hash']),
  verdict: z.enum(['malicious', 'suspicious', 'clean', 'unknown']),
  score: z.number().min(0).max(100),
});

export function createFavoritesController(favorites: FavoritesService) {
  return {
    list(_req: Request, res: Response): void {
      const entries = favorites.list();
      const body: ApiSuccessResponse<FavoriteEntry[]> = { ok: true, data: entries };
      res.status(200).json(body);
    },

    toggle(req: Request, res: Response): void {
      const parsed = toggleRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.badRequest('Request body must include "ioc", "type", "verdict", and "score".');
      }

      const result = favorites.toggle(parsed.data);
      const body: ApiSuccessResponse<FavoriteToggleResult> = { ok: true, data: result };
      res.status(200).json(body);
    },
  };
}
