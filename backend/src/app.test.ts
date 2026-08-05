import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import request from 'supertest';
import type { IocType, ProviderResult } from '@tid/shared';
import type { ThreatProvider } from './providers/types.js';
import { ProviderRegistry } from './providers/registry.js';
import { SearchOrchestratorService } from './services/search/search-orchestrator.service.js';
import { SqliteHistoryRepository } from './services/history/history.repository.js';
import { HistoryService } from './services/history/history.service.js';
import { SqliteFavoritesRepository } from './services/favorites/favorites.repository.js';
import { FavoritesService } from './services/favorites/favorites.service.js';
import { createApp, type AppDependencies } from './app.js';

const SCHEMA = `
  CREATE TABLE searches (
    id TEXT PRIMARY KEY,
    iocValue TEXT NOT NULL,
    iocType TEXT NOT NULL,
    verdict TEXT NOT NULL,
    score REAL NOT NULL,
    createdAt TEXT NOT NULL
  );
  CREATE TABLE favorites (
    id TEXT PRIMARY KEY,
    iocValue TEXT NOT NULL UNIQUE,
    iocType TEXT NOT NULL,
    verdict TEXT NOT NULL,
    score REAL NOT NULL,
    createdAt TEXT NOT NULL
  );
`;

function fakeProvider(name: string, result: ProviderResult, supported: IocType[] = ['ip', 'domain', 'url', 'hash']): ThreatProvider {
  return {
    name,
    supports: (iocType) => supported.includes(iocType),
    lookup: async () => result,
  };
}

const okResult: ProviderResult = {
  provider: 'VirusTotal',
  status: 'ok',
  verdict: 'malicious',
  score: 80,
  summary: '',
  details: [],
};

const unavailableResult: ProviderResult = {
  provider: 'AbuseIPDB',
  status: 'unavailable',
  verdict: 'unknown',
  summary: '',
  details: [],
};

function buildApp(
  providers: ThreatProvider[],
  overrides: Partial<Pick<AppDependencies['config'], 'rateLimitWindowMs' | 'rateLimitMaxRequests'>> = {},
) {
  const db = new DatabaseSync(':memory:');
  db.exec(SCHEMA);
  const history = new HistoryService(new SqliteHistoryRepository(db, 100));
  const favorites = new FavoritesService(new SqliteFavoritesRepository(db));
  const orchestrator = new SearchOrchestratorService(new ProviderRegistry(providers), undefined, history);

  const config = {
    corsOrigin: 'http://localhost:5173',
    rateLimitWindowMs: 60_000,
    rateLimitMaxRequests: 1000,
    trustProxyHops: 0,
    ...overrides,
  };

  return createApp({ config, orchestrator, history, favorites });
}

describe('POST /api/ioc/search', () => {
  it('returns 200 with an aggregated result on the happy path', async () => {
    const app = buildApp([fakeProvider('VirusTotal', okResult)]);

    const res = await request(app).post('/api/ioc/search').send({ value: '8.8.8.8' });

    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.data.verdict, 'malicious');
    assert.equal(res.body.data.providers.length, 1);
  });

  it('returns 200 with a provider marked unavailable on partial failure', async () => {
    const app = buildApp([fakeProvider('VirusTotal', okResult), fakeProvider('AbuseIPDB', unavailableResult, ['ip'])]);

    const res = await request(app).post('/api/ioc/search').send({ value: '8.8.8.8' });

    assert.equal(res.status, 200);
    const statuses = res.body.data.providers.map((p: ProviderResult) => p.status);
    assert.deepEqual(statuses.sort(), ['ok', 'unavailable']);
  });

  it('returns 502 when every provider is unavailable', async () => {
    const app = buildApp([fakeProvider('VirusTotal', unavailableResult)]);

    const res = await request(app).post('/api/ioc/search').send({ value: '8.8.8.8' });

    assert.equal(res.status, 502);
    assert.equal(res.body.ok, false);
    assert.equal(res.body.error.code, 'UPSTREAM_ERROR');
  });

  it('returns 400 for an invalid IOC value', async () => {
    const app = buildApp([fakeProvider('VirusTotal', okResult)]);

    const res = await request(app).post('/api/ioc/search').send({ value: 'not a valid ioc !!!' });

    assert.equal(res.status, 400);
    assert.equal(res.body.ok, false);
    assert.equal(res.body.error.code, 'BAD_REQUEST');
  });

  it('returns 400 when the request body is missing "value"', async () => {
    const app = buildApp([fakeProvider('VirusTotal', okResult)]);

    const res = await request(app).post('/api/ioc/search').send({});

    assert.equal(res.status, 400);
  });

  it('returns 429 once the rate limit is exceeded', async () => {
    const app = buildApp([fakeProvider('VirusTotal', okResult)], { rateLimitMaxRequests: 1 });

    const first = await request(app).post('/api/ioc/search').send({ value: '8.8.8.8' });
    const second = await request(app).post('/api/ioc/search').send({ value: '8.8.8.8' });

    assert.equal(first.status, 200);
    assert.equal(second.status, 429);
    assert.equal(second.body.error.code, 'RATE_LIMITED');
  });
});

describe('History endpoints', () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    app = buildApp([fakeProvider('VirusTotal', okResult)]);
  });

  it('lists recorded searches and supports delete/clear', async () => {
    await request(app).post('/api/ioc/search').send({ value: '8.8.8.8' });
    await request(app).post('/api/ioc/search').send({ value: '1.1.1.1' });

    const list = await request(app).get('/api/history');
    assert.equal(list.status, 200);
    assert.equal(list.body.data.length, 2);

    const id = list.body.data[0].id;
    const remove = await request(app).delete(`/api/history/${id}`);
    assert.equal(remove.status, 204);

    const afterRemove = await request(app).get('/api/history');
    assert.equal(afterRemove.body.data.length, 1);

    const clear = await request(app).delete('/api/history');
    assert.equal(clear.status, 204);

    const afterClear = await request(app).get('/api/history');
    assert.equal(afterClear.body.data.length, 0);
  });
});

describe('Favorites endpoints', () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    app = buildApp([fakeProvider('VirusTotal', okResult)]);
  });

  it('toggles a favorite on and off', async () => {
    const toggleOn = await request(app)
      .post('/api/favorites/toggle')
      .send({ ioc: '8.8.8.8', type: 'ip', verdict: 'malicious', score: 80 });
    assert.equal(toggleOn.status, 200);
    assert.equal(toggleOn.body.data.favorited, true);

    const list = await request(app).get('/api/favorites');
    assert.equal(list.status, 200);
    assert.equal(list.body.data.length, 1);

    const toggleOff = await request(app)
      .post('/api/favorites/toggle')
      .send({ ioc: '8.8.8.8', type: 'ip', verdict: 'malicious', score: 80 });
    assert.equal(toggleOff.body.data.favorited, false);

    const afterToggleOff = await request(app).get('/api/favorites');
    assert.equal(afterToggleOff.body.data.length, 0);
  });

  it('returns 400 for an invalid toggle payload', async () => {
    const res = await request(app).post('/api/favorites/toggle').send({ ioc: '8.8.8.8' });
    assert.equal(res.status, 400);
  });
});
