export interface AppConfig {
  port: number;
  corsOrigin: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  cacheTtlSeconds: number;
  historyLimit: number;
  dbPath: string;
  virusTotalApiKey: string;
  abuseIpDbApiKey: string;
  ipInfoToken: string;
  urlScanApiKey: string;
}

const REQUIRED_VARS = [
  'CORS_ORIGIN',
  'RATE_LIMIT_WINDOW_MS',
  'RATE_LIMIT_MAX_REQUESTS',
  'CACHE_TTL',
] as const;

function requireEnv(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function requirePositiveNumberEnv(name: string): number {
  const raw = requireEnv(name);
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`Environment variable ${name} must be a positive number, got: ${raw}`);
  }
  return parsed;
}

function optionalPositiveIntegerEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw.trim() === '') {
    return fallback;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer, got: ${raw}`);
  }
  return parsed;
}

export function loadConfig(): AppConfig {
  const missing = REQUIRED_VARS.filter((name) => !process.env[name]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return {
    port: optionalPositiveIntegerEnv('PORT', 4000),
    corsOrigin: requireEnv('CORS_ORIGIN'),
    rateLimitWindowMs: requirePositiveNumberEnv('RATE_LIMIT_WINDOW_MS'),
    rateLimitMaxRequests: requirePositiveNumberEnv('RATE_LIMIT_MAX_REQUESTS'),
    cacheTtlSeconds: requirePositiveNumberEnv('CACHE_TTL'),
    historyLimit: Number(process.env.HISTORY_LIMIT ?? 100),
    dbPath: process.env.DB_PATH?.trim() || './data/threat-intel.db',
    virusTotalApiKey: process.env.VIRUSTOTAL_API_KEY ?? '',
    abuseIpDbApiKey: process.env.ABUSEIPDB_API_KEY ?? '',
    ipInfoToken: process.env.IPINFO_TOKEN ?? '',
    urlScanApiKey: process.env.URLSCAN_API_KEY ?? '',
  };
}
