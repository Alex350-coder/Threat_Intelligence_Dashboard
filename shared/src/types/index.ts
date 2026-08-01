export type IocType = 'ip' | 'domain' | 'url' | 'hash';

export type ApiErrorCode =
  | 'BAD_REQUEST'
  | 'NOT_FOUND'
  | 'RATE_LIMITED'
  | 'UPSTREAM_ERROR'
  | 'INTERNAL_ERROR';

export interface ApiSuccessResponse<T> {
  ok: true;
  data: T;
}

export interface ApiErrorResponse {
  ok: false;
  error: {
    code: ApiErrorCode;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export type Verdict = 'malicious' | 'suspicious' | 'clean' | 'unknown';

export type ProviderStatus = 'ok' | 'unavailable';

export interface KeyValue {
  key: string;
  value: string;
}

export interface ProviderResult {
  provider: string;
  status: ProviderStatus;
  verdict: Verdict;
  score?: number;
  summary: string;
  details: KeyValue[];
  link?: string;
}

export interface AggregatedIocResult {
  ioc: string;
  type: IocType;
  verdict: Verdict;
  score: number;
  providers: ProviderResult[];
  cached: boolean;
  fetchedAt: string;
}

export interface HistoryEntry {
  id: string;
  iocValue: string;
  iocType: IocType;
  verdict: Verdict;
  score: number;
  createdAt: string;
}

export interface FavoriteEntry {
  id: string;
  iocValue: string;
  iocType: IocType;
  verdict: Verdict;
  score: number;
  createdAt: string;
}

export interface FavoriteToggleRequest {
  ioc: string;
  type: IocType;
  verdict: Verdict;
  score: number;
}

export interface FavoriteToggleResult {
  favorited: boolean;
}
