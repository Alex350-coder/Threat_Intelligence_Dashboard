import type { DatabaseSync } from 'node:sqlite';
import type { AggregatedIocResult } from '@tid/shared';

export interface CacheRepository {
  get(key: string): AggregatedIocResult | undefined;
  set(key: string, value: AggregatedIocResult, ttlSeconds: number): void;
}

interface CacheRow {
  resultJson: string;
  expiresAt: string;
}

export class SqliteCacheRepository implements CacheRepository {
  constructor(private readonly db: DatabaseSync) {}

  get(key: string): AggregatedIocResult | undefined {
    const row = this.db
      .prepare('SELECT resultJson, expiresAt FROM cache WHERE key = ?')
      .get(key) as CacheRow | undefined;

    if (!row) {
      return undefined;
    }

    if (new Date(row.expiresAt).getTime() <= Date.now()) {
      this.db.prepare('DELETE FROM cache WHERE key = ?').run(key);
      return undefined;
    }

    try {
      return JSON.parse(row.resultJson) as AggregatedIocResult;
    } catch {
      // Corrupted cache entry: fail open (treat as a miss) rather than surfacing an error for non-authoritative data.
      this.db.prepare('DELETE FROM cache WHERE key = ?').run(key);
      return undefined;
    }
  }

  set(key: string, value: AggregatedIocResult, ttlSeconds: number): void {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlSeconds * 1000);

    this.db
      .prepare(
        `INSERT INTO cache (key, resultJson, fetchedAt, expiresAt)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(key) DO UPDATE SET
           resultJson = excluded.resultJson,
           fetchedAt = excluded.fetchedAt,
           expiresAt = excluded.expiresAt`,
      )
      .run(key, JSON.stringify(value), now.toISOString(), expiresAt.toISOString());
  }
}
