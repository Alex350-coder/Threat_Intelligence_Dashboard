import { describe, it, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { fetchWithTimeout } from './http.js';

describe('fetchWithTimeout', () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('resolves with the parsed JSON body on a successful response', async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ ok: true }), { status: 200 })) as typeof fetch;

    const result = await fetchWithTimeout('https://example.com/ok');
    assert.deepEqual(result, { ok: true });
  });

  it('rejects when the response is a non-2xx status', async () => {
    globalThis.fetch = (async () => new Response('', { status: 500 })) as typeof fetch;

    await assert.rejects(() => fetchWithTimeout('https://example.com/broken'), /failed with status 500/);
  });

  it('rejects when the underlying fetch rejects (network failure)', async () => {
    globalThis.fetch = (async () => {
      throw new Error('network down');
    }) as typeof fetch;

    await assert.rejects(() => fetchWithTimeout('https://example.com/unreachable'), /network down/);
  });

  it('aborts and rejects once the timeout elapses', async () => {
    globalThis.fetch = ((_url: string, init?: RequestInit) =>
      new Promise((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        });
      })) as typeof fetch;

    await assert.rejects(
      () => fetchWithTimeout('https://example.com/slow', { timeoutMs: 5 }),
      (error: unknown) => error instanceof DOMException && error.name === 'AbortError',
    );
  });
});
