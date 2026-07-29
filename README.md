# Threat Intelligence Dashboard

Aggregates IOC (IP, domain, URL, hash) lookups across multiple public threat-intel providers into one normalized view.

Project documentation and specs live in [`.claude/`](../.claude), starting with [`Plan.md`](../.claude/Plan.md) and [`Architecture.md`](../.claude/Architecture.md).

## Workspaces

- `frontend/` — React + TypeScript SPA
- `backend/` — Node.js + TypeScript API (proxies and aggregates provider calls)
- `shared/` — shared TypeScript types/contracts used by both apps

## Getting Started

```bash
npm install
cp .env.example .env   # fill in provider API keys
npm run dev             # starts backend + frontend together
```
