import type { IocType, ProviderResult } from '@tid/shared';
import type { ThreatProvider } from '../types.js';
import { logger } from '../../config/logger.js';
import { fetchWithTimeout } from '../http.js';
import { mapAbuseIpDbResult, unavailableAbuseIpDbResult, type AbuseIpDbCheckData } from './abuseipdb.mapper.js';

const IPV4_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV6_PATTERN = /^[0-9a-fA-F:]+$/;

function isWellFormedIp(value: string): boolean {
  return IPV4_PATTERN.test(value) || (value.includes(':') && IPV6_PATTERN.test(value));
}

interface AbuseIpDbResponse {
  data: AbuseIpDbCheckData;
}

export class AbuseIpDbProvider implements ThreatProvider {
  readonly name = 'AbuseIPDB';

  constructor(private readonly apiKey: string) {}

  supports(iocType: IocType): boolean {
    return iocType === 'ip';
  }

  async lookup(ioc: string): Promise<ProviderResult> {
    if (!this.apiKey || !isWellFormedIp(ioc)) {
      return unavailableAbuseIpDbResult();
    }

    try {
      const url = `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ioc)}&maxAgeInDays=90`;
      const body = (await fetchWithTimeout(url, {
        headers: { Key: this.apiKey, Accept: 'application/json' },
      })) as AbuseIpDbResponse;
      return mapAbuseIpDbResult(body.data);
    } catch (error) {
      logger.warn('AbuseIPDB lookup failed', { error: error instanceof Error ? error.message : String(error) });
      return unavailableAbuseIpDbResult();
    }
  }
}
