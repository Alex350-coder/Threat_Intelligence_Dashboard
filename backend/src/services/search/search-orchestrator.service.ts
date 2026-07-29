import type { AggregatedIocResult } from '@tid/shared';
import { AppError } from '../../errors/app-error.js';
import type { ProviderRegistry } from '../../providers/registry.js';
import type { CacheService } from '../cache/cache.service.js';
import type { HistoryService } from '../history/history.service.js';
import { detectIocType, normalizeIoc } from '../detection/ioc-detector.js';
import { aggregateVerdict, aggregateScore, allProvidersUnavailable } from './aggregate.js';

export class SearchOrchestratorService {
  constructor(
    private readonly registry: ProviderRegistry,
    private readonly cache?: CacheService,
    private readonly history?: HistoryService,
  ) {}

  async search(rawIoc: string): Promise<AggregatedIocResult> {
    const type = detectIocType(rawIoc);
    if (!type) {
      throw AppError.badRequest('Unable to detect a valid IOC type (ip, domain, url, or hash).');
    }
    const ioc = normalizeIoc(rawIoc, type);

    const cached = this.cache?.get(type, ioc);
    if (cached) {
      const result = { ...cached, cached: true };
      this.history?.record(result);
      return result;
    }

    const providers = this.registry.getProvidersFor(type);
    if (providers.length === 0) {
      throw AppError.upstreamError(`No threat intelligence providers are configured for IOC type "${type}".`);
    }

    const results = await Promise.all(providers.map((provider) => provider.lookup(ioc)));

    if (allProvidersUnavailable(results)) {
      throw AppError.upstreamError('All threat intelligence providers are currently unavailable.');
    }

    const result: AggregatedIocResult = {
      ioc,
      type,
      verdict: aggregateVerdict(results),
      score: aggregateScore(results),
      providers: results,
      cached: false,
      fetchedAt: new Date().toISOString(),
    };

    this.cache?.set(type, ioc, result);
    this.history?.record(result);

    return result;
  }
}
