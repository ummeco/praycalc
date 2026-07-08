/**
 * Purpose: Unit tests for the TV pairing mutation builders + deep link PIN extraction.
 * Constraints: Regression guard — CLAIM_TV_MUTATION must be an UPDATE keyed on `pin`
 *   and must NEVER send device_id (the TV owns its own stable device_id; overwriting
 *   it breaks the TV's ability to find its settings/paired-state on reboot). Column
 *   names (pin, device_id, is_active, paired, user_id, latitude, longitude, city,
 *   timezone) must match tv/src/lib/graphql/queries.ts CHECK_PRAYCALC_PAIRING exactly.
 */

import {
  buildPairTvRequest,
  buildSeedTvSettingsRequest,
  isValidPin,
  extractPinFromDeepLink,
  CLAIM_TV_MUTATION,
  SEED_TV_SETTINGS_MUTATION,
  DEFAULT_TV_NAME,
} from '../pairingMutation';

describe('isValidPin', () => {
  it('accepts a 6-digit numeric string', () => {
    expect(isValidPin('123456')).toBe(true);
  });

  it.each(['12345', '1234567', 'abcdef', '', '12a456'])('rejects invalid PIN %p', (pin) => {
    expect(isValidPin(pin)).toBe(false);
  });
});

describe('buildPairTvRequest', () => {
  it('builds variables with the given pin, nulling location when omitted', () => {
    const { query, variables } = buildPairTvRequest('654321');
    expect(variables).toEqual({
      pin: '654321',
      latitude: null,
      longitude: null,
      city: null,
      timezone: null,
    });
    expect(query).toBe(CLAIM_TV_MUTATION);
  });

  it('includes the active location when provided', () => {
    const { variables } = buildPairTvRequest('654321', {
      latitude: 21.4225,
      longitude: 39.8262,
      city: 'Makkah',
      timezone: 'Asia/Riyadh',
    });
    expect(variables).toEqual({
      pin: '654321',
      latitude: 21.4225,
      longitude: 39.8262,
      city: 'Makkah',
      timezone: 'Asia/Riyadh',
    });
  });

  it('never sends a device_id — the TV owns its own stable device_id', () => {
    const { variables } = buildPairTvRequest('654321');
    expect(variables).not.toHaveProperty('deviceId');
    expect(CLAIM_TV_MUTATION).not.toContain('$deviceId');
    expect(CLAIM_TV_MUTATION).not.toContain('device_id: $deviceId');
  });

  it('mutation is an UPDATE on pc_tv_pairing keyed by pin, guarded by is_active + unpaired', () => {
    // TV polls: pc_tv_pairing(where: { pin, is_active }) { paired, user_id, device_id }
    expect(CLAIM_TV_MUTATION).toContain('update_pc_tv_pairing');
    expect(CLAIM_TV_MUTATION).not.toContain('insert_pc_tv_pairing_one');
    expect(CLAIM_TV_MUTATION).toContain('pin: { _eq: $pin }');
    expect(CLAIM_TV_MUTATION).toContain('is_active: { _eq: true }');
    expect(CLAIM_TV_MUTATION).toContain('paired: { _eq: false }');
    expect(CLAIM_TV_MUTATION).toContain('paired: true');
    expect(CLAIM_TV_MUTATION).toContain('latitude: $latitude');
    expect(CLAIM_TV_MUTATION).toContain('longitude: $longitude');
    expect(CLAIM_TV_MUTATION).toContain('city: $city');
    expect(CLAIM_TV_MUTATION).toContain('timezone: $timezone');
    expect(CLAIM_TV_MUTATION).toContain('affected_rows');
    expect(CLAIM_TV_MUTATION).toContain('device_id');
  });

  it('throws when the PIN is not 6 digits', () => {
    expect(() => buildPairTvRequest('123')).toThrow('PIN must be exactly 6 digits.');
  });
});

describe('buildSeedTvSettingsRequest', () => {
  it('builds variables with default name and null location when omitted', () => {
    const { query, variables } = buildSeedTvSettingsRequest('mobile-abc123');
    expect(variables).toEqual({
      deviceId: 'mobile-abc123',
      name: DEFAULT_TV_NAME,
      latitude: null,
      longitude: null,
      city: null,
      timezone: null,
    });
    expect(query).toBe(SEED_TV_SETTINGS_MUTATION);
  });

  it('includes the active location when provided', () => {
    const { variables } = buildSeedTvSettingsRequest('mobile-abc123', {
      latitude: 24.4672,
      longitude: 39.6111,
      city: 'Medina',
      timezone: 'Asia/Riyadh',
    });
    expect(variables).toMatchObject({
      latitude: 24.4672,
      longitude: 39.6111,
      city: 'Medina',
      timezone: 'Asia/Riyadh',
    });
  });

  it('mutation upserts pc_tv_settings keyed on device_id, preserving name on conflict', () => {
    expect(SEED_TV_SETTINGS_MUTATION).toContain('insert_pc_tv_settings_one');
    expect(SEED_TV_SETTINGS_MUTATION).toContain('constraint: pc_tv_settings_device_key');
    expect(SEED_TV_SETTINGS_MUTATION).toContain('update_columns: [latitude, longitude, city, timezone]');
    expect(SEED_TV_SETTINGS_MUTATION).not.toMatch(/update_columns:\s*\[[^\]]*name/);
  });

  it('throws when deviceId is empty (the TV device_id returned by the claim)', () => {
    expect(() => buildSeedTvSettingsRequest('')).toThrow('Device ID is required.');
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
