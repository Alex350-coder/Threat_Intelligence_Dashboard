import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import type { AggregatedIocResult, ApiErrorResponse, ApiSuccessResponse } from '@tid/shared';
import { API_BASE_URL, server } from '../test/server';
import { DashboardPage } from './DashboardPage';

const aggregatedResult: AggregatedIocResult = {
  ioc: '8.8.8.8',
  type: 'ip',
  verdict: 'malicious',
  score: 80,
  cached: false,
  fetchedAt: new Date().toISOString(),
  providers: [
    {
      provider: 'VirusTotal',
      status: 'ok',
      verdict: 'malicious',
      score: 80,
      summary: 'Flagged by multiple engines.',
      details: [],
    },
    {
      provider: 'AbuseIPDB',
      status: 'unavailable',
      verdict: 'unknown',
      summary: '',
      details: [],
    },
  ],
};

function renderDashboard(): void {
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  );
}

async function submitSearch(value: string): Promise<void> {
  const user = userEvent.setup();
  await user.type(screen.getByLabelText(/search an ioc/i), value);
  await user.click(screen.getByRole('button', { name: /search/i }));
}

describe('DashboardPage', () => {
  it('shows the empty state before any search has run', () => {
    renderDashboard();

    expect(screen.getByText(/no search yet/i)).toBeInTheDocument();
  });

  it('shows a loading skeleton while the search is in flight', async () => {
    server.use(
      http.post(`${API_BASE_URL}/api/ioc/search`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return HttpResponse.json({ ok: true, data: aggregatedResult } satisfies ApiSuccessResponse<AggregatedIocResult>);
      }),
    );
    renderDashboard();

    await submitSearch('8.8.8.8');

    expect(await screen.findByRole('status', { name: /loading results/i })).toBeInTheDocument();
  });

  it('renders the score summary and a panel per provider on success, including an unavailable one', async () => {
    let requestBody: unknown;
    server.use(
      http.post(`${API_BASE_URL}/api/ioc/search`, async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ ok: true, data: aggregatedResult } satisfies ApiSuccessResponse<AggregatedIocResult>);
      }),
    );
    renderDashboard();

    await submitSearch('8.8.8.8');

    await waitFor(() => expect(requestBody).toEqual({ value: '8.8.8.8' }));

    expect(await screen.findByText('8.8.8.8')).toBeInTheDocument();
    expect(screen.getByText('VirusTotal')).toBeInTheDocument();
    expect(screen.getByText('AbuseIPDB')).toBeInTheDocument();
    expect(screen.getByText('Unavailable')).toBeInTheDocument();
  });

  it('shows an error state with a working retry button when the search fails', async () => {
    let callCount = 0;
    server.use(
      http.post(`${API_BASE_URL}/api/ioc/search`, () => {
        callCount += 1;
        if (callCount === 1) {
          return HttpResponse.json(
            { ok: false, error: { code: 'UPSTREAM_ERROR', message: 'All providers are unavailable.' } } satisfies ApiErrorResponse,
            { status: 502 },
          );
        }
        return HttpResponse.json({ ok: true, data: aggregatedResult } satisfies ApiSuccessResponse<AggregatedIocResult>);
      }),
    );
    const user = userEvent.setup();
    renderDashboard();

    await submitSearch('8.8.8.8');

    expect(await screen.findByRole('alert')).toHaveTextContent(/search failed/i);
    expect(screen.getByText(/all providers are unavailable/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /try again/i }));

    await waitFor(() => expect(screen.getByText('8.8.8.8')).toBeInTheDocument());
    expect(callCount).toBe(2);
  });
});
