import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { AggregatedIocResult, IocType, ProviderResult } from '@tid/shared';
import type { ThreatProvider } from '../../providers/types.js';
import { ProviderRegistry } from '../../providers/registry.js';
import { AppError } from '../../errors/app-error.js';
import type { CacheService } from '../cache/cache.service.js';
import type { HistoryService } from '../history/history.service.js';
import { SearchOrchestratorService } from './search-orchestrator.service.js';

function fakeCache(seed?: AggregatedIocResult): CacheService {
  const store = new Map<string, AggregatedIocResult>();
  if (seed) {
    store.set(`${seed.type}:${seed.ioc}`, seed);
  }
  return {
    get: (iocType: IocType, ioc: string) => store.get(`${iocType}:${ioc}`),
    set: (iocType: IocType, ioc: string, value: AggregatedIocResult) => {
      store.set(`${iocType}:${ioc}`, value);
    },
  } as unknown as CacheService;
}

function fakeHistory(): HistoryService & { records: AggregatedIocResult[] } {
  const records: AggregatedIocResult[] = [];
  return {
    records,
    record: (result: AggregatedIocResult) => {
      records.push(result);
    },
  } as unknown as HistoryService & { records: AggregatedIocResult[] };
}

function fakeProvider(name: string, result: ProviderResult, supported: IocType[] = ['ip', 'domain', 'url', 'hash']): ThreatProvider {
  return {
    name,
    supports: (iocType) => supported.includes(iocType),
    lookup: async () => result,
  };
}

describe('SearchOrchestratorService', () => {
  it('rejects an input that cannot be classified as any IOC type', async () => {
    const orchestrator = new SearchOrchestratorService(new ProviderRegistry([]));
    await assert.rejects(() => orchestrator.search('not a valid ioc!!!'), AppError);
  });

  it('normalizes the ioc and aggregates provider results', async () => {
    const provider = fakeProvider('VirusTotal', {
      provider: 'VirusTotal',
      status: 'ok',
      verdict: 'malicious',
      score: 80,
      summary: 'flagged',
      details: [],
    });
    const orchestrator = new SearchOrchestratorService(new ProviderRegistry([provider]));

    const result = await orchestrator.search('  Malicious.Example.COM  ');

    assert.equal(result.ioc, 'malicious.example.com');
    assert.equal(result.type, 'domain');
    assert.equal(result.verdict, 'malicious');
    assert.equal(result.score, 80);
    assert.equal(result.cached, false);
    assert.equal(result.providers.length, 1);
  });

  it('throws an upstream error when no provider is configured for the detected type', async () => {
    const orchestrator = new SearchOrchestratorService(new ProviderRegistry([]));

    await assert.rejects(() => orchestrator.search('8.8.8.8'), (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.statusCode, 502);
      return true;
    });
  });

  it('throws an upstream error when every provider is unavailable', async () => {
    const provider = fakeProvider('VirusTotal', {
      provider: 'VirusTotal',
      status: 'unavailable',
      verdict: 'unknown',
      summary: '',
      details: [],
    });
    const orchestrator = new SearchOrchestratorService(new ProviderRegistry([provider]));

    await assert.rejects(() => orchestrator.search('8.8.8.8'), (error: unknown) => {
      assert.ok(error instanceof AppError);
      assert.equal(error.statusCode, 502);
      return true;
    });
  });

  it('returns a cached result with cached: true and skips provider calls on a cache hit', async () => {
    let callCount = 0;
    const provider: ThreatProvider = {
      name: 'VirusTotal',
      supports: () => true,
      lookup: async () => {
        callCount += 1;
        return { provider: 'VirusTotal', status: 'ok', verdict: 'clean', score: 10, summary: '', details: [] };
      },
    };
    const cache = fakeCache({
      ioc: '8.8.8.8',
      type: 'ip',
      verdict: 'malicious',
      score: 90,
      providers: [],
      cached: false,
      fetchedAt: new Date().toISOString(),
    });
    const orchestrator = new SearchOrchestratorService(new ProviderRegistry([provider]), cache);

    const result = await orchestrator.search('8.8.8.8');

    assert.equal(result.cached, true);
    assert.equal(result.verdict, 'malicious');
    assert.equal(callCount, 0);
  });

  it('writes through to the cache on a miss so subsequent searches are served as cached', async () => {
    const provider = fakeProvider('VirusTotal', {
      provider: 'VirusTotal',
      status: 'ok',
      verdict: 'clean',
      score: 5,
      summary: '',
      details: [],
    });
    const cache = fakeCache();
    const orchestrator = new SearchOrchestratorService(new ProviderRegistry([provider]), cache);

    const first = await orchestrator.search('8.8.8.8');
    const second = await orchestrator.search('8.8.8.8');

    assert.equal(first.cached, false);
    assert.equal(second.cached, true);
  });

  it('records a history entry for a fresh search', async () => {
    const provider = fakeProvider('VirusTotal', {
      provider: 'VirusTotal',
      status: 'ok',
      verdict: 'clean',
      score: 5,
      summary: '',
      details: [],
    });
    const history = fakeHistory();
    const orchestrator = new SearchOrchestratorService(new ProviderRegistry([provider]), undefined, history);

    await orchestrator.search('8.8.8.8');

    assert.equal(history.records.length, 1);
    assert.equal(history.records[0]?.ioc, '8.8.8.8');
  });

  it('records a history entry on a cache hit', async () => {
    const provider = fakeProvider('VirusTotal', {
      provider: 'VirusTotal',
      status: 'ok',
      verdict: 'clean',
      score: 5,
      summary: '',
      details: [],
    });
    const cache = fakeCache({
      ioc: '8.8.8.8',
      type: 'ip',
      verdict: 'malicious',
      score: 90,
      providers: [],
      cached: false,
      fetchedAt: new Date().toISOString(),
    });
    const history = fakeHistory();
    const orchestrator = new SearchOrchestratorService(new ProviderRegistry([provider]), cache, history);

    await orchestrator.search('8.8.8.8');

    assert.equal(history.records.length, 1);
  });
});
