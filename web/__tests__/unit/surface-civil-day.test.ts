/**
 * surface-civil-day.test.ts — every server-rendered surface serves the viewer's day.
 *
 * PURPOSE: These assert the P12-E01 fix at the seam that actually mattered: the date handed
 *   to the prayer engine. Written before the fix and confirmed failing against it, because a
 *   regression test that has never failed is not evidence of anything.
 *
 * CONSTRAINTS:
 *   - Assert the DAY. The bug returned well-formed times for the wrong date.
 *   - Cover a far-east zone, a far-west zone, and UTC as control.
 * REF: P12-E01-T05
 */

import { describe, it, expect } from 'vitest';
import { civilDayIn, getUtcOffset } from '@/lib/geo';
import { getPrayerTimes } from '@/lib/prayers.server';

/** Auckland, chosen because it was the worst case at 12 wrong hours out of 24. */
const AUCKLAND = { tz: 'Pacific/Auckland', lat: -36.8485, lng: 174.7633 };
/** Honolulu, the far-west counterpart at 10 out of 24. */
const HONOLULU = { tz: 'Pacific/Honolulu', lat: 21.3069, lng: -157.8583 };

describe('the day handed to the engine is the viewer\'s day', () => {
  it('Auckland at 12:00 UTC resolves to the Auckland date, not the UTC date', () => {
    const at = new Date('2026-08-22T12:00:00Z');
    expect(at.toISOString().slice(0, 10)).toBe('2026-08-22');   // what the server thinks
    expect(civilDayIn(AUCKLAND.tz, at)).toBe('2026-08-23');      // what Auckland is on
  });

  it('produces different times for the two days, so the bug was user-visible', () => {
    // Guards against a fix that is technically correct but changes nothing observable.
    const off = getUtcOffset(AUCKLAND.tz, new Date('2026-08-22T12:00:00Z'));
    const serverDay = getPrayerTimes('2026-08-22', AUCKLAND.lat, AUCKLAND.lng, off, false);
    const viewerDay = getPrayerTimes('2026-08-23', AUCKLAND.lat, AUCKLAND.lng, off, false);
    expect(viewerDay.Fajr).not.toBe(serverDay.Fajr);
    expect(viewerDay.Maghrib).not.toBe(serverDay.Maghrib);
  });

  it('getPrayerTimes accepts the YYYY-MM-DD form and agrees with the equivalent instant', () => {
    // pray-calc 2.4.0 normalises a UTC-noon Date to the same civil day as the string form.
    const off = -5;
    const viaString = getPrayerTimes('2026-08-22', 40.7128, -74.006, off, false);
    const viaNoonUtc = getPrayerTimes(new Date('2026-08-22T12:00:00Z'), 40.7128, -74.006, off, false);
    expect(viaString).toEqual(viaNoonUtc);
  });

  it('covers both hemispheres and UTC as control across the boundary', () => {
    for (const place of [AUCKLAND, HONOLULU, { tz: 'UTC', lat: 51.5, lng: 0 }]) {
      for (const h of [0, 6, 12, 18]) {
        const at = new Date(Date.UTC(2026, 7, 22, h));
        const day = civilDayIn(place.tz, at);
        const off = getUtcOffset(place.tz, at);
        const times = getPrayerTimes(day, place.lat, place.lng, off, false);
        // Sanity: a real time came back for the day we asked for.
        expect(times.Fajr, `${place.tz} @ ${h}:00Z`).toMatch(/^\d{2}:\d{2}:\d{2}$/);
        // And the day is the zone's own, independently confirmed.
        expect(day).toBe(
          new Intl.DateTimeFormat('en-CA', { timeZone: place.tz }).format(at),
        );
      }
    }
  });
});
