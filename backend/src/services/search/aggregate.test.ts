import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type { ProviderResult } from '@tid/shared';
import { aggregateVerdict, aggregateScore, allProvidersUnavailable } from './aggregate.js';

function result(overrides: Partial<ProviderResult>): ProviderResult {
  return {
    provider: 'test',
    status: 'ok',
    verdict: 'unknown',
    summary: '',
    details: [],
    ...overrides,
  };
}

describe('aggregateVerdict', () => {
  it('returns unknown when no providers reported', () => {
    assert.equal(aggregateVerdict([]), 'unknown');
  });

  it('ignores unavailable providers', () => {
    assert.equal(
      aggregateVerdict([result({ status: 'unavailable', verdict: 'malicious' })]),
      'unknown',
    );
  });

  it('picks the worst verdict among reporting providers', () => {
    const providers = [
      result({ verdict: 'clean' }),
      result({ verdict: 'malicious' }),
      result({ verdict: 'suspicious' }),
    ];
    assert.equal(aggregateVerdict(providers), 'malicious');
  });
});

describe('aggregateScore', () => {
  it('returns 0 when no provider has a score', () => {
    assert.equal(aggregateScore([result({})]), 0);
  });

  it('averages scores from reporting providers with a score', () => {
    const providers = [result({ score: 40 }), result({ score: 60 }), result({ status: 'unavailable', score: 100 })];
    assert.equal(aggregateScore(providers), 50);
  });
});

describe('allProvidersUnavailable', () => {
  it('returns false for an empty list', () => {
    assert.equal(allProvidersUnavailable([]), false);
  });

  it('returns true when every provider is unavailable', () => {
    assert.equal(
      allProvidersUnavailable([result({ status: 'unavailable' }), result({ status: 'unavailable' })]),
      true,
    );
  });

  it('returns false when at least one provider reported', () => {
    assert.equal(
      allProvidersUnavailable([result({ status: 'unavailable' }), result({ status: 'ok' })]),
      false,
    );
  });
});
