import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { IocType, ProviderResult } from '@tid/shared';
import type { ThreatProvider } from './types.js';
import { ProviderRegistry } from './registry.js';

function fakeProvider(name: string, supported: IocType[]): ThreatProvider {
  return {
    name,
    supports: (iocType) => supported.includes(iocType),
    lookup: async () => ({ provider: name, status: 'ok', verdict: 'unknown', summary: '', details: [] }) as ProviderResult,
  };
}

describe('ProviderRegistry', () => {
  it('returns only providers that support the given IOC type', () => {
    const ip = fakeProvider('AbuseIPDB', ['ip']);
    const all = fakeProvider('VirusTotal', ['ip', 'domain', 'url', 'hash']);
    const registry = new ProviderRegistry([ip, all]);

    assert.deepEqual(
      registry.getProvidersFor('ip').map((p) => p.name),
      ['AbuseIPDB', 'VirusTotal'],
    );
    assert.deepEqual(
      registry.getProvidersFor('domain').map((p) => p.name),
      ['VirusTotal'],
    );
  });

  it('returns an empty list when no provider supports the type', () => {
    const registry = new ProviderRegistry([fakeProvider('AbuseIPDB', ['ip'])]);
    assert.deepEqual(registry.getProvidersFor('hash'), []);
  });

  it('returns an empty list for an empty registry', () => {
    const registry = new ProviderRegistry([]);
    assert.deepEqual(registry.getProvidersFor('ip'), []);
  });
});
