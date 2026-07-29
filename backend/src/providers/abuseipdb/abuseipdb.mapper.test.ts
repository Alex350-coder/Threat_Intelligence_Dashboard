import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapAbuseIpDbResult, unavailableAbuseIpDbResult, type AbuseIpDbCheckData } from './abuseipdb.mapper.js';

function baseData(overrides: Partial<AbuseIpDbCheckData> = {}): AbuseIpDbCheckData {
  return {
    ipAddress: '1.2.3.4',
    abuseConfidenceScore: 0,
    countryCode: 'US',
    isp: 'Example ISP',
    usageType: 'Data Center',
    totalReports: 0,
    lastReportedAt: null,
    ...overrides,
  };
}

test('maps score >= 75 to malicious', () => {
  const result = mapAbuseIpDbResult(baseData({ abuseConfidenceScore: 90 }));
  assert.equal(result.verdict, 'malicious');
  assert.equal(result.status, 'ok');
  assert.equal(result.score, 90);
});

test('maps score >= 25 and < 75 to suspicious', () => {
  const result = mapAbuseIpDbResult(baseData({ abuseConfidenceScore: 40 }));
  assert.equal(result.verdict, 'suspicious');
});

test('maps score === 0 to clean', () => {
  const result = mapAbuseIpDbResult(baseData({ abuseConfidenceScore: 0 }));
  assert.equal(result.verdict, 'clean');
});

test('maps score between 1 and 24 to unknown', () => {
  const result = mapAbuseIpDbResult(baseData({ abuseConfidenceScore: 10 }));
  assert.equal(result.verdict, 'unknown');
});

test('includes link to AbuseIPDB check page', () => {
  const result = mapAbuseIpDbResult(baseData({ ipAddress: '8.8.8.8' }));
  assert.equal(result.link, 'https://www.abuseipdb.com/check/8.8.8.8');
});

test('unavailable result has status unavailable and empty details', () => {
  const result = unavailableAbuseIpDbResult();
  assert.equal(result.status, 'unavailable');
  assert.equal(result.verdict, 'unknown');
  assert.deepEqual(result.details, []);
});
