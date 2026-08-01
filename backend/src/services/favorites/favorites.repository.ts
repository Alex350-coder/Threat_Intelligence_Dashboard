import type { DatabaseSync } from 'node:sqlite';
import type { FavoriteEntry, IocType, Verdict } from '@tid/shared';

interface FavoriteRow {
  id: string;
  iocValue: string;
  iocType: IocType;
  verdict: Verdict;
  score: number;
  createdAt: string;
}

export interface FavoritesRepository {
  /** Returns false instead of throwing if `entry.iocValue` is already favorited. */
  add(entry: FavoriteEntry): boolean;
  list(): FavoriteEntry[];
  findByIocValue(iocValue: string): FavoriteEntry | undefined;
  /** Returns whether a row was actually deleted. */
  removeByIocValue(iocValue: string): boolean;
}

export class SqliteFavoritesRepository implements FavoritesRepository {
  constructor(private readonly db: DatabaseSync) {}

  add(entry: FavoriteEntry): boolean {
    // OR IGNORE keeps this idempotent under a rapid double-toggle instead of
    // throwing on the `iocValue` UNIQUE constraint.
    const result = this.db
      .prepare(
        `INSERT OR IGNORE INTO favorites (id, iocValue, iocType, verdict, score, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(entry.id, entry.iocValue, entry.iocType, entry.verdict, entry.score, entry.createdAt);
    return result.changes > 0;
  }

  list(): FavoriteEntry[] {
    const rows = this.db
      .prepare('SELECT id, iocValue, iocType, verdict, score, createdAt FROM favorites ORDER BY createdAt DESC')
      .all() as unknown as FavoriteRow[];
    return rows;
  }

  findByIocValue(iocValue: string): FavoriteEntry | undefined {
    const row = this.db
      .prepare('SELECT id, iocValue, iocType, verdict, score, createdAt FROM favorites WHERE iocValue = ?')
      .get(iocValue) as unknown as FavoriteRow | undefined;
    return row;
  }

  removeByIocValue(iocValue: string): boolean {
    const result = this.db.prepare('DELETE FROM favorites WHERE iocValue = ?').run(iocValue);
    return result.changes > 0;
  }
}
