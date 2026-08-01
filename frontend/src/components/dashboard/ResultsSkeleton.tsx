import { Card, CardBody } from '../ui/Card.js';
import { Skeleton } from '../ui/Skeleton.js';

// Mirrors the ScoreSummary + ProviderPanel grid layout so the loading state
// doesn't cause a layout jump once real results arrive.
export function ResultsSkeleton(): JSX.Element {
  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardBody className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-6 w-48" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-4 w-32" />
          </div>
        </CardBody>
      </Card>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((index) => (
          <Card key={index}>
            <CardBody className="flex flex-col gap-3">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
