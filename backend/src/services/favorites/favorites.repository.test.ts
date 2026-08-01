import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import type { FavoriteEntry } from '@tid/shared';
import { SqliteFavoritesRepository } from './favorites.repository.js';

function sampleEntry(overrides: Partial<FavoriteEntry> = {}): FavoriteEntry {
  return {
    id: randomUUID(),
    iocValue: '8.8.8.8',
    iocType: 'ip',
    verdict: 'clean',
    score: 0,
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe('SqliteFavoritesRepository', () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = new DatabaseSync(':memory:');
    db.exec(`
      CREATE TABLE favorites (
        id TEXT PRIMARY KEY,
        iocValue TEXT NOT NULL UNIQUE,
        iocType TEXT NOT NULL,
        verdict TEXT NOT NULL,
        score REAL NOT NULL,
        createdAt TEXT NOT NULL
      );
    `);
  });

  it('adds and lists favorites newest first', () => {
    const repository = new SqliteFavoritesRepository(db);
    const older = sampleEntry({ iocValue: '1.1.1.1', createdAt: '2024-01-01T00:00:00.000Z' });
    const newer = sampleEntry({ iocValue: '2.2.2.2', createdAt: '2024-01-02T00:00:00.000Z' });

    repository.add(older);
    repository.add(newer);

    const entries = repository.list();
    assert.equal(entries.length, 2);
    assert.equal(entries[0]?.iocValue, '2.2.2.2');
    assert.equal(entries[1]?.iocValue, '1.1.1.1');
  });

  it('finds a favorite by ioc value', () => {
    const repository = new SqliteFavoritesRepository(db);
    const entry = sampleEntry();
    repository.add(entry);

    assert.equal(repository.findByIocValue(entry.iocValue)?.id, entry.id);
    assert.equal(repository.findByIocValue('missing'), undefined);
  });

  it('removes a favorite by ioc value and reports whether a row was deleted', () => {
    const repository = new SqliteFavoritesRepository(db);
    const entry = sampleEntry();
    repository.add(entry);

    assert.equal(repository.removeByIocValue(entry.iocValue), true);
    assert.equal(repository.list().length, 0);
    assert.equal(repository.removeByIocValue(entry.iocValue), false);
  });

  it('ignores a duplicate add instead of throwing, reporting no change', () => {
    const repository = new SqliteFavoritesRepository(db);
    const entry = sampleEntry();

    assert.equal(repository.add(entry), true);
    assert.equal(repository.add(sampleEntry({ id: randomUUID(), iocValue: entry.iocValue })), false);
    assert.equal(repository.list().length, 1);
  });
});
