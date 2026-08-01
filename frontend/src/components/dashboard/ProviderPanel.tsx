import type { ProviderResult } from '@tid/shared';
import { Badge } from '../ui/Badge.js';
import { Card, CardBody, CardHeader } from '../ui/Card.js';
import { DetailTable } from './DetailTable.js';
import { VerdictBadge } from './VerdictBadge.js';

type ProviderPanelProps = {
  result: ProviderResult;
};

function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function ProviderPanel({ result }: ProviderPanelProps): JSX.Element {
  const isUnavailable = result.status === 'unavailable';
  const hasSafeLink = result.link !== undefined && isSafeHttpUrl(result.link);

  return (
    <Card>
      <CardHeader>
        <h3 className="text-sm font-semibold text-text">{result.provider}</h3>
        {isUnavailable ? <Badge tone="neutral">Unavailable</Badge> : <VerdictBadge verdict={result.verdict} />}
      </CardHeader>
      <CardBody className="flex flex-col gap-3">
        {isUnavailable ? (
          <p className="text-sm text-text-muted">This provider did not return data for this search.</p>
        ) : (
          <>
            {result.score !== undefined ? (
              <p className="text-sm tabular-nums text-text-muted">
                Score: <span className="font-medium text-text">{result.score}</span>/100
              </p>
            ) : null}
            {result.summary ? <p className="text-sm text-text">{result.summary}</p> : null}
            <DetailTable details={result.details} />
            {hasSafeLink ? (
              <a
                href={result.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:underline"
              >
                View full report on {result.provider}
              </a>
            ) : null}
          </>
        )}
      </CardBody>
    </Card>
  );
}
