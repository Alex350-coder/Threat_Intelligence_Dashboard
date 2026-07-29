import type { ProviderResult, Verdict } from '@tid/shared';

export interface VirusTotalAnalysisStats {
  malicious: number;
  suspicious: number;
  undetected: number;
  harmless: number;
  timeout: number;
}

function toVerdict(stats: VirusTotalAnalysisStats): Verdict {
  const total = stats.malicious + stats.suspicious + stats.undetected + stats.harmless + stats.timeout;
  if (total === 0) return 'unknown';
  if (stats.malicious > 0) return 'malicious';
  if (stats.suspicious > 0) return 'suspicious';
  return 'clean';
}

export function mapVirusTotalResult(stats: VirusTotalAnalysisStats, link: string): ProviderResult {
  const total = stats.malicious + stats.suspicious + stats.undetected + stats.harmless + stats.timeout;
  const score = total > 0 ? Math.round(((stats.malicious + stats.suspicious) / total) * 100) : 0;

  return {
    provider: 'VirusTotal',
    status: 'ok',
    verdict: toVerdict(stats),
    score,
    summary: `${stats.malicious} malicious, ${stats.suspicious} suspicious out of ${total} engines`,
    details: [
      { key: 'Malicious', value: String(stats.malicious) },
      { key: 'Suspicious', value: String(stats.suspicious) },
      { key: 'Harmless', value: String(stats.harmless) },
      { key: 'Undetected', value: String(stats.undetected) },
      { key: 'Timeout', value: String(stats.timeout) },
    ],
    link,
  };
}

export function unavailableVirusTotalResult(): ProviderResult {
  return {
    provider: 'VirusTotal',
    status: 'unavailable',
    verdict: 'unknown',
    summary: 'VirusTotal lookup is unavailable',
    details: [],
  };
}
