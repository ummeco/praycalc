/**
 * Purpose: Unit tests for the TV pairing mutation builder + deep link PIN extraction.
 * Constraints: Regression guard — the mutation's column names (pin, device_id, is_active,
 *   paired, user_id) must match tv/src/lib/graphql/queries.ts CHECK_PRAYCALC_PAIRING exactly.
 */

import { buildPairTvRequest, isValidPin, extractPinFromDeepLink, PAIR_TV_MUTATION } from '../pairingMutation';

describe('isValidPin', () => {
  it('accepts a 6-digit numeric string', () => {
    expect(isValidPin('123456')).toBe(true);
  });

  it.each(['12345', '1234567', 'abcdef', '', '12a456'])('rejects invalid PIN %p', (pin) => {
    expect(isValidPin(pin)).toBe(false);
  });
});

describe('buildPairTvRequest', () => {
  it('builds variables with the given pin and deviceId', () => {
    const { query, variables } = buildPairTvRequest('654321', 'mobile-abc123');
    expect(variables).toEqual({ pin: '654321', deviceId: 'mobile-abc123' });
    expect(query).toBe(PAIR_TV_MUTATION);
  });

  it('mutation targets pc_tv_pairing with columns matching the TV poll query', () => {
    // TV polls: pc_tv_pairing(where: { pin, is_active }) { paired, user_id, device_id }
    expect(PAIR_TV_MUTATION).toContain('insert_pc_tv_pairing_one');
    expect(PAIR_TV_MUTATION).toContain('pin: $pin');
    expect(PAIR_TV_MUTATION).toContain('device_id: $deviceId');
    expect(PAIR_TV_MUTATION).toContain('is_active: true');
    expect(PAIR_TV_MUTATION).toContain('paired: true');
  });

  it('throws when the PIN is not 6 digits', () => {
    expect(() => buildPairTvRequest('123', 'device-1')).toThrow('PIN must be exactly 6 digits.');
  });

  it('throws when deviceId is empty', () => {
    expect(() => buildPairTvRequest('123456', '')).toThrow('Device ID is required.');
  });
});

describe('extractPinFromDeepLink', () => {
  it('extracts a valid PIN from praycalc://pair?pin=123456', () => {
    expect(extractPinFromDeepLink('praycalc://pair?pin=123456')).toBe('123456');
  });

  it('returns null for a non-pairing praycalc:// link', () => {
    expect(extractPinFromDeepLink('praycalc://settings')).toBeNull();
  });

  it('returns null when the pin param is missing', () => {
    expect(extractPinFromDeepLink('praycalc://pair')).toBeNull();
  });

  it('returns null when the pin is malformed', () => {
    expect(extractPinFromDeepLink('praycalc://pair?pin=abc')).toBeNull();
  });

  it('returns null for an unrelated URL', () => {
    expect(extractPinFromDeepLink('https://praycalc.com')).toBeNull();
  });

  it('returns null for a garbage string', () => {
    expect(extractPinFromDeepLink('not a url')).toBeNull();
  });
});
