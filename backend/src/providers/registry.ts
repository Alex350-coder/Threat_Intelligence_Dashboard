import type { IocType } from '@tid/shared';
import type { ThreatProvider } from './types.js';

export class ProviderRegistry {
  constructor(private readonly providers: readonly ThreatProvider[]) {}

  getProvidersFor(iocType: IocType): ThreatProvider[] {
    return this.providers.filter((provider) => provider.supports(iocType));
  }
}
