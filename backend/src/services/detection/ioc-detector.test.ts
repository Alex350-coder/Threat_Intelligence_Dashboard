import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { detectIocType, normalizeIoc } from './ioc-detector.js';

describe('detectIocType', () => {
  it('detects an md5 hash', () => {
    assert.equal(detectIocType('44d88612fea8a8f36de82e1278abb02f'), 'hash');
  });

  it('detects a sha1 hash', () => {
    assert.equal(detectIocType('da39a3ee5e6b4b0d3255bfef95601890afd80709'), 'hash');
  });

  it('detects a sha256 hash', () => {
    assert.equal(detectIocType('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'.slice(0, 64)), 'hash');
  });

  it('detects an ipv4 address', () => {
    assert.equal(detectIocType('8.8.8.8'), 'ip');
  });

  it('rejects an ipv4 address with an out-of-range octet', () => {
    assert.equal(detectIocType('999.999.999.999'), null);
  });

  it('detects an ipv6 address', () => {
    assert.equal(detectIocType('2001:4860:4860::8888'), 'ip');
  });

  it('rejects an ipv6 address with more than one "::" collapse', () => {
    assert.equal(detectIocType('1::2::3'), null);
  });

  it('detects an http url', () => {
    assert.equal(detectIocType('http://malicious.example.com/payload.exe'), 'url');
  });

  it('detects an https url', () => {
    assert.equal(detectIocType('https://malicious.example.com/payload.exe'), 'url');
  });

  it('rejects a non-http(s) scheme url', () => {
    assert.equal(detectIocType('javascript:alert(1)'), null);
  });

  it('detects a domain', () => {
    assert.equal(detectIocType('malicious.example.com'), 'domain');
  });

  it('returns null for an empty string', () => {
    assert.equal(detectIocType('   '), null);
  });

  it('returns null for gibberish that matches nothing', () => {
    assert.equal(detectIocType('not a valid ioc!!!'), null);
  });

  it('returns null for an overly long input', () => {
    assert.equal(detectIocType('a'.repeat(3000)), null);
  });

  it('trims surrounding whitespace before detecting', () => {
    assert.equal(detectIocType('  8.8.8.8  '), 'ip');
  });
});

describe('normalizeIoc', () => {
  it('lowercases a domain', () => {
    assert.equal(normalizeIoc('Malicious.Example.COM', 'domain'), 'malicious.example.com');
  });

  it('lowercases a hash', () => {
    assert.equal(normalizeIoc('44D88612FEA8A8F36DE82E1278ABB02F', 'hash'), '44d88612fea8a8f36de82e1278abb02f');
  });

  it('lowercases an ip', () => {
    assert.equal(normalizeIoc('2001:4860:4860::8888', 'ip'), '2001:4860:4860::8888');
  });

  it('preserves url casing', () => {
    assert.equal(normalizeIoc('https://Example.com/Path?Q=1', 'url'), 'https://Example.com/Path?Q=1');
  });

  it('trims surrounding whitespace', () => {
    assert.equal(normalizeIoc('  malicious.example.com  ', 'domain'), 'malicious.example.com');
  });
});
