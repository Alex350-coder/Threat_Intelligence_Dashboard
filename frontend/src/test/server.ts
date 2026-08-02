import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import type { ApiSuccessResponse, FavoriteEntry } from '@tid/shared';

export const API_BASE_URL = 'http://localhost:4000';

const emptyFavorites: ApiSuccessResponse<FavoriteEntry[]> = { ok: true, data: [] };

// Default handlers cover the endpoints every dashboard render touches
// (ScoreSummary mounts FavoriteButton, which fetches favorites on mount).
// Individual tests override with `server.use(...)` for specific scenarios.
export const handlers = [
  http.get(`${API_BASE_URL}/api/favorites`, () => HttpResponse.json(emptyFavorites)),
];

export const server = setupServer(...handlers);
