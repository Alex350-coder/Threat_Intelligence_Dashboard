import type { IocType } from '@tid/shared';

const HASH_PATTERN = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/;
const IPV4_PATTERN = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;
const IPV6_PATTERN = /^[0-9a-fA-F:]+:[0-9a-fA-F:]+$/;
const DOMAIN_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function isUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Non-authoritative UI hint only, for the live badge preview as the user types.
 * The backend's `ioc-detector.ts` is the single source of truth for validation.
 */
export function detectIocType(value: string): IocType | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;

  if (HASH_PATTERN.test(trimmed)) return 'hash';
  if (IPV4_PATTERN.test(trimmed) || IPV6_PATTERN.test(trimmed)) return 'ip';
  if (isUrl(trimmed)) return 'url';
  if (DOMAIN_PATTERN.test(trimmed)) return 'domain';
  return null;
}
