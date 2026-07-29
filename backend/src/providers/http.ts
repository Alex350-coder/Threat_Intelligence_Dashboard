const DEFAULT_TIMEOUT_MS = 8000;

export interface FetchWithTimeoutOptions {
  headers?: Record<string, string>;
  timeoutMs?: number;
}

/** Rejects on timeout/network/non-2xx so callers can collapse any failure into a single catch. */
export async function fetchWithTimeout(url: string, options: FetchWithTimeoutOptions = {}): Promise<unknown> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(url, { headers: options.headers, signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Request to ${new URL(url).host} failed with status ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}
