import type { DatabaseSync } from 'node:sqlite';
import type { HistoryEntry, IocType, Verdict } from '@tid/shared';

interface SearchRow {
  id: string;
  iocValue: string;
  iocType: IocType;
  verdict: Verdict;
  score: number;
  createdAt: string;
}

export interface HistoryRepository {
  add(entry: HistoryEntry): void;
  list(limit?: number): HistoryEntry[];
  deleteById(id: string): void;
  clear(): void;
}

export class SqliteHistoryRepository implements HistoryRepository {
  constructor(
    private readonly db: DatabaseSync,
    private readonly retentionLimit: number,
  ) {}

  add(entry: HistoryEntry): void {
    this.db
      .prepare(
        `INSERT INTO searches (id, iocValue, iocType, verdict, score, createdAt)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(entry.id, entry.iocValue, entry.iocType, entry.verdict, entry.score, entry.createdAt);

    this.db
      .prepare(
        `DELETE FROM searches WHERE id NOT IN (
           SELECT id FROM searches ORDER BY createdAt DESC LIMIT ?
         )`,
      )
      .run(this.retentionLimit);
  }

  list(limit?: number): HistoryEntry[] {
    const rows = this.db
      .prepare('SELECT id, iocValue, iocType, verdict, score, createdAt FROM searches ORDER BY createdAt DESC LIMIT ?')
      .all(limit ?? this.retentionLimit) as unknown as SearchRow[];
    return rows;
  }

  deleteById(id: string): void {
    this.db.prepare('DELETE FROM searches WHERE id = ?').run(id);
  }

  clear(): void {
    this.db.exec('DELETE FROM searches');
  }
}
