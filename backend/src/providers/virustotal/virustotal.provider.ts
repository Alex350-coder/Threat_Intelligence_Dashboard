import type { IocType, ProviderResult } from '@tid/shared';
import type { ThreatProvider } from '../types.js';
import { logger } from '../../config/logger.js';
import { mapVirusTotalResult, unavailableVirusTotalResult, type VirusTotalAnalysisStats } from './virustotal.mapper.js';

const VIRUSTOTAL_TIMEOUT_MS = 8000;

const HASH_PATTERN = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/;
const IPV4_PATTERN = /^(\d{1,3}\.){3}\d{1,3}$/;
const IPV6_PATTERN = /^[0-9a-fA-F:]+$/;
const DOMAIN_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function isIp(value: string): boolean {
  return IPV4_PATTERN.test(value) || (value.includes(':') && IPV6_PATTERN.test(value));
}

interface VirusTotalResponse {
  data: {
    attributes: {
      last_analysis_stats: VirusTotalAnalysisStats;
    };
  };
}

/**
 * `ThreatProvider.lookup` only receives the raw ioc string (no iocType), so VirusTotal
 * detects its own shape here to pick the right v3 endpoint. Checked in specificity order:
 * a hash is unambiguous hex-length, a URL has a scheme, otherwise IP vs domain by pattern.
 */
export function detectShape(ioc: string): IocType | null {
  if (HASH_PATTERN.test(ioc)) return 'hash';
  if (isIp(ioc)) return 'ip';
  try {
    new URL(ioc);
    return 'url';
  } catch {
    // not a URL, fall through to domain check
  }
  if (DOMAIN_PATTERN.test(ioc)) return 'domain';
  return null;
}

function toEndpointPath(shape: IocType, ioc: string): string {
  switch (shape) {
    case 'ip':
      return `ip_addresses/${encodeURIComponent(ioc)}`;
    case 'domain':
      return `domains/${encodeURIComponent(ioc)}`;
    case 'hash':
      return `files/${encodeURIComponent(ioc)}`;
    case 'url': {
      const id = Buffer.from(ioc).toString('base64url');
      return `urls/${id}`;
    }
  }
}

export class VirusTotalProvider implements ThreatProvider {
  readonly name = 'VirusTotal';

  constructor(private readonly apiKey: string) {}

  supports(iocType: IocType): boolean {
    return iocType === 'ip' || iocType === 'domain' || iocType === 'url' || iocType === 'hash';
  }

  async lookup(ioc: string): Promise<ProviderResult> {
    const shape = detectShape(ioc);
    if (!this.apiKey || !shape) {
      return unavailableVirusTotalResult();
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), VIRUSTOTAL_TIMEOUT_MS);

    try {
      const url = `https://www.virustotal.com/api/v3/${toEndpointPath(shape, ioc)}`;
      const response = await fetch(url, {
        headers: { 'x-apikey': this.apiKey, Accept: 'application/json' },
        signal: controller.signal,
      });

      if (!response.ok) {
        logger.warn('VirusTotal lookup failed', { status: response.status });
        return unavailableVirusTotalResult();
      }

      const body = (await response.json()) as VirusTotalResponse;
      const stats = body.data.attributes.last_analysis_stats;
      return mapVirusTotalResult(stats, `https://www.virustotal.com/gui/search/${encodeURIComponent(ioc)}`);
    } catch (error) {
      logger.warn('VirusTotal lookup error', { error: error instanceof Error ? error.message : String(error) });
      return unavailableVirusTotalResult();
    } finally {
      clearTimeout(timeout);
    }
  }
}
