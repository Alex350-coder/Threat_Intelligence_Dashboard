import type { Verdict } from '@tid/shared';
import { Badge } from '../ui/Badge.js';
import type { BadgeTone } from '../ui/Badge.js';

const LABELS: Record<Verdict, string> = {
  malicious: 'Malicious',
  suspicious: 'Suspicious',
  clean: 'Clean',
  unknown: 'Unknown',
};

// Verdict values line up 1:1 with BadgeTone's verdict tones.
const TONES: Record<Verdict, BadgeTone> = {
  malicious: 'malicious',
  suspicious: 'suspicious',
  clean: 'clean',
  unknown: 'unknown',
};

type VerdictBadgeProps = {
  verdict: Verdict;
  className?: string;
};

export function VerdictBadge({ verdict, className }: VerdictBadgeProps): JSX.Element {
  return (
    <Badge tone={TONES[verdict]} className={className}>
      {LABELS[verdict]}
    </Badge>
  );
}
