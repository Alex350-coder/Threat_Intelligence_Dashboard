import type { ProviderResult, Verdict } from '@tid/shared';

export interface AbuseIpDbCheckData {
  ipAddress: string;
  abuseConfidenceScore: number;
  countryCode: string | null;
  isp: string | null;
  usageType: string | null;
  totalReports: number;
  lastReportedAt: string | null;
}

function toVerdict(score: number): Verdict {
  if (score >= 75) return 'malicious';
  if (score >= 25) return 'suspicious';
  if (score === 0) return 'clean';
  return 'unknown';
}

export function mapAbuseIpDbResult(data: AbuseIpDbCheckData): ProviderResult {
  return {
    provider: 'AbuseIPDB',
    status: 'ok',
    verdict: toVerdict(data.abuseConfidenceScore),
    score: data.abuseConfidenceScore,
    summary: `Abuse confidence score ${data.abuseConfidenceScore}/100 from ${data.totalReports} report(s)`,
    details: [
      { key: 'Country', value: data.countryCode ?? 'Unknown' },
      { key: 'ISP', value: data.isp ?? 'Unknown' },
      { key: 'Usage type', value: data.usageType ?? 'Unknown' },
      { key: 'Total reports', value: String(data.totalReports) },
      { key: 'Last reported', value: data.lastReportedAt ?? 'Never' },
    ],
    link: `https://www.abuseipdb.com/check/${data.ipAddress}`,
  };
}

export function unavailableAbuseIpDbResult(): ProviderResult {
  return {
    provider: 'AbuseIPDB',
    status: 'unavailable',
    verdict: 'unknown',
    summary: 'AbuseIPDB lookup is unavailable',
    details: [],
  };
}
