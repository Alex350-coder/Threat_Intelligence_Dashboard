import type { IocType, ProviderResult } from '@tid/shared';
import type { ThreatProvider } from '../types.js';
import { logger } from '../../config/logger.js';
import { mapAbuseIpDbResult, unavailableAbuseIpDbResult, type AbuseIpDbCheckData } from './abuseipdb.mapper.js';

const ABUSEIPDB_TIMEOUT_MS = 8000;

const IPV4_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV6_PATTERN = /^[0-9a-fA-F:]+$/;

function isWellFormedIp(value: string): boolean {
  return IPV4_PATTERN.test(value) || (value.includes(':') && IPV6_PATTERN.test(value));
}

interface AbuseIpDbResponse {
  data: {
    ipAddress: string;
    abuseConfidenceScore: number;
    countryCode: string | null;
    isp: string | null;
    usageType: string | null;
    totalReports: number;
    lastReportedAt: string | null;
  };
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

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ABUSEIPDB_TIMEOUT_MS);

    try {
      const url = `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ioc)}&maxAgeInDays=90`;
      const response = await fetch(url, {
        headers: { Key: this.apiKey, Accept: 'application/json' },
        signal: controller.signal,
      });

      if (!response.ok) {
        logger.warn('AbuseIPDB lookup failed', { status: response.status });
        return unavailableAbuseIpDbResult();
      }

      const body = (await response.json()) as AbuseIpDbResponse;
      const data: AbuseIpDbCheckData = body.data;
      return mapAbuseIpDbResult(data);
    } catch (error) {
      logger.warn('AbuseIPDB lookup error', { error: error instanceof Error ? error.message : String(error) });
      return unavailableAbuseIpDbResult();
    } finally {
      clearTimeout(timeout);
    }
  }
}
