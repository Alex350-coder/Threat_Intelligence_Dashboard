import type { Verdict } from '@tid/shared';
import { Badge } from '../ui/Badge.js';
import type { BadgeTone } from '../ui/Badge.js';
import { Tooltip } from '../ui/Tooltip.js';

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

const DESCRIPTIONS: Record<Verdict, string> = {
  malicious: 'One or more providers flagged this indicator as actively malicious.',
  suspicious: 'Providers found signals worth a closer look, but not a confirmed threat.',
  clean: 'No provider found evidence of malicious activity for this indicator.',
  unknown: 'Providers did not return enough data to reach a verdict.',
};

type VerdictBadgeProps = {
  verdict: Verdict;
  className?: string;
  /** Wraps the badge in a Tooltip explaining what the verdict means. Off by default for compact contexts (e.g. table rows). */
  showTooltip?: boolean;
};

export function VerdictBadge({ verdict, className, showTooltip = false }: VerdictBadgeProps): JSX.Element {
  if (!showTooltip) {
    return (
      <Badge tone={TONES[verdict]} className={className}>
        {LABELS[verdict]}
      </Badge>
    );
  }

  return (
    <Tooltip label={DESCRIPTIONS[verdict]}>
      {/* tabIndex makes the badge focusable so keyboard users can trigger the tooltip
          the same way mouse users do on hover — Badge itself is a non-interactive span. */}
      <Badge tone={TONES[verdict]} className={className} tabIndex={0}>
        {LABELS[verdict]}
      </Badge>
    </Tooltip>
  );
}
