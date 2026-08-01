import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { FavoriteEntry, FavoriteToggleRequest } from '@tid/shared';
import { ApiClientError, fetchFavorites, toggleFavorite } from '../services/apiClient.js';

export type FavoritesStatus = 'loading' | 'success' | 'error';

export interface UseFavoritesResult {
  status: FavoritesStatus;
  favorites: FavoriteEntry[];
  error: string | undefined;
  toggleError: string | undefined;
  isFavorite: (iocValue: string) => boolean;
  isPending: (iocValue: string) => boolean;
  toggle: (input: FavoriteToggleRequest) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useFavorites(): UseFavoritesResult {
  const [status, setStatus] = useState<FavoritesStatus>('loading');
  const [favorites, setFavorites] = useState<FavoriteEntry[]>([]);
  const [error, setError] = useState<string>();
  const [toggleError, setToggleError] = useState<string>();
  const [pendingIocs, setPendingIocs] = useState<Set<string>>(new Set());
  const abortRef = useRef<AbortController>();

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setError(undefined);

    try {
      const result = await fetchFavorites(controller.signal);
      setFavorites(result);
      setStatus('success');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void load();
    return () => abortRef.current?.abort();
  }, [load]);

  const favoritedValues = useMemo(() => new Set(favorites.map((entry) => entry.iocValue)), [favorites]);
  const isFavorite = useCallback((iocValue: string) => favoritedValues.has(iocValue), [favoritedValues]);

  const isPending = useCallback((iocValue: string) => pendingIocs.has(iocValue), [pendingIocs]);

  const toggle = useCallback(
    async (input: FavoriteToggleRequest) => {
      if (pendingIocs.has(input.ioc)) return;

      const wasFavorited = favoritedValues.has(input.ioc);
      const optimisticEntry: FavoriteEntry = {
        id: input.ioc,
        iocValue: input.ioc,
        iocType: input.type,
        verdict: input.verdict,
        score: input.score,
        createdAt: new Date().toISOString(),
      };

      setToggleError(undefined);
      setPendingIocs((current) => new Set(current).add(input.ioc));
      setFavorites((current) =>
        wasFavorited
          ? current.filter((entry) => entry.iocValue !== input.ioc)
          : [optimisticEntry, ...current],
      );

      try {
        // Trust the authoritative post-toggle state from the server instead of
        // refetching the whole list — avoids flashing the `status: 'loading'`
        // skeleton over the table on every single click.
        const result = await toggleFavorite(input);
        setFavorites((current) => {
          const alreadyPresent = current.some((entry) => entry.iocValue === input.ioc);
          if (result.favorited && !alreadyPresent) return [optimisticEntry, ...current];
          if (!result.favorited && alreadyPresent) {
            return current.filter((entry) => entry.iocValue !== input.ioc);
          }
          return current;
        });
      } catch (err) {
        // Revert the optimistic change and surface why, rather than silently
        // reconciling the list back to server truth with no explanation.
        setFavorites((current) =>
          wasFavorited
            ? [optimisticEntry, ...current]
            : current.filter((entry) => entry.iocValue !== input.ioc),
        );
        setToggleError(err instanceof ApiClientError ? err.message : 'Could not update favorite. Please try again.');
      } finally {
        setPendingIocs((current) => {
          const next = new Set(current);
          next.delete(input.ioc);
          return next;
        });
      }
    },
    [favoritedValues, pendingIocs],
  );

  return { status, favorites, error, toggleError, isFavorite, isPending, toggle, refresh: load };
}
