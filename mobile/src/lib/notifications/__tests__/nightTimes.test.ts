/**
 * Purpose: Unit tests for the pure night-division math (last third, middle of night)
 *   and the Suhoor / Tahajjud trigger derivation. No native modules — pure functions.
 */

import { computeNightTimes, suhoorTime, tahajjudTime } from '../nightTimes';

describe('computeNightTimes', () => {
  // Maghrib 18:00, next-day Fajr 06:00 -> a clean 12h night for exact assertions.
  const maghrib = new Date(2026, 0, 15, 18, 0, 0);
  const fajr = new Date(2026, 0, 16, 6, 0, 0);

  it('computes a 12h night length across midnight', () => {
    const n = computeNightTimes(maghrib, fajr);
    expect(n.nightLengthMs).toBe(12 * 60 * 60 * 1000);
  });

  it('places the middle of the night exactly halfway (00:00)', () => {
    const n = computeNightTimes(maghrib, fajr);
    expect(n.middleOfNight.getHours()).toBe(0);
    expect(n.middleOfNight.getMinutes()).toBe(0);
  });

  it('places the last third at Maghrib + 2/3 night (02:00 for a 12h night)', () => {
    const n = computeNightTimes(maghrib, fajr);
    // 18:00 + 8h = 02:00 next day.
    expect(n.lastThirdStart.getHours()).toBe(2);
    expect(n.lastThirdStart.getMinutes()).toBe(0);
    expect(n.lastThirdStart.getDate()).toBe(16);
  });
});

describe('suhoorTime', () => {
  it('is exactly N minutes before Fajr', () => {
    const fajr = new Date(2026, 0, 16, 5, 30, 0);
    const trigger = suhoorTime(fajr, 45);
    expect(fajr.getTime() - trigger.getTime()).toBe(45 * 60_000);
    expect(trigger.getHours()).toBe(4);
    expect(trigger.getMinutes()).toBe(45);
  });
});

describe('tahajjudTime', () => {
  const maghrib = new Date(2026, 0, 15, 18, 0, 0);
  const fajr = new Date(2026, 0, 16, 6, 0, 0);
  const night = computeNightTimes(maghrib, fajr);

  it("returns the last-third start in 'lastThird' mode", () => {
    const t = tahajjudTime(night, 'lastThird', '03:00');
    expect(t.getTime()).toBe(night.lastThirdStart.getTime());
  });

  it('anchors an early-hours custom time to the Fajr calendar day', () => {
    const t = tahajjudTime(night, 'custom', '03:15');
    expect(t.getDate()).toBe(16); // small hours belong to the dawn day
    expect(t.getHours()).toBe(3);
    expect(t.getMinutes()).toBe(15);
  });

  it('anchors a late-evening custom time to the Maghrib day', () => {
    const t = tahajjudTime(night, 'custom', '23:00');
    expect(t.getDate()).toBe(15); // late evening belongs to the Maghrib day
    expect(t.getHours()).toBe(23);
  });
});
