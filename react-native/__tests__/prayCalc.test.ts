/**
 * Purpose: Unit tests for prayCalc lib — fractional-hour conversion, nextPrayer logic.
 * Inputs: computePrayerTimes(), fractionalHoursToMs() from src/lib/prayCalc
 * Outputs: Jest assertions
 * Constraints: Mocks pray-calc getTimes to avoid real GPS/network dependency.
 * SPORT: __tests__/prayCalc.test.ts
 */

// Mock pray-calc so tests run without native module dependency
jest.mock('pray-calc', () => ({
  getTimes: jest.fn(),
  METHODS: {},
}));

import { getTimes } from 'pray-calc';
import { computePrayerTimes } from '../src/lib/prayCalc';

const mockGetTimes = getTimes as jest.Mock;

describe('computePrayerTimes', () => {
  const lat = 40.7128;
  const lng = -74.006;
  const utcOffset = -5;
  const date = new Date('2024-03-15T00:00:00Z');
  const defaultSettings = { calcMethod: 'isna' as const, asrMethod: 'shafii' as const, use24h: false };

  beforeEach(() => {
    jest.clearAllMocks();
    // Stub: Fajr=5.5 (5:30), Sunrise=6.75 (6:45), Dhuhr=12.0, Asr=15.25 (15:15), Maghrib=18.5, Isha=20.0, Isha+90=21.5 (Qiyam)
    mockGetTimes.mockReturnValue({
      Fajr: 5.5,
      Sunrise: 6.75,
      Dhuhr: 12.0,
      Asr: 15.25,
      Maghrib: 18.5,
      Isha: 20.0,
    });
  });

  it('returns 7 prayers', () => {
    const result = computePrayerTimes(lat, lng, utcOffset, date, defaultSettings);
    expect(result.prayers).toHaveLength(7);
  });

  it('prayer names match expected order', () => {
    const result = computePrayerTimes(lat, lng, utcOffset, date, defaultSettings);
    const names = result.prayers.map((p) => p.name);
    expect(names).toEqual(['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Qiyam']);
  });

  it('Fajr epoch-ms is correct for 5:30 UTC-5', () => {
    const result = computePrayerTimes(lat, lng, utcOffset, date, defaultSettings);
    const fajr = result.prayers.find((p) => p.name === 'Fajr')!;
    // 2024-03-15 local midnight = 2024-03-15T05:00:00Z, add 5.5h = 10.5h UTC = 2024-03-15T10:30:00Z
    const expected = new Date('2024-03-15T10:30:00Z').getTime();
    expect(fajr.epochMs).toBe(expected);
  });

  it('Qiyam is computed as Isha + 90 minutes', () => {
    const result = computePrayerTimes(lat, lng, utcOffset, date, defaultSettings);
    const isha = result.prayers.find((p) => p.name === 'Isha')!;
    const qiyam = result.prayers.find((p) => p.name === 'Qiyam')!;
    expect(qiyam.epochMs).toBe(isha.epochMs + 90 * 60 * 1000);
  });

  it('nextPrayer is the first prayer after now', () => {
    // Fake now = 13:00 local time = 18:00 UTC
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-03-15T18:00:00Z').getTime());
    const result = computePrayerTimes(lat, lng, utcOffset, date, defaultSettings);
    // Asr is at 15:15 local = 20:15 UTC → nextPrayer should be Asr
    expect(result.nextPrayer?.name).toBe('Asr');
    jest.spyOn(Date, 'now').mockRestore();
  });

  it('nextPrayer is null when all prayers have passed', () => {
    // Fake now = 23:30 local = next day UTC
    jest.spyOn(Date, 'now').mockReturnValue(new Date('2024-03-16T04:30:00Z').getTime());
    const result = computePrayerTimes(lat, lng, utcOffset, date, defaultSettings);
    expect(result.nextPrayer).toBeNull();
    jest.spyOn(Date, 'now').mockRestore();
  });

  it('passes correct options for hanafi asr method', () => {
    computePrayerTimes(lat, lng, utcOffset, date, { ...defaultSettings, asrMethod: 'hanafi' });
    const callArgs = mockGetTimes.mock.calls[0];
    expect(callArgs[3]).toMatchObject({ asrMethod: 'hanafi' });
  });
});
