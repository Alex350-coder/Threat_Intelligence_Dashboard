import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { AbuseIpDbProvider } from './abuseipdb.provider.js';

describe('AbuseIpDbProvider', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('supports only the ip IOC type', () => {
    const provider = new AbuseIpDbProvider('key');
    assert.equal(provider.supports('ip'), true);
    assert.equal(provider.supports('domain'), false);
    assert.equal(provider.supports('url'), false);
    assert.equal(provider.supports('hash'), false);
  });

  it('returns unavailable without calling fetch when no API key is configured', async () => {
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response('{}', { status: 200 });
    }) as typeof fetch;

    const provider = new AbuseIpDbProvider('');
    const result = await provider.lookup('8.8.8.8');

    assert.equal(result.status, 'unavailable');
    assert.equal(called, false);
  });

  it('returns unavailable without calling fetch for a malformed IP', async () => {
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response('{}', { status: 200 });
    }) as typeof fetch;

    const provider = new AbuseIpDbProvider('key');
    const result = await provider.lookup('not-an-ip');

    assert.equal(result.status, 'unavailable');
    assert.equal(called, false);
  });

  it('maps a successful response to a normalized result', async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          data: {
            ipAddress: '8.8.8.8',
            abuseConfidenceScore: 90,
            countryCode: 'US',
            isp: 'Google',
            usageType: 'Data Center',
            totalReports: 12,
            lastReportedAt: '2026-01-01T00:00:00Z',
          },
        }),
        { status: 200 },
      )) as typeof fetch;

    const provider = new AbuseIpDbProvider('key');
    const result = await provider.lookup('8.8.8.8');

    assert.equal(result.status, 'ok');
    assert.equal(result.verdict, 'malicious');
    assert.equal(result.score, 90);
  });

  it('returns unavailable and never rejects when the network call fails', async () => {
    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;

    const provider = new AbuseIpDbProvider('key');
    const result = await provider.lookup('8.8.8.8');

    assert.equal(result.status, 'unavailable');
  });

  it('returns unavailable when the upstream responds with a non-2xx status', async () => {
    globalThis.fetch = (async () => new Response('', { status: 500 })) as typeof fetch;

    const provider = new AbuseIpDbProvider('key');
    const result = await provider.lookup('8.8.8.8');

    assert.equal(result.status, 'unavailable');
  });
});
