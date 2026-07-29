import type { AppConfig } from '../config/env.js';
import { AbuseIpDbProvider } from './abuseipdb/abuseipdb.provider.js';
import { VirusTotalProvider } from './virustotal/virustotal.provider.js';
import { ProviderRegistry } from './registry.js';

export { ProviderRegistry } from './registry.js';
export type { ThreatProvider } from './types.js';

export function createProviderRegistry(config: AppConfig): ProviderRegistry {
  return new ProviderRegistry([
    new AbuseIpDbProvider(config.abuseIpDbApiKey),
    new VirusTotalProvider(config.virusTotalApiKey),
  ]);
}
