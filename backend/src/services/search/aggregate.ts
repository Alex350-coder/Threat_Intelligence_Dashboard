import type { ProviderResult, Verdict } from '@tid/shared';

const VERDICT_RANK: Record<Verdict, number> = {
  unknown: 0,
  clean: 1,
  suspicious: 2,
  malicious: 3,
};

export function aggregateVerdict(providers: ProviderResult[]): Verdict {
  const reporting = providers.filter((p) => p.status === 'ok');
  if (reporting.length === 0) return 'unknown';

  return reporting.reduce<Verdict>(
    (worst, current) => (VERDICT_RANK[current.verdict] > VERDICT_RANK[worst] ? current.verdict : worst),
    'unknown',
  );
}

export function aggregateScore(providers: ProviderResult[]): number {
  const scored = providers.filter((p) => p.status === 'ok' && typeof p.score === 'number');
  if (scored.length === 0) return 0;

  const sum = scored.reduce((total, p) => total + (p.score ?? 0), 0);
  return Math.round(sum / scored.length);
}

export function allProvidersUnavailable(providers: ProviderResult[]): boolean {
  return providers.length > 0 && providers.every((p) => p.status === 'unavailable');
}
