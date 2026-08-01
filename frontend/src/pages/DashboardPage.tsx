import { SearchBar } from '../components/search/SearchBar.js';
import { ProviderPanel } from '../components/dashboard/ProviderPanel.js';
import { ResultsSkeleton } from '../components/dashboard/ResultsSkeleton.js';
import { ScoreSummary } from '../components/dashboard/ScoreSummary.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { ErrorState } from '../components/ui/ErrorState.js';
import { useIocSearch } from '../hooks/useIocSearch.js';

export function DashboardPage(): JSX.Element {
  const { status, data, error, search } = useIocSearch();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Dashboard</h1>
        <p className="mt-1 text-text-muted">
          Paste an IP address, domain, URL, or file hash to aggregate results across threat-intel providers.
        </p>
      </div>
      <SearchBar onSubmit={search} loading={status === 'loading'} />
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
            <ScoreSummary result={data} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.providers.map((provider) => (
                <ProviderPanel key={provider.provider} result={provider} />
              ))}
            </div>
          </div>
        ) : null}
        {status === 'error' ? <ErrorState title="Search failed" description={error} /> : null}
      </div>
    </div>
  );
}
