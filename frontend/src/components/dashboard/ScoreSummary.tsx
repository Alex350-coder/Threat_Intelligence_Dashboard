import type { AggregatedIocResult } from '@tid/shared';
import { Badge } from '../ui/Badge.js';
import { Card, CardBody } from '../ui/Card.js';
import { Tooltip } from '../ui/Tooltip.js';
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
          <VerdictBadge verdict={result.verdict} showTooltip />
          <Tooltip label="Averaged across every provider that returned a score for this indicator. Higher means riskier.">
            {/* Focusable so keyboard users can trigger the tooltip the same way mouse
                users do on hover, same rationale as Badge's tabIndex in VerdictBadge. */}
            {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
            <span tabIndex={0} className="rounded-sm text-sm tabular-nums text-text-muted">
              Aggregate score: <span className="font-medium text-text">{result.score}</span>/100
            </span>
          </Tooltip>
        </div>
      </CardBody>
    </Card>
  );
}
