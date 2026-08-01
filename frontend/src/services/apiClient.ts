import type { AggregatedIocResult, ApiErrorCode, ApiResponse } from '@tid/shared';

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

async function postJson<T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    });
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    throw new ApiClientError('Could not reach the server. Check your connection and try again.');
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
  return postJson<AggregatedIocResult>('/api/ioc/search', { value }, signal);
}
