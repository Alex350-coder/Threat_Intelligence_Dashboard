import { Skeleton } from './ui/Skeleton.js';

/** Suspense fallback shown while a lazy-loaded route chunk downloads. */
export function RouteFallback(): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
