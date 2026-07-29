import { randomUUID } from 'node:crypto';
import type { AggregatedIocResult, HistoryEntry } from '@tid/shared';
import type { HistoryRepository } from './history.repository.js';

export class HistoryService {
  constructor(private readonly repository: HistoryRepository) {}

  record(result: AggregatedIocResult): void {
    this.repository.add({
      id: randomUUID(),
      iocValue: result.ioc,
      iocType: result.type,
      verdict: result.verdict,
      score: result.score,
      createdAt: new Date().toISOString(),
    });
  }

  list(limit?: number): HistoryEntry[] {
    return this.repository.list(limit);
  }

  deleteById(id: string): void {
    this.repository.deleteById(id);
  }

  clear(): void {
    this.repository.clear();
  }
}
