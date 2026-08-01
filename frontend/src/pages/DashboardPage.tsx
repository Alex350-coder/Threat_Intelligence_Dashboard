import { SearchBar } from '../components/search/SearchBar.js';
import { ProviderPanel } from '../components/dashboard/ProviderPanel.js';
import { ScoreSummary } from '../components/dashboard/ScoreSummary.js';
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
      {/* Loading/empty/error rendering lands in the next Phase 7 task. */}
      {status === 'success' && data ? (
        <div className="flex flex-col gap-4">
          <ScoreSummary result={data} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.providers.map((provider) => (
              <ProviderPanel key={provider.provider} result={provider} />
            ))}
          </div>
        </div>
      ) : null}
      {status === 'error' && error ? <p className="text-verdict-malicious">{error}</p> : null}
    </div>
  );
}
