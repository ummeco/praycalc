/**
 * Purpose: Unit tests for parseDeepLink — praycalc:// URL -> DeepLinkRoute parsing,
 *   covering the original pairing shape (regression guard, must match
 *   pairing/pairingMutation.ts's extractPinFromDeepLink behavior) plus the new
 *   city/times routes.
 */

import { parseDeepLink } from '../deepLinkRoutes';

describe('parseDeepLink — pairing (praycalc://pair?pin=NNNNNN)', () => {
  it('parses a valid pairing link', () => {
    expect(parseDeepLink('praycalc://pair?pin=123456')).toEqual({ kind: 'pair', pin: '123456' });
  });

  it('returns null when pin is missing', () => {
    expect(parseDeepLink('praycalc://pair')).toBeNull();
  });

  it('returns null when pin is malformed (not 6 digits)', () => {
    expect(parseDeepLink('praycalc://pair?pin=abc')).toBeNull();
    expect(parseDeepLink('praycalc://pair?pin=12345')).toBeNull();
  });
});

describe('parseDeepLink — city (praycalc://city/<name>)', () => {
  it('parses a simple city name', () => {
    expect(parseDeepLink('praycalc://city/London')).toEqual({ kind: 'city', name: 'London' });
  });

  it('decodes a URL-encoded city name', () => {
    expect(parseDeepLink('praycalc://city/New%20York')).toEqual({ kind: 'city', name: 'New York' });
  });

  it('returns null when no city name segment is present', () => {
    expect(parseDeepLink('praycalc://city/')).toBeNull();
    expect(parseDeepLink('praycalc://city')).toBeNull();
  });
});

describe('parseDeepLink — times (praycalc://times)', () => {
  it('parses the times route with no params', () => {
    expect(parseDeepLink('praycalc://times')).toEqual({ kind: 'times' });
  });
});

describe('parseDeepLink — unrecognized / malformed input', () => {
  it('returns null for an unknown host', () => {
    expect(parseDeepLink('praycalc://settings')).toBeNull();
  });

  it('returns null for a non-praycalc scheme', () => {
    expect(parseDeepLink('https://praycalc.com')).toBeNull();
  });

  it('returns null for a malformed URL string', () => {
    expect(parseDeepLink('not a url')).toBeNull();
  });
});
