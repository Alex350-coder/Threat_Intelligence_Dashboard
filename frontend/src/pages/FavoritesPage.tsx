import { Button } from '../components/ui/Button.js';
import { EmptyState } from '../components/ui/EmptyState.js';
import { ErrorState } from '../components/ui/ErrorState.js';
import { Skeleton } from '../components/ui/Skeleton.js';
import { IocRecordTable } from '../components/history/IocRecordTable.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { useFavorites } from '../hooks/useFavorites.js';

export function FavoritesPage(): JSX.Element {
  useDocumentTitle('Favorites');
  const { status, favorites, error, toggleError, isPending, toggle } = useFavorites();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Favorites</h1>
        <p className="mt-1 text-text-muted">IOCs you've pinned for quick reference.</p>
      </div>
      <div role="status" aria-live="polite" className="sr-only">
        {status === 'loading' ? 'Loading favorites' : null}
      </div>
      {toggleError ? <ErrorState title="Could not update favorite" description={toggleError} /> : null}
      <div>
        {status === 'loading' ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : null}
        {status === 'error' ? <ErrorState title="Could not load favorites" description={error} /> : null}
        {status === 'success' && favorites.length === 0 ? (
          <EmptyState
            title="No favorites yet"
            description="Favorite an IOC from its search result to pin it here."
          />
        ) : null}
        {status === 'success' && favorites.length > 0 ? (
          <IocRecordTable
            caption="Favorite IOCs"
            records={favorites}
            renderActions={(record) => (
              <Button
                variant="ghost"
                size="sm"
                disabled={isPending(record.iocValue)}
                aria-label={`Unfavorite ${record.iocValue}`}
                onClick={() =>
                  void toggle({
                    ioc: record.iocValue,
                    type: record.iocType,
                    verdict: record.verdict,
                    score: record.score,
                  })
                }
              >
                Unfavorite
              </Button>
            )}
          />
        ) : null}
      </div>
    </div>
  );
}
