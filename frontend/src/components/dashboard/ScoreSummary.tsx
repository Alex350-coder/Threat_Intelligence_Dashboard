import type { AggregatedIocResult } from '@tid/shared';
import { Badge } from '../ui/Badge.js';
import { Card, CardBody } from '../ui/Card.js';
import { FavoriteButton } from './FavoriteButton.js';
import { VerdictBadge } from './VerdictBadge.js';

const TYPE_LABELS: Record<AggregatedIocResult['type'], string> = {
  ip: 'IP Address',
  domain: 'Domain',
  url: 'URL',
  hash: 'File Hash',
};

type ScoreSummaryProps = {
  result: AggregatedIocResult;
};

export function ScoreSummary({ result }: ScoreSummaryProps): JSX.Element {
  return (
    <Card>
      <CardBody className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-text-muted">{TYPE_LABELS[result.type]}</p>
            <p className="break-all font-mono text-lg font-medium text-text">{result.ioc}</p>
          </div>
          <div className="flex items-center gap-2">
            {result.cached ? <Badge tone="neutral">Cached</Badge> : null}
            <FavoriteButton result={result} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <VerdictBadge verdict={result.verdict} />
          <p className="text-sm tabular-nums text-text-muted">
            Aggregate score: <span className="font-medium text-text">{result.score}</span>/100
          </p>
        </div>
      </CardBody>
    </Card>
  );
}
