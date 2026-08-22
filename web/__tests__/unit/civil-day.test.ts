/**
 * civil-day.test.ts — the calendar day a surface serves must be the VIEWER's day.
 *
 * PURPOSE: Lock the fix for the P12-E01 production bug. Server-rendered surfaces took the
 *   server's instant (UTC on Vercel) and paired it with the *city's* UTC offset, so the date
 *   came from one timezone and the offset from another. Measured 2026-08-22 across 24 hourly
 *   samples, the share of each day on which the server's UTC date differs from the city's:
 *     Auckland 12/24 · Honolulu 10/24 · Tokyo 9/24.
 *   For half of every day an Auckland viewer was shown the previous day's prayer times.
 *
 * CONSTRAINTS:
 *   - Assert the DAY, never merely that a time came back. The bug produced perfectly
 *     well-formed times for the wrong day, so any shape-only assertion passed throughout.
 *   - No fixed-offset arithmetic in the helper under test: offsets move with DST.
 * REF: P12-E01-T01 · P12-E01-T05
 */

import { describe, it, expect } from 'vitest';
import { civilDayIn, getUtcOffset } from '@/lib/geo';

/** The day `tz` is actually on at `instant`, via Intl — an independent oracle. */
function oracleDay(tz: string, instant: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(instant);
}

describe('civilDayIn — the viewer\'s calendar day', () => {
  it('matches Intl for every zone across a full day of instants', () => {
    const zones = [
      'Pacific/Auckland',
      'Pacific/Honolulu',
      'Asia/Tokyo',
      'Europe/London',
      'America/New_York',
      'UTC',
    ];
    for (const tz of zones) {
      for (let h = 0; h < 24; h++) {
        const at = new Date(Date.UTC(2026, 7, 22, h));
        expect(civilDayIn(tz, at), `${tz} @ ${h}:00Z`).toBe(oracleDay(tz, at));
      }
    }
  });

  it('differs from the server UTC day exactly when the zone is on another date', () => {
    // This is the bug, stated as a property. If civilDayIn ever collapses to the UTC day,
    // these counts go to zero and the regression is back.
    const expected: Record<string, number> = {
      'Pacific/Auckland': 12,
      'Pacific/Honolulu': 10,
      'Asia/Tokyo': 9,
    };
    for (const [tz, want] of Object.entries(expected)) {
      let differing = 0;
      for (let h = 0; h < 24; h++) {
        const at = new Date(Date.UTC(2026, 7, 22, h));
        const utcDay = at.toISOString().slice(0, 10);
        if (civilDayIn(tz, at) !== utcDay) differing++;
      }
      expect(differing, `${tz} hours differing from the UTC day`).toBe(want);
    }
  });

  it('is correct on both sides of a southern-hemisphere DST transition', () => {
    // Auckland leaves DST 2026-04-05 (UTC+13 -> UTC+12) and enters it 2026-09-27.
    // A fixed-offset implementation passes one of these and fails the other.
    for (const iso of ['2026-04-04T12:00:00Z', '2026-04-06T12:00:00Z',
                       '2026-09-26T12:00:00Z', '2026-09-28T12:00:00Z']) {
      const at = new Date(iso);
      expect(civilDayIn('Pacific/Auckland', at), iso).toBe(oracleDay('Pacific/Auckland', at));
    }
  });

  it('accepts a numeric UTC offset, as getUtcOffset does', () => {
    // The embed and ICS surfaces may receive a bare offset rather than an IANA name.
    // Intl cannot parse those, so the helper must handle both or those surfaces break.
    const at = new Date('2026-08-22T12:00:00Z');
    expect(civilDayIn('13', at)).toBe('2026-08-23'); // 12:00Z + 13h = next day
    expect(civilDayIn('-11', at)).toBe('2026-08-22'); // 12:00Z - 11h = same day, 01:00
    expect(civilDayIn('0', at)).toBe('2026-08-22');
    // And it stays consistent with the offset helper it sits beside.
    expect(getUtcOffset('13', at)).toBe(13);
  });

  it('rejects an unusable timezone rather than silently returning the UTC day', () => {
    // Silently falling back to UTC is how this bug looks in production: plausible output,
    // wrong day, no error anywhere.
    expect(() => civilDayIn('Not/AZone', new Date())).toThrow();
    expect(() => civilDayIn('99', new Date())).toThrow();
  });

  it('returns YYYY-MM-DD, the unambiguous form pray-calc 2.4.0 accepts', () => {
    expect(civilDayIn('Asia/Tokyo', new Date('2026-01-05T00:00:00Z'))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Zero-padded, not 2026-1-5 — pray-calc's parser requires two digits.
    expect(civilDayIn('UTC', new Date('2026-01-05T00:00:00Z'))).toBe('2026-01-05');
  });
});
