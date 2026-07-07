/**
 * Purpose: Unit tests for IslamicEventsScreen's pure event-computation helpers —
 *   nextOccurrence (Hijri->Gregorian rollover) and buildUpcomingEvents (sort +
 *   content-gate filter). Component rendering is not tested (no RTL harness in
 *   this repo yet; see lib/pairing/__tests__ for the established pure-logic
 *   testing convention).
 * Constraints: Mawlid al-Nabi MUST be excluded regardless of what the data
 *   source provides — this is the load-bearing assertion in this file.
 * SPORT: praycalc/tv screens tests
 */

import { nextOccurrence, buildUpcomingEvents } from '../IslamicEventsScreen';

describe('nextOccurrence', () => {
  it('returns a date in the current Hijri year when the occasion has not passed yet', () => {
    // Ramadan start (9,1) — pick an early-year today so it is very likely still upcoming.
    const today = new Date(2026, 0, 1); // 2026-01-01
    const result = nextOccurrence(9, 1, today);
    expect(result.getTime()).toBeGreaterThan(today.getTime());
  });

  it('rolls to next Hijri year when the occasion already passed this year', () => {
    // Islamic New Year (1,1) — pick a today that is definitely after 1 Muharram passed.
    const today = new Date(2026, 11, 31); // 2026-12-31
    const result = nextOccurrence(1, 1, today);
    expect(result.getTime()).toBeGreaterThan(today.getTime());
  });
});

describe('buildUpcomingEvents', () => {
  const sources = [
    { id: 'a', name: 'Eid al-Fitr', hijriMonth: 10, hijriDay: 1 },
    { id: 'b', name: 'Ashura', hijriMonth: 1, hijriDay: 10 },
    { id: 'c', name: 'Islamic New Year', hijriMonth: 1, hijriDay: 1 },
  ];

  it('sorts events by upcoming Gregorian date ascending', () => {
    const today = new Date(2026, 0, 1);
    const result = buildUpcomingEvents(sources, today);
    const dates = result.map((e) => e.gregorianDate);
    const sorted = [...dates].sort();
    expect(dates).toEqual(sorted);
  });

  it('EXCLUDES any source row named Mawlid — content-gate defense in depth', () => {
    const today = new Date(2026, 0, 1);
    const withMawlid = [
      ...sources,
      { id: 'z', name: 'Mawlid al-Nabi', hijriMonth: 3, hijriDay: 12 },
    ];
    const result = buildUpcomingEvents(withMawlid, today);
    expect(result.find((e) => /mawlid/i.test(e.nameEn))).toBeUndefined();
    expect(result).toHaveLength(sources.length);
  });

  it('is case-insensitive on the Mawlid block', () => {
    const today = new Date(2026, 0, 1);
    const withMawlid = [{ id: 'z', name: 'MAWLID AL-NABI', hijriMonth: 3, hijriDay: 12 }];
    const result = buildUpcomingEvents(withMawlid, today);
    expect(result).toHaveLength(0);
  });

  it('produces the required IslamicEvent fields for a normal event', () => {
    const today = new Date(2026, 0, 1);
    const result = buildUpcomingEvents([sources[0]], today);
    expect(result[0]).toMatchObject({
      id: 'a',
      nameEn: 'Eid al-Fitr',
      isSignificant: true,
    });
    expect(result[0].hijriDate).toEqual(expect.any(String));
    expect(result[0].gregorianDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
