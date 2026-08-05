# Threat Intelligence Dashboard

Aggregates IOC (IP, domain, URL, hash) lookups across multiple public threat-intel providers into one normalized view. Paste an indicator, get instant verdicts from AbuseIPDB and VirusTotal without leaving your dashboard.

## Documentation

Project specifications, architecture, and development guidelines live in [`.claude/`](../.claude), starting with [`Plan.md`](../.claude/Plan.md) and [`Architecture.md`](../.claude/Architecture.md).

## Workspaces

- `frontend/` — React + TypeScript SPA, Vite, Tailwind CSS
- `backend/` — Node.js + TypeScript API (proxies and aggregates provider calls)
- `shared/` — Shared TypeScript types and contracts used by both apps

## Getting Started

```bash
npm install
cp .env.example .env   # fill in provider API keys
npm run dev             # starts backend + frontend together
```

### Environment Variables

Core required variables (will fail at boot if missing):
- `VIRUSTOTAL_API_KEY` — VirusTotal API key (https://virustotal.com)
- `ABUSEIPDB_API_KEY` — AbuseIPDB API key (https://abuseipdb.com)
- `CACHE_TTL` — Result cache time-to-live in milliseconds
- `RATE_LIMIT_WINDOW_MS` — Rate-limit window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS` — Max requests per window
- `CORS_ORIGIN` — Allowed CORS origin (e.g., `http://localhost:5173` for dev)
- `PORT` — Server port (optional, defaults to 4000)

Optional variables:
- `TRUST_PROXY_HOPS` — Number of reverse-proxy hops in front of the app (e.g. `1` for a single PaaS load balancer); defaults to `0` (no proxy trusted)
- `HISTORY_LIMIT` — Max recent searches to retain locally (defaults to 100)
- `DB_PATH` — SQLite database file path (defaults to `./data/threat-intel.db`)
- `VITE_API_BASE_URL` — Frontend API endpoint (defaults to `http://localhost:4000` in dev)
- `IPINFO_TOKEN`, `URLSCAN_API_KEY` — Reserved for future providers (leave blank)

## Available Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start backend and frontend concurrently in development mode |
| `npm run build` | Build all workspaces for production (shared → backend → frontend) |
| `npm run lint` | Run ESLint across all workspaces |
| `npm run test` | Run all workspace tests (shared, backend, frontend) |

### Workspace-Specific Scripts

**Backend** (`-w backend`):
- `npm run dev -w backend` — Start backend with hot-reload (tsx watch)
- `npm run test -w backend` — Run backend unit + integration tests
- `npm run test:coverage -w backend` — Run tests with coverage report
- `npm run start -w backend` — Start production build

**Frontend** (`-w frontend`):
- `npm run dev -w frontend` — Start Vite dev server (usually runs via root `dev`)
- `npm run preview -w frontend` — Serve production build locally
- `npm run test -w frontend` — Run frontend component tests
- `npm run test:coverage -w frontend` — Run tests with coverage report

## Testing

### Backend

Backend uses Node.js built-in test runner (`node --test` via tsx):

```bash
npm run test -w backend                 # Run all tests
npm run test:coverage -w backend        # Run with coverage (target ≥80%)
```

Coverage includes unit tests for providers (AbuseIPDB, VirusTotal), services (cache, history, favorites, search orchestration), and integration tests for the full HTTP API against an in-memory SQLite database.

### Frontend

Frontend uses Vitest (jsdom) with Testing Library and Mock Service Worker (MSW):

```bash
npm run test -w frontend                # Run all tests
npm run test:coverage -w frontend       # Run with coverage
```

Tests cover core search and result flows, error states, and dashboard interactions. Tests use MSW to mock the backend API.

## Security

This is a security tool, so security is built-in by default. Key practices:

- **Secrets server-side only** — API keys never reach the client; all external lookups proxied through the backend
- **Input validation** — All IOC inputs validated at the API boundary; malformed queries return `400 Bad Request`
- **Rate limiting** — Public API rate-limited to prevent abuse of upstream provider quotas; excess requests return `429 Too Many Requests`
- **Error safety** — Errors never leak stack traces, internal paths, or provider keys; failures degrade gracefully to "unavailable" status
- **Response caching** — Repeated lookups served from local SQLite cache, reducing calls to external providers
- **Security headers** — HTTPS, CORS restricted to known origin, Content-Security-Policy, X-Frame-Options, etc. (see [Security.md](../.claude/Security.md) for full details)

For a deeper dive, see [Security.md](../.claude/Security.md) in the documentation.

## Status

**Phases 1–10 (MVP):** Complete. All core features shipped:
- IOC detection and multi-provider aggregation (AbuseIPDB, VirusTotal)
- Dark-mode-first dashboard with responsive design
- Scroll-scrubbed canvas hero background (210-frame JPEG sequence)
- History and favorites tracking (local SQLite)
- Response caching and rate limiting
- Comprehensive test coverage (backend 98%+ lines, frontend 71%+ lines)
- Production build optimization (code splitting, lazy routes, Lighthouse 97 Performance / 100 Accessibility)

**Phase 11 (Deployment):** Not started. This phase requires:
- A hosting account (AWS, Vercel, Fly.io, etc.) — not included in this repository
- Environment variable secrets provisioned in the host's secret store
- HTTPS certificate (auto-provisioned by most modern PaaS platforms)

**Phase 12 (Final Review):** Complete for everything achievable pre-deployment — security hardening (CSP, HSTS, hop-aware trust proxy, request body size limit, query-string-free logging), `npm audit` review, and documentation are done. Live-deployment-only checks (HTTPS smoke test, public rate-limit validation) remain blocked on Phase 11.

To run the app locally, see [Getting Started](#getting-started) above. The full phase sequence is documented in [Plan.md](../.claude/Plan.md).
