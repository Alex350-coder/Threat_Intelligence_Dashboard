import type { IocType, ProviderResult } from '@tid/shared';
import type { ThreatProvider } from '../types.js';
import { logger } from '../../config/logger.js';
import { fetchWithTimeout } from '../http.js';
import { detectIocType, normalizeIoc } from '../../services/detection/ioc-detector.js';
import { mapVirusTotalResult, unavailableVirusTotalResult, type VirusTotalAnalysisStats } from './virustotal.mapper.js';

interface VirusTotalResponse {
  data: {
    attributes: {
      last_analysis_stats: VirusTotalAnalysisStats;
    };
  };
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
    const shape = detectIocType(ioc);
    if (!this.apiKey || !shape) {
      return unavailableVirusTotalResult();
    }
    const normalized = normalizeIoc(ioc, shape);

    try {
      const url = `https://www.virustotal.com/api/v3/${toEndpointPath(shape, normalized)}`;
      const body = (await fetchWithTimeout(url, {
        headers: { 'x-apikey': this.apiKey, Accept: 'application/json' },
      })) as VirusTotalResponse;
      const stats = body.data.attributes.last_analysis_stats;
      return mapVirusTotalResult(stats, `https://www.virustotal.com/gui/search/${encodeURIComponent(normalized)}`);
    } catch (error) {
      logger.warn('VirusTotal lookup failed', { error: error instanceof Error ? error.message : String(error) });
      return unavailableVirusTotalResult();
    }
  }
}
