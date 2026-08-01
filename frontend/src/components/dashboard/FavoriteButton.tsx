import type { AggregatedIocResult } from '@tid/shared';
import { Button } from '../ui/Button.js';
import { useFavorites } from '../../hooks/useFavorites.js';

type FavoriteButtonProps = {
  result: AggregatedIocResult;
};

export function FavoriteButton({ result }: FavoriteButtonProps): JSX.Element {
  const { isFavorite, isPending, toggle } = useFavorites();
  const favorited = isFavorite(result.ioc);
  const pending = isPending(result.ioc);

  return (
    <Button
      type="button"
      variant={favorited ? 'primary' : 'secondary'}
      size="sm"
      aria-pressed={favorited}
      disabled={pending}
      onClick={() =>
        void toggle({ ioc: result.ioc, type: result.type, verdict: result.verdict, score: result.score })
      }
    >
      <span aria-hidden="true">{favorited ? '★' : '☆'}</span>
      {favorited ? 'Favorited' : 'Favorite'}
    </Button>
  );
}
