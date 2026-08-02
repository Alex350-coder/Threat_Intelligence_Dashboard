import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { FavoriteEntry } from '@tid/shared';
import type { FavoritesRepository } from './favorites.repository.js';
import { FavoritesService } from './favorites.service.js';

function fakeRepository(): FavoritesRepository & { entries: FavoriteEntry[] } {
  const entries: FavoriteEntry[] = [];
  return {
    entries,
    add: (entry) => {
      if (entries.some((e) => e.iocValue === entry.iocValue)) return false;
      entries.push(entry);
      return true;
    },
    list: () => entries,
    findByIocValue: (iocValue) => entries.find((entry) => entry.iocValue === iocValue),
    removeByIocValue: (iocValue) => {
      const index = entries.findIndex((entry) => entry.iocValue === iocValue);
      if (index < 0) return false;
      entries.splice(index, 1);
      return true;
    },
  };
}

const toggleInput = { ioc: '8.8.8.8', type: 'ip' as const, verdict: 'clean' as const, score: 0 };

describe('FavoritesService', () => {
  it('lists favorites via the repository', () => {
    const repository = fakeRepository();
    const service = new FavoritesService(repository);
    assert.deepEqual(service.list(), []);
  });

  it('toggling an unfavorited IOC adds it and reports favorited: true', () => {
    const repository = fakeRepository();
    const service = new FavoritesService(repository);

    const result = service.toggle(toggleInput);

    assert.deepEqual(result, { favorited: true });
    assert.equal(repository.entries.length, 1);
    assert.equal(repository.entries[0]?.iocValue, '8.8.8.8');
  });

  it('toggling an already-favorited IOC removes it and reports favorited: false', () => {
    const repository = fakeRepository();
    const service = new FavoritesService(repository);
    service.toggle(toggleInput);

    const result = service.toggle(toggleInput);

    assert.deepEqual(result, { favorited: false });
    assert.equal(repository.entries.length, 0);
  });
});
