import { Button } from '../components/ui/Button.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { ErrorState } from '../components/ui/ErrorState.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { IocRecordTable } from '../components/history/IocRecordTable.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useHistory } from '../hooks/useHistory.js';

export function HistoryPage(): JSX.Element {
  useDocumentTitle('History');
  const { status, entries, error, remove, clear } = useHistory();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text">History</h1>
          <p className="mt-1 text-text-muted">Your most recent IOC searches, newest first.</p>
        </div>
        {entries.length > 0 ? (
          <Button variant="secondary" size="sm" onClick={() => void clear()}>
            Clear history
          </Button>
        ) : null}
      </div>
      <div aria-live="polite" aria-atomic="true">
        {status === 'loading' ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : null}
        {status === 'error' ? <ErrorState title="Could not load history" description={error} /> : null}
        {status === 'success' && entries.length === 0 ? (
          <EmptyState
            title="No searches yet"
            description="Search an IOC on the dashboard and it will show up here."
          />
        ) : null}
        {status === 'success' && entries.length > 0 ? (
          <IocRecordTable
            caption="Recent searches"
            records={entries}
            renderActions={(record) => (
              <Button
                variant="ghost"
                size="sm"
                aria-label={`Delete ${record.iocValue} from history`}
                onClick={() => void remove(record.id)}
              >
                Delete
              </Button>
            )}
          />
        ) : null}
      </div>
    </div>
  );
}
