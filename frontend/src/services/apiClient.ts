import type { AggregatedIocResult, ApiErrorCode, ApiResponse, HistoryEntry } from '@tid/shared';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

export class ApiClientError extends Error {
  readonly code?: ApiErrorCode;
  readonly status?: number;

  constructor(message: string, code?: ApiErrorCode, status?: number) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
  }
}

type RequestOptions = {
  method: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
};

async function request<T>(path: string, { method, body, signal }: RequestOptions): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiClientError('Could not reach the server. Check your connection and try again.');
  }

  // 204 No Content responses (e.g. DELETE) have no JSON body to parse.
  if (response.status === 204) {
    return undefined as T;
  }

  let payload: ApiResponse<T>;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    throw new ApiClientError('The server returned an unexpected response.', undefined, response.status);
  }

  if (!payload.ok) {
    throw new ApiClientError(payload.error.message, payload.error.code, response.status);
  }

  return payload.data;
}

export function searchIoc(value: string, signal?: AbortSignal): Promise<AggregatedIocResult> {
  return request<AggregatedIocResult>('/api/ioc/search', { method: 'POST', body: { value }, signal });
}

export function fetchHistory(signal?: AbortSignal): Promise<HistoryEntry[]> {
  return request<HistoryEntry[]>('/api/history', { method: 'GET', signal });
}

export function deleteHistoryEntry(id: string, signal?: AbortSignal): Promise<void> {
  return request<void>(`/api/history/${encodeURIComponent(id)}`, { method: 'DELETE', signal });
}

export function clearHistory(signal?: AbortSignal): Promise<void> {
  return request<void>('/api/history', { method: 'DELETE', signal });
}
