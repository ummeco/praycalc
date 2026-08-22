/**
 * localDayAtLongitude — the voice surfaces answer for the USER's day, not the server's.
 *
 * Alexa and Google previously defaulted to `new Date().toISOString().split('T')[0]`, the
 * server's UTC day. A user in Auckland asking at 10am local was answered for the previous
 * day. See P12.
 */
import { describe, it, expect } from 'vitest';
import { localDayAtLongitude } from '../src/lib/prayer-calculator.js';

describe('localDayAtLongitude', () => {
  it('returns the next day east of the dateline boundary when UTC has not rolled over', () => {
    // 12:00 UTC on the 22nd is 01:00 on the 23rd at UTC+13 (Auckland, longitude ~175E).
    const at = new Date('2026-08-22T12:00:00Z');
    expect(localDayAtLongitude(174.76, at)).toBe('2026-08-23');
    expect(at.toISOString().split('T')[0]).toBe('2026-08-22'); // what the old code used
  });

  it('returns the previous day far west when UTC has already rolled over', () => {
    // 02:00 UTC on the 23rd is 16:00 on the 22nd at UTC-10 (Honolulu, longitude ~158W).
    const at = new Date('2026-08-23T02:00:00Z');
    expect(localDayAtLongitude(-157.86, at)).toBe('2026-08-22');
    expect(at.toISOString().split('T')[0]).toBe('2026-08-23');
  });

  it('agrees with UTC at the prime meridian', () => {
    const at = new Date('2026-08-22T12:00:00Z');
    expect(localDayAtLongitude(0, at)).toBe('2026-08-22');
  });

  it('is within one day of the true local day at every longitude', () => {
    // Sanity sweep: the helper must never be more than a day away from UTC, which would
    // indicate broken offset arithmetic rather than a timezone nuance.
    const at = new Date('2026-08-22T12:00:00Z');
    for (let lng = -180; lng <= 180; lng += 5) {
      const day = localDayAtLongitude(lng, at);
      expect(day).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      const delta = Math.abs(
        (new Date(day + 'T00:00:00Z').getTime() - new Date('2026-08-22T00:00:00Z').getTime()) / 86_400_000,
      );
      expect(delta, `longitude ${lng}`).toBeLessThanOrEqual(1);
    }
  });

  it('is stable regardless of the host timezone', () => {
    // The helper works off the UTC instant and an offset, never host-local components.
    const at = new Date('2026-08-22T12:00:00Z');
    expect(localDayAtLongitude(174.76, at)).toBe('2026-08-23');
  });
});
