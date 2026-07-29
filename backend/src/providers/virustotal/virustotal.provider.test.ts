import { test } from 'node:test';
import assert from 'node:assert/strict';
import { detectShape } from './virustotal.provider.js';

test('detects a sha256 hash', () => {
  assert.equal(detectShape('a'.repeat(64)), 'hash');
});

test('detects a md5 hash', () => {
  assert.equal(detectShape('a'.repeat(32)), 'hash');
});

test('detects an IPv4 address', () => {
  assert.equal(detectShape('8.8.8.8'), 'ip');
});

test('detects an IPv6 address', () => {
  assert.equal(detectShape('2001:4860:4860::8888'), 'ip');
});

test('detects a URL with a scheme', () => {
  assert.equal(detectShape('https://example.com/path'), 'url');
});

test('detects a bare domain', () => {
  assert.equal(detectShape('example.com'), 'domain');
});

test('returns null for an unrecognizable value', () => {
  assert.equal(detectShape('not a valid ioc!!'), null);
});
