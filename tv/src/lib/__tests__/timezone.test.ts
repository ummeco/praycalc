/**
 * Purpose: Verify TvSettings.timezone resolution — numeric offset strings, IANA zones
 *   (with DST), and graceful fallback for missing/invalid input.
 * SPORT: praycalc/tv lib tests
 */

import { resolveTimezoneOffset } from '../timezone';

describe('resolveTimezoneOffset', () => {
  it('parses a raw numeric offset string', () => {
    expect(resolveTimezoneOffset('+3', new Date('2026-01-15'))).toBe(3);
    expect(resolveTimezoneOffset('-5.5', new Date('2026-01-15'))).toBe(-5.5);
    expect(resolveTimezoneOffset('0', new Date('2026-01-15'))).toBe(0);
  });

  it('resolves an IANA zone with no DST (Saudi Arabia, UTC+3 year-round)', () => {
    expect(resolveTimezoneOffset('Asia/Riyadh', new Date('2026-01-15'))).toBe(3);
    expect(resolveTimezoneOffset('Asia/Riyadh', new Date('2026-07-15'))).toBe(3);
  });

  it('resolves an IANA zone across a DST boundary', () => {
    expect(resolveTimezoneOffset('America/New_York', new Date('2026-01-15'))).toBe(-5);
    expect(resolveTimezoneOffset('America/New_York', new Date('2026-07-15'))).toBe(-4);
  });

  it('returns 0 for an undefined or empty timezone', () => {
    expect(resolveTimezoneOffset(undefined, new Date('2026-01-15'))).toBe(0);
    expect(resolveTimezoneOffset('', new Date('2026-01-15'))).toBe(0);
  });

  it('returns 0 for an unrecognized zone name instead of throwing', () => {
    expect(resolveTimezoneOffset('Not/AZone', new Date('2026-01-15'))).toBe(0);
  });
});
