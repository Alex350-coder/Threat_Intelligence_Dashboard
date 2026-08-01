import { useCallback, useEffect, useRef, useState } from 'react';
import type { AggregatedIocResult } from '@tid/shared';
import { ApiClientError, searchIoc } from '../services/apiClient.js';

export type IocSearchStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseIocSearchResult {
  status: IocSearchStatus;
  data: AggregatedIocResult | undefined;
  error: string | undefined;
  search: (value: string) => Promise<void>;
}

export function useIocSearch(): UseIocSearchResult {
  const [status, setStatus] = useState<IocSearchStatus>('idle');
  const [data, setData] = useState<AggregatedIocResult>();
  const [error, setError] = useState<string>();
  const abortRef = useRef<AbortController>();

  // Abort any in-flight request when the component unmounts.
  useEffect(() => () => abortRef.current?.abort(), []);

  const search = useCallback(async (value: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus('loading');
    setError(undefined);

    try {
      const result = await searchIoc(value, controller.signal);
      setData(result);
      setStatus('success');
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof ApiClientError ? err.message : 'Something went wrong. Please try again.');
      setStatus('error');
    }
  }, []);

  return { status, data, error, search };
}
