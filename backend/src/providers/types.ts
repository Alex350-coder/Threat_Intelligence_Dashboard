import type { IocType, ProviderResult } from '@tid/shared';

export interface ThreatProvider {
  readonly name: string;
  supports(iocType: IocType): boolean;
  /** Must never reject; on failure (network, timeout, missing key) resolve with `status: 'unavailable'`. */
  lookup(ioc: string): Promise<ProviderResult>;
}
