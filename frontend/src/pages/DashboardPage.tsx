import { SearchBar } from '../components/search/SearchBar.js';
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
      {/* Results, loading, empty, and error rendering land in later Phase 7 tasks. */}
      {status === 'success' && data ? <p className="text-text-muted">{data.ioc}</p> : null}
      {status === 'error' && error ? <p className="text-verdict-malicious">{error}</p> : null}
    </div>
  );
}
