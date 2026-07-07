/**
 * Purpose: Verify detectFallbackMethod maps countries/timezones to the correct
 *   FIXED calculation-method fallback, and never returns DPC/Custom. This is the
 *   smart-default the onboarding Method step highlights when a user opts off DPC.
 * Constraints: Pure-function tests — no mocks, no I/O.
 */

import { detectFallbackMethod, DEFAULT_FALLBACK_METHOD } from '../method-autodetect';

describe('detectFallbackMethod — country mapping', () => {
  const cases: Array<[string, string]> = [
    ['US', 'ISNA'],
    ['CA', 'ISNA'],
    ['EG', 'Egypt'],
    ['PK', 'Karachi'],
    ['IN', 'Karachi'],
    ['BD', 'Karachi'],
    ['FR', 'UOIF'],
    ['SA', 'Makkah'],
    ['AE', 'Makkah'],
    ['QA', 'Makkah'],
    ['KW', 'Makkah'],
  ];

  it.each(cases)('maps country %s → %s', (country, expected) => {
    expect(detectFallbackMethod({ countryCode: country })).toBe(expected);
  });

  it('is case-insensitive on the country code', () => {
    expect(detectFallbackMethod({ countryCode: 'us' })).toBe('ISNA');
    expect(detectFallbackMethod({ countryCode: ' eg ' })).toBe('Egypt');
  });

  it('never returns DPC or Custom', () => {
    for (const cc of ['US', 'EG', 'PK', 'FR', 'SA', 'ZZ', undefined]) {
      const result = detectFallbackMethod({ countryCode: cc });
      expect(result).not.toBe('DPC');
      expect(result).not.toBe('Custom');
    }
  });
});

describe('detectFallbackMethod — timezone fallback', () => {
  it('uses timezone only when no country code is given', () => {
    expect(detectFallbackMethod({ timezone: 'America/New_York' })).toBe('ISNA');
    expect(detectFallbackMethod({ timezone: 'Africa/Cairo' })).toBe('Egypt');
    expect(detectFallbackMethod({ timezone: 'Asia/Karachi' })).toBe('Karachi');
    expect(detectFallbackMethod({ timezone: 'Europe/Paris' })).toBe('UOIF');
    expect(detectFallbackMethod({ timezone: 'Asia/Riyadh' })).toBe('Makkah');
  });

  it('prefers country code over timezone when both are present', () => {
    // Country says France, timezone says North America — country wins.
    expect(detectFallbackMethod({ countryCode: 'FR', timezone: 'America/New_York' })).toBe('UOIF');
  });

  it('falls back to timezone when the country code is unrecognized', () => {
    expect(detectFallbackMethod({ countryCode: 'ZZ', timezone: 'Asia/Karachi' })).toBe('Karachi');
  });
});

describe('detectFallbackMethod — default', () => {
  it('returns MWL for empty input', () => {
    expect(detectFallbackMethod({})).toBe('MWL');
    expect(DEFAULT_FALLBACK_METHOD).toBe('MWL');
  });

  it('returns MWL for an unmapped country and unmapped timezone', () => {
    expect(detectFallbackMethod({ countryCode: 'JP', timezone: 'Asia/Tokyo' })).toBe('MWL');
  });
});
