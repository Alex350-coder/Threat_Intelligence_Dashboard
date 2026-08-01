import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { getHealth } from './controllers/health.controller.js';
import { createIocController } from './controllers/ioc.controller.js';
import { createHistoryController } from './controllers/history.controller.js';
import { logger } from './config/logger.js';
import { loadConfig } from './config/env.js';
import { securityHeaders } from './middleware/security-headers.middleware.js';
import { requestLogger } from './middleware/request-logger.middleware.js';
import { createRateLimiter } from './middleware/rate-limiter.middleware.js';
import { notFoundHandler } from './middleware/not-found.middleware.js';
import { errorHandler } from './middleware/error-handler.middleware.js';
import { asyncHandler } from './middleware/async-handler.js';
import { createProviderRegistry } from './providers/index.js';
import { SearchOrchestratorService } from './services/search/search-orchestrator.service.js';
import { getDb } from './db/connection.js';
import { SqliteCacheRepository } from './services/cache/cache.repository.js';
import { CacheService } from './services/cache/cache.service.js';
import { SqliteHistoryRepository } from './services/history/history.repository.js';
import { HistoryService } from './services/history/history.service.js';

function bootstrap(): void {
  const config = loadConfig();
  const registry = createProviderRegistry(config);
  const db = getDb(config.dbPath);
  const cache = new CacheService(new SqliteCacheRepository(db), config.cacheTtlSeconds);
  const history = new HistoryService(new SqliteHistoryRepository(db, config.historyLimit));
  const orchestrator = new SearchOrchestratorService(registry, cache, history);
  const iocController = createIocController(orchestrator);
  const historyController = createHistoryController(history);

  const app = express();
  app.use(securityHeaders);
  app.use(cors({ origin: config.corsOrigin }));
  app.use(requestLogger);
  app.use(createRateLimiter(config));
  app.use(express.json());

  app.get('/health', getHealth);
  app.post('/api/ioc/search', asyncHandler(iocController.search));
  app.get('/api/history', asyncHandler(async (req, res) => historyController.list(req, res)));
  app.delete('/api/history/:id', asyncHandler(async (req, res) => historyController.remove(req, res)));
  app.delete('/api/history', asyncHandler(async (req, res) => historyController.clear(req, res)));

  app.use(notFoundHandler);
  app.use(errorHandler);

  const server = app.listen(config.port, () => {
    logger.info('Backend listening', { port: config.port });
  });

  server.on('error', (error) => {
    logger.error('Server failed to start', { detail: error.message });
    process.exit(1);
  });
}

try {
  bootstrap();
} catch (error) {
  const detail = error instanceof Error ? error.message : String(error);
  logger.error('Boot failed', { detail });
  process.exit(1);
}
