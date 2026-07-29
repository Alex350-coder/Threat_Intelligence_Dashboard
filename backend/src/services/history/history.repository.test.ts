import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import type { HistoryEntry } from '@tid/shared';
import { SqliteHistoryRepository } from './history.repository.js';

function sampleEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
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

describe('SqliteHistoryRepository', () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = new DatabaseSync(':memory:');
    db.exec(`
      CREATE TABLE searches (
        id TEXT PRIMARY KEY,
        iocValue TEXT NOT NULL,
        iocType TEXT NOT NULL,
        verdict TEXT NOT NULL,
        score REAL NOT NULL,
        createdAt TEXT NOT NULL
      );
    `);
  });

  it('adds and lists entries newest first', () => {
    const repository = new SqliteHistoryRepository(db, 10);
    const older = sampleEntry({ iocValue: '1.1.1.1', createdAt: '2024-01-01T00:00:00.000Z' });
    const newer = sampleEntry({ iocValue: '2.2.2.2', createdAt: '2024-01-02T00:00:00.000Z' });

    repository.add(older);
    repository.add(newer);

    const entries = repository.list();
    assert.equal(entries.length, 2);
    assert.equal(entries[0]?.iocValue, '2.2.2.2');
    assert.equal(entries[1]?.iocValue, '1.1.1.1');
  });

  it('trims older entries beyond the retention limit', () => {
    const repository = new SqliteHistoryRepository(db, 2);

    repository.add(sampleEntry({ iocValue: 'first', createdAt: '2024-01-01T00:00:00.000Z' }));
    repository.add(sampleEntry({ iocValue: 'second', createdAt: '2024-01-02T00:00:00.000Z' }));
    repository.add(sampleEntry({ iocValue: 'third', createdAt: '2024-01-03T00:00:00.000Z' }));

    const entries = repository.list(10);
    assert.equal(entries.length, 2);
    assert.deepEqual(entries.map((entry) => entry.iocValue), ['third', 'second']);
  });

  it('deletes an entry by id', () => {
    const repository = new SqliteHistoryRepository(db, 10);
    const entry = sampleEntry();
    repository.add(entry);

    repository.deleteById(entry.id);

    assert.equal(repository.list().length, 0);
  });

  it('clears all entries', () => {
    const repository = new SqliteHistoryRepository(db, 10);
    repository.add(sampleEntry());
    repository.add(sampleEntry());

    repository.clear();

    assert.equal(repository.list().length, 0);
  });
});
