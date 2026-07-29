import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapVirusTotalResult, unavailableVirusTotalResult, type VirusTotalAnalysisStats } from './virustotal.mapper.js';

function baseStats(overrides: Partial<VirusTotalAnalysisStats> = {}): VirusTotalAnalysisStats {
  return {
    malicious: 0,
    suspicious: 0,
    undetected: 60,
    harmless: 10,
    timeout: 0,
    ...overrides,
  };
}

test('maps any malicious engines to malicious verdict', () => {
  const result = mapVirusTotalResult(baseStats({ malicious: 3 }), 'https://example.com');
  assert.equal(result.verdict, 'malicious');
  assert.equal(result.status, 'ok');
});

test('maps suspicious engines with no malicious to suspicious verdict', () => {
  const result = mapVirusTotalResult(baseStats({ suspicious: 2 }), 'https://example.com');
  assert.equal(result.verdict, 'suspicious');
});

test('maps zero malicious and zero suspicious to clean verdict', () => {
  const result = mapVirusTotalResult(baseStats(), 'https://example.com');
  assert.equal(result.verdict, 'clean');
});

test('maps all-zero stats to unknown verdict', () => {
  const result = mapVirusTotalResult(
    { malicious: 0, suspicious: 0, undetected: 0, harmless: 0, timeout: 0 },
    'https://example.com',
  );
  assert.equal(result.verdict, 'unknown');
  assert.equal(result.score, 0);
});

test('computes score as percentage of malicious+suspicious over total engines', () => {
  const result = mapVirusTotalResult(
    { malicious: 5, suspicious: 5, undetected: 80, harmless: 10, timeout: 0 },
    'https://example.com',
  );
  assert.equal(result.score, 10);
});

test('unavailable result has status unavailable and empty details', () => {
  const result = unavailableVirusTotalResult();
  assert.equal(result.status, 'unavailable');
  assert.equal(result.verdict, 'unknown');
  assert.deepEqual(result.details, []);
});
