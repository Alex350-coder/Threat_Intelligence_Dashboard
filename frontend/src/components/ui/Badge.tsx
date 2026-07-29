import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn.js';

export type BadgeTone = 'neutral' | 'accent' | 'malicious' | 'suspicious' | 'clean' | 'unknown';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
};

const toneClasses: Record<BadgeTone, string> = {
  neutral: 'bg-bg-elevated text-text border border-border',
  accent: 'bg-accent/15 text-accent border border-accent/30',
  malicious: 'bg-verdict-malicious-bg text-verdict-malicious border border-verdict-malicious/30',
  suspicious:
    'bg-verdict-suspicious-bg text-verdict-suspicious border border-verdict-suspicious/30',
  clean: 'bg-verdict-clean-bg text-verdict-clean border border-verdict-clean/30',
  unknown: 'bg-verdict-unknown-bg text-verdict-unknown border border-verdict-unknown/30',
};

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps): JSX.Element {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
