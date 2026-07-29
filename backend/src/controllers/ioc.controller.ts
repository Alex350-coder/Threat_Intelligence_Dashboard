import type { Request, Response } from 'express';
import type { AggregatedIocResult, ApiSuccessResponse } from '@tid/shared';
import { z } from 'zod';
import { AppError } from '../errors/app-error.js';
import type { SearchOrchestratorService } from '../services/search/search-orchestrator.service.js';

const searchRequestSchema = z.object({
  value: z.string().trim().min(1).max(2048),
});

export function createIocController(orchestrator: SearchOrchestratorService) {
  return {
    async search(req: Request, res: Response): Promise<void> {
      const parsed = searchRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        throw AppError.badRequest('Request body must be an object with a non-empty string "value" field.');
      }

      const result = await orchestrator.search(parsed.data.value);
      const body: ApiSuccessResponse<AggregatedIocResult> = { ok: true, data: result };
      res.status(200).json(body);
    },
  };
}
