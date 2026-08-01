import { Card, CardBody } from '../ui/Card.js';
import { Skeleton } from '../ui/Skeleton.js';

// Mirrors the ScoreSummary + ProviderPanel grid layout so the loading state
// doesn't cause a layout jump once real results arrive. A single role="status"
// wraps the whole block — the individual bars opt out of Skeleton's own
// role="status" so screen readers announce "Loading results" once, not per bar.
export function ResultsSkeleton(): JSX.Element {
  return (
    <div role="status" aria-label="Loading results" className="flex flex-col gap-4">
      <Card>
        <CardBody className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-2">
              <Skeleton role="presentation" aria-hidden="true" className="h-3 w-20" />
              <Skeleton role="presentation" aria-hidden="true" className="h-6 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton role="presentation" aria-hidden="true" className="h-6 w-24 rounded-full" />
            <Skeleton role="presentation" aria-hidden="true" className="h-4 w-32" />
          </div>
        </CardBody>
      </Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Card key={index}>
            <CardBody className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <Skeleton role="presentation" aria-hidden="true" className="h-4 w-24" />
                <Skeleton role="presentation" aria-hidden="true" className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton role="presentation" aria-hidden="true" className="h-4 w-full" />
              <Skeleton role="presentation" aria-hidden="true" className="h-4 w-3/4" />
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
