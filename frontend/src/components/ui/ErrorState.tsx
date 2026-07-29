import type { ReactNode } from 'react';
import { cn } from '../../lib/cn.js';

type ErrorStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function ErrorState({ title, description, action, className }: ErrorStateProps): JSX.Element {
  return (
    <div
      role="alert"
      className={cn(
        'flex flex-col items-center gap-2 rounded-lg border border-verdict-malicious/30 bg-verdict-malicious-bg px-6 py-12 text-center',
        className,
      )}
    >
      <p className="text-sm font-medium text-verdict-malicious">{title}</p>
      {description ? <p className="max-w-sm text-sm text-text-muted">{description}</p> : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
