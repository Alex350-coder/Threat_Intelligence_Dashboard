import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { IocType, ProviderResult } from '@tid/shared';
import type { ThreatProvider } from '../../providers/types.js';
import { ProviderRegistry } from '../../providers/registry.js';
import { AppError } from '../../errors/app-error.js';
import { SearchOrchestratorService } from './search-orchestrator.service.js';

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
});
