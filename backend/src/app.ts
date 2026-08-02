import express, { type Express } from 'express';
import cors from 'cors';
import { getHealth } from './controllers/health.controller.js';
import { createIocController } from './controllers/ioc.controller.js';
import { createHistoryController } from './controllers/history.controller.js';
import { createFavoritesController } from './controllers/favorites.controller.js';
import type { AppConfig } from './config/env.js';
import { securityHeaders } from './middleware/security-headers.middleware.js';
import { requestLogger } from './middleware/request-logger.middleware.js';
import { createRateLimiter } from './middleware/rate-limiter.middleware.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import { errorHandler } from './middleware/error-handler.middleware.js';
import { asyncHandler } from './middleware/async-handler.js';
import type { SearchOrchestratorService } from './services/search/search-orchestrator.service.js';
import type { HistoryService } from './services/history/history.service.js';
import type { FavoritesService } from './services/favorites/favorites.service.js';

export interface AppDependencies {
  config: Pick<AppConfig, 'corsOrigin' | 'rateLimitWindowMs' | 'rateLimitMaxRequests'>;
  orchestrator: SearchOrchestratorService;
  history: HistoryService;
  favorites: FavoritesService;
}

/** Assembles the Express app without binding a listener, so it can be mounted directly in tests (e.g. via supertest). */
export function createApp(deps: AppDependencies): Express {
  const iocController = createIocController(deps.orchestrator);
  const historyController = createHistoryController(deps.history);
  const favoritesController = createFavoritesController(deps.favorites);

  const app = express();
  app.use(securityHeaders);
  app.use(cors({ origin: deps.config.corsOrigin }));
  app.use(requestLogger);
  app.use(createRateLimiter(deps.config));
  app.use(express.json());

  app.get('/health', getHealth);
  app.post('/api/ioc/search', asyncHandler(iocController.search));
  app.get('/api/history', asyncHandler(async (req, res) => historyController.list(req, res)));
  app.delete('/api/history/:id', asyncHandler(async (req, res) => historyController.remove(req, res)));
  app.delete('/api/history', asyncHandler(async (req, res) => historyController.clear(req, res)));
  app.get('/api/favorites', asyncHandler(async (req, res) => favoritesController.list(req, res)));
  app.post('/api/favorites/toggle', asyncHandler(async (req, res) => favoritesController.toggle(req, res)));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
