import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { VirusTotalProvider } from './virustotal.provider.js';

describe('VirusTotalProvider', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('supports ip, domain, url, and hash', () => {
    const provider = new VirusTotalProvider('key');
    assert.equal(provider.supports('ip'), true);
    assert.equal(provider.supports('domain'), true);
    assert.equal(provider.supports('url'), true);
    assert.equal(provider.supports('hash'), true);
  });

  it('returns unavailable without calling fetch when no API key is configured', async () => {
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response('{}', { status: 200 });
    }) as typeof fetch;

    const provider = new VirusTotalProvider('');
    const result = await provider.lookup('8.8.8.8');

    assert.equal(result.status, 'unavailable');
    assert.equal(called, false);
  });

  it('returns unavailable without calling fetch when the IOC cannot be classified', async () => {
    let called = false;
    globalThis.fetch = (async () => {
      called = true;
      return new Response('{}', { status: 200 });
    }) as typeof fetch;

    const provider = new VirusTotalProvider('key');
    const result = await provider.lookup('not a valid ioc !!!');

    assert.equal(result.status, 'unavailable');
    assert.equal(called, false);
  });

  it('maps a successful response to a normalized result', async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          data: {
            attributes: {
              last_analysis_stats: { malicious: 3, suspicious: 1, undetected: 60, harmless: 6, timeout: 0 },
            },
          },
        }),
        { status: 200 },
      )) as typeof fetch;

    const provider = new VirusTotalProvider('key');
    const result = await provider.lookup('8.8.8.8');

    assert.equal(result.status, 'ok');
    assert.equal(result.verdict, 'malicious');
  });

  it('returns unavailable and never rejects when the network call fails', async () => {
    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;

    const provider = new VirusTotalProvider('key');
    const result = await provider.lookup('8.8.8.8');

    assert.equal(result.status, 'unavailable');
  });

  it('returns unavailable when the upstream responds with a non-2xx status', async () => {
    globalThis.fetch = (async () => new Response('', { status: 500 })) as typeof fetch;

    const provider = new VirusTotalProvider('key');
    const result = await provider.lookup('8.8.8.8');

    assert.equal(result.status, 'unavailable');
  });
});
