import type { IocType } from '@tid/shared';

const MAX_IOC_LENGTH = 2048;

const HASH_PATTERN = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/;
const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
const IPV6_SEGMENT_PATTERN = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
const DOMAIN_PATTERN = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function isValidIpv4(value: string): boolean {
  const match = IPV4_PATTERN.exec(value);
  if (!match) return false;
  return match.slice(1, 5).every((octet) => Number(octet) <= 255 && (octet.length === 1 || octet[0] !== '0'));
}

function isValidIpv6(value: string): boolean {
  if (!value.includes(':') || !IPV6_SEGMENT_PATTERN.test(value)) return false;
  // RFC 4291 allows at most one "::" compression per address.
  if ((value.match(/::/g)?.length ?? 0) > 1) return false;
  const groups = value.split(':');
  if (groups.length > 8) return false;
  const emptyGroups = groups.filter((group) => group === '').length;
  // A valid IPv6 address has at most one "::" collapse, which yields at most 2-3 empty split segments
  // (leading/trailing/middle), never more.
  return emptyGroups <= 3;
}

function isUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Detects the IOC type from a raw search string, checked in specificity order:
 * hash (unambiguous hex length) -> ip -> url (has a scheme) -> domain (fallback).
 * Returns null for anything that doesn't match a recognized shape.
 */
export function detectIocType(value: string): IocType | null {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_IOC_LENGTH) return null;

  if (HASH_PATTERN.test(trimmed)) return 'hash';
  if (isValidIpv4(trimmed) || isValidIpv6(trimmed)) return 'ip';
  // A dotted-quad shape that fails strict octet validation (e.g. "999.999.999.999") is a
  // malformed IP, not a domain -- stop here instead of letting the digits match DOMAIN_PATTERN.
  if (IPV4_PATTERN.test(trimmed)) return null;
  if (isUrl(trimmed)) return 'url';
  if (DOMAIN_PATTERN.test(trimmed)) return 'domain';
  return null;
}

/**
 * Normalizes an IOC value for use as a cache/lookup key. Hashes, IPs, and domains are
 * lowercased (case-insensitive by definition); URLs keep their case since paths/query
 * strings can be case-sensitive.
 */
export function normalizeIoc(value: string, type: IocType): string {
  const trimmed = value.trim();
  return type === 'url' ? trimmed : trimmed.toLowerCase();
}
