import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import type { AggregatedIocResult } from '@tid/shared';
import { SqliteCacheRepository } from './cache.repository.js';

function sampleResult(overrides: Partial<AggregatedIocResult> = {}): AggregatedIocResult {
  return {
    ioc: '8.8.8.8',
    type: 'ip',
    verdict: 'clean',
    score: 0,
    providers: [],
    cached: false,
    fetchedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('SqliteCacheRepository', () => {
  let db: DatabaseSync;
  let repository: SqliteCacheRepository;

  beforeEach(() => {
    db = new DatabaseSync(':memory:');
    db.exec(`
      CREATE TABLE cache (
        key TEXT PRIMARY KEY,
        resultJson TEXT NOT NULL,
        fetchedAt TEXT NOT NULL,
        expiresAt TEXT NOT NULL
      );
    `);
    repository = new SqliteCacheRepository(db);
  });

  it('returns undefined for a missing key', () => {
    assert.equal(repository.get('ip:1.1.1.1'), undefined);
  });

  it('stores and retrieves a value before expiry', () => {
    const value = sampleResult();
    repository.set('ip:8.8.8.8', value, 60);

    const fetched = repository.get('ip:8.8.8.8');
    assert.deepEqual(fetched, value);
  });

  it('overwrites an existing entry for the same key', () => {
    repository.set('ip:8.8.8.8', sampleResult({ verdict: 'clean' }), 60);
    repository.set('ip:8.8.8.8', sampleResult({ verdict: 'malicious' }), 60);

    assert.equal(repository.get('ip:8.8.8.8')?.verdict, 'malicious');
  });

  it('treats an expired entry as a miss and removes it', () => {
    repository.set('ip:8.8.8.8', sampleResult(), -1);

    assert.equal(repository.get('ip:8.8.8.8'), undefined);
    assert.equal(repository.get('ip:8.8.8.8'), undefined);
  });
});
