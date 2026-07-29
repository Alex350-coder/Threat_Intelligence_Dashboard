import type { HTMLAttributes } from 'react';
import { cn } from '../../lib/cn.js';

type SkeletonProps = HTMLAttributes<HTMLDivElement>;

export function Skeleton({ className, ...props }: SkeletonProps): JSX.Element {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={cn(
        'animate-pulse rounded-md bg-bg-elevated motion-reduce:animate-none',
        className,
      )}
      {...props}
    />
  );
}
