import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { AggregatedIocResult, HistoryEntry } from '@tid/shared';
import type { HistoryRepository } from './history.repository.js';
import { HistoryService } from './history.service.js';

function fakeRepository(): HistoryRepository & { entries: HistoryEntry[] } {
  const entries: HistoryEntry[] = [];
  return {
    entries,
    add: (entry) => {
      entries.push(entry);
    },
    list: (limit) => entries.slice(0, limit ?? entries.length),
    deleteById: (id) => {
      const index = entries.findIndex((entry) => entry.id === id);
      if (index >= 0) entries.splice(index, 1);
    },
    clear: () => {
      entries.length = 0;
    },
  };
}

function fakeResult(overrides: Partial<AggregatedIocResult> = {}): AggregatedIocResult {
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

describe('HistoryService', () => {
  it('records a search result as a history entry', () => {
    const repository = fakeRepository();
    const service = new HistoryService(repository);

    service.record(fakeResult({ ioc: 'malicious.example.com', type: 'domain', verdict: 'malicious', score: 90 }));

    assert.equal(repository.entries.length, 1);
    assert.equal(repository.entries[0]?.iocValue, 'malicious.example.com');
    assert.equal(repository.entries[0]?.iocType, 'domain');
    assert.equal(repository.entries[0]?.verdict, 'malicious');
    assert.equal(repository.entries[0]?.score, 90);
  });

  it('lists entries via the repository, honoring an optional limit', () => {
    const repository = fakeRepository();
    const service = new HistoryService(repository);
    service.record(fakeResult({ ioc: 'a' }));
    service.record(fakeResult({ ioc: 'b' }));

    assert.equal(service.list().length, 2);
    assert.equal(service.list(1).length, 1);
  });

  it('deletes an entry by id', () => {
    const repository = fakeRepository();
    const service = new HistoryService(repository);
    service.record(fakeResult());
    const id = repository.entries[0]!.id;

    service.deleteById(id);

    assert.equal(repository.entries.length, 0);
  });

  it('clears all entries', () => {
    const repository = fakeRepository();
    const service = new HistoryService(repository);
    service.record(fakeResult({ ioc: 'a' }));
    service.record(fakeResult({ ioc: 'b' }));

    service.clear();

    assert.equal(repository.entries.length, 0);
  });
});
