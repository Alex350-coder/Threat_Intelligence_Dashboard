import type { AggregatedIocResult, IocType } from '@tid/shared';
import type { CacheRepository } from './cache.repository.js';

export class CacheService {
  constructor(
    private readonly repository: CacheRepository,
    private readonly ttlSeconds: number,
  ) {}

  get(iocType: IocType, ioc: string): AggregatedIocResult | undefined {
    return this.repository.get(buildKey(iocType, ioc));
  }

  set(iocType: IocType, ioc: string, value: AggregatedIocResult): void {
    this.repository.set(buildKey(iocType, ioc), value, this.ttlSeconds);
  }
}

function buildKey(iocType: IocType, ioc: string): string {
  return `${iocType}:${ioc}`;
}
