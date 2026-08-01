import { useCallback, useEffect, useRef, useState } from 'react';
import type { HistoryEntry } from '@tid/shared';
import { ApiClientError, clearHistory, deleteHistoryEntry, fetchHistory } from '../services/apiClient.js';

export type HistoryStatus = 'loading' | 'success' | 'error';

export interface UseHistoryResult {
  status: HistoryStatus;
  entries: HistoryEntry[];
  error: string | undefined;
  refresh: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
}

export function useHistory(): UseHistoryResult {
  const [status, setStatus] = useState<HistoryStatus>('loading');
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [error, setError] = useState<string>();
  const abortRef = useRef<AbortController>();

  const load = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setError(undefined);

    try {
      const result = await fetchHistory(controller.signal);
      setEntries(result);
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

  const remove = useCallback(async (id: string) => {
    // Optimistic removal — the entry is already gone from the user's perspective.
    setEntries((current) => current.filter((entry) => entry.id !== id));
    try {
      await deleteHistoryEntry(id);
    } catch {
      await load();
    }
  }, [load]);

  const clear = useCallback(async () => {
    setEntries([]);
    try {
      await clearHistory();
    } catch {
      await load();
    }
  }, [load]);

  return { status, entries, error, refresh: load, remove, clear };
}
