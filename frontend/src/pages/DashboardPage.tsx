import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchBar } from '../components/search/SearchBar.js';
import { ProviderPanel } from '../components/dashboard/ProviderPanel.js';
import { ResultsSkeleton } from '../components/dashboard/ResultsSkeleton.js';
import { ScoreSummary } from '../components/dashboard/ScoreSummary.js';
import { Button } from '../components/ui/Button.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { ErrorState } from '../components/ui/ErrorState.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useIocSearch } from '../hooks/useIocSearch.js';

export function DashboardPage(): JSX.Element {
  useDocumentTitle('Dashboard');
  const { status, data, error, search } = useIocSearch();
  const [searchParams] = useSearchParams();
  const queryIoc = searchParams.get('q') ?? undefined;
  // Tracks the last submitted query so the error state's "Try again" button
  // can re-run it without the user having to retype it.
  const lastQueryRef = useRef<string>();

  const runSearch = useCallback(
    (value: string) => {
      lastQueryRef.current = value;
      void search(value);
    },
    [search],
  );

  // Reopening a history/favorite entry navigates here with ?q=<ioc> —
  // run that search automatically instead of leaving the dashboard idle.
  useEffect(() => {
    if (queryIoc) runSearch(queryIoc);
  }, [queryIoc, runSearch]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Dashboard</h1>
        <p className="mt-1 text-text-muted">
          Paste an IP address, domain, URL, or file hash to aggregate results across threat-intel providers.
        </p>
      </div>
      <SearchBar onSubmit={runSearch} loading={status === 'loading'} initialValue={queryIoc} />
      <div aria-live="polite" aria-atomic="true">
        {status === 'idle' ? (
          <EmptyState
            title="No search yet"
            description="Paste an IOC above to aggregate results across threat-intel providers."
          />
        ) : null}
        {status === 'loading' ? <ResultsSkeleton /> : null}
        {status === 'success' && data ? (
          <div className="flex flex-col gap-4">
            <h2 className="sr-only">Search results</h2>
            <div className="animate-fade-in-up">
              <ScoreSummary result={data} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.providers.map((provider, index) => (
                <div
                  key={provider.provider}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${Math.min(index, 6) * 60}ms` }}
                >
                  <ProviderPanel result={provider} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {status === 'error' ? (
          <ErrorState
            title="Search failed"
            description={error}
            action={
              lastQueryRef.current ? (
                <Button type="button" variant="secondary" size="sm" onClick={() => runSearch(lastQueryRef.current!)}>
                  Try again
                </Button>
              ) : undefined
            }
          />
        ) : null}
      </div>
    </div>
  );
}
