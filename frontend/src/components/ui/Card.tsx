import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn.js';

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps): JSX.Element {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-bg-elevated shadow-sm shadow-black/20',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps): JSX.Element {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 border-b border-border px-4 py-3',
        className,
      )}
      {...props}
    />
  );
}

export function CardBody({ className, ...props }: CardProps): JSX.Element {
  return <div className={cn('px-4 py-3', className)} {...props} />;
}
