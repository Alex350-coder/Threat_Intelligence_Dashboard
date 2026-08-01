import { randomUUID } from 'node:crypto';
import type { FavoriteEntry, FavoriteToggleRequest, FavoriteToggleResult } from '@tid/shared';
import type { FavoritesRepository } from './favorites.repository.js';

export class FavoritesService {
  constructor(private readonly repository: FavoritesRepository) {}

  list(): FavoriteEntry[] {
    return this.repository.list();
  }

  toggle(input: FavoriteToggleRequest): FavoriteToggleResult {
    // Delete-first, insert-or-ignore-second avoids the find-then-act race a
    // concurrent identical toggle could hit: `add` no longer throws on a
    // duplicate `iocValue`, so the "losing" request just confirms the entry
    // is already favorited instead of crashing with a UNIQUE constraint error.
    const wasRemoved = this.repository.removeByIocValue(input.ioc);
    if (wasRemoved) return { favorited: false };

    this.repository.add({
      id: randomUUID(),
      iocValue: input.ioc,
      iocType: input.type,
      verdict: input.verdict,
      score: input.score,
      createdAt: new Date().toISOString(),
    });
    return { favorited: true };
  }
}
