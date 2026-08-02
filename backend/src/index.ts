import 'dotenv/config';
import { logger } from './config/logger.js';
import { loadConfig } from './config/env.js';
import { createProviderRegistry } from './providers/index.js';
import { SearchOrchestratorService } from './services/search/search-orchestrator.service.js';
import { getDb } from './db/connection.js';
import { SqliteCacheRepository } from './services/cache/cache.repository.js';
import { CacheService } from './services/cache/cache.service.js';
import { SqliteHistoryRepository } from './services/history/history.repository.js';
import { HistoryService } from './services/history/history.service.js';
import { SqliteFavoritesRepository } from './services/favorites/favorites.repository.js';
import { FavoritesService } from './services/favorites/favorites.service.js';
import { createApp } from './app.js';

function bootstrap(): void {
  const config = loadConfig();
  const registry = createProviderRegistry(config);
  const db = getDb(config.dbPath);
  const cache = new CacheService(new SqliteCacheRepository(db), config.cacheTtlSeconds);
  const history = new HistoryService(new SqliteHistoryRepository(db, config.historyLimit));
  const orchestrator = new SearchOrchestratorService(registry, cache, history);
  const favorites = new FavoritesService(new SqliteFavoritesRepository(db));

  const app = createApp({ config, orchestrator, history, favorites });

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
