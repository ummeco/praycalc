/**
 * Purpose: Verify the pure ambient-line builders — 12h clock formatting, minutes-until with
 *   tomorrow wrap, line1 countdown string, and line2 cited-text sourcing from the rotation deck.
 * SPORT: praycalc/tv lib/native tests
 */

import {
  formatClock12,
  minutesUntil,
  buildAmbientLine1,
  buildAmbientLine2,
} from '../ambientLines';
import { itemForIndex } from '../../content/rotationContent';
import type { PrayerDay } from '../../../types';

const DAY: PrayerDay = {
  fajr: '05:12',
  sunrise: '06:40',
  dhuhr: '12:30',
  asr: '15:45',
  maghrib: '20:32',
  isha: '21:55',
  date: '2026-07-07',
};

describe('formatClock12', () => {
  it('formats 24h into 12h with period', () => {
    expect(formatClock12('20:32')).toBe('8:32 PM');
    expect(formatClock12('00:05')).toBe('12:05 AM');
    expect(formatClock12('12:00')).toBe('12:00 PM');
    expect(formatClock12('05:12')).toBe('5:12 AM');
  });
  it('returns the input unchanged when malformed', () => {
    expect(formatClock12('bad')).toBe('bad');
  });
});

describe('minutesUntil', () => {
  it('computes forward minutes today', () => {
    const now = new Date('2026-07-07T19:49:00');
    expect(minutesUntil('20:32', now)).toBe(43);
  });
  it('wraps to tomorrow when the time has already passed', () => {
    const now = new Date('2026-07-07T22:00:00'); // after isha
    // Fajr 05:12 next day: from 22:00 -> 05:12 = 7h12m = 432 min.
    expect(minutesUntil('05:12', now)).toBe(432);
  });
});

describe('buildAmbientLine1', () => {
  it('builds the next-prayer countdown string', () => {
    const now = new Date('2026-07-07T19:49:00');
    expect(buildAmbientLine1(DAY, 'maghrib', now)).toBe('Maghrib in 43 min — 8:32 PM');
  });
  it('returns empty when day or next is missing', () => {
    const now = new Date('2026-07-07T19:49:00');
    expect(buildAmbientLine1(null, 'maghrib', now)).toBe('');
    expect(buildAmbientLine1(DAY, null, now)).toBe('');
  });
});

describe('buildAmbientLine2', () => {
  it('sources cited text (English + source) from the rotation deck', () => {
    const item = itemForIndex(0);
    expect(buildAmbientLine2(0)).toBe(`${item.textEn} — ${item.source}`);
  });
  it('wraps with the rotation index', () => {
    const item = itemForIndex(1);
    expect(buildAmbientLine2(1)).toBe(`${item.textEn} — ${item.source}`);
  });
});
