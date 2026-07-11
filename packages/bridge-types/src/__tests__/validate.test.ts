/**
 * Purpose: Verify isValidIosWatchContext / isValidWearPrayerTimesPayload reject
 *   the exact malformed shapes each native receiver would otherwise choke on
 *   (Null Island coordinates, non-"HH:mm" time strings, empty method/madhab).
 * SPORT: praycalc packages/bridge-types validate tests
 */

import { describe, it, expect } from 'vitest';
import { isValidIosWatchContext, isValidWearPrayerTimesPayload } from '../validate.js';
import type { IosWatchContextPayload, WearPrayerTimesPayload } from '../types.js';

function validIos(overrides: Partial<IosWatchContextPayload> = {}): IosWatchContextPayload {
  return {
    latitude: 40.7128,
    longitude: -74.006,
    city: 'New York',
    method: 'mwl',
    madhab: 'shafi',
    ts: 1_700_000_000,
    ...overrides,
  };
}

describe('isValidIosWatchContext', () => {
  it('accepts a well-formed payload', () => {
    expect(isValidIosWatchContext(validIos())).toBe(true);
  });

  it('rejects Null Island (0, 0) — matches WatchSessionManager.applyContext', () => {
    expect(isValidIosWatchContext(validIos({ latitude: 0, longitude: 0 }))).toBe(false);
  });

  it('accepts (0, longitude) as long as one coordinate is non-zero', () => {
    expect(isValidIosWatchContext(validIos({ latitude: 0, longitude: -74.006 }))).toBe(true);
  });

  it('rejects non-finite coordinates', () => {
    expect(isValidIosWatchContext(validIos({ latitude: NaN }))).toBe(false);
  });

  it('rejects an empty method or madhab', () => {
    // Cast past the literal union: validates runtime behavior against a value shape
    // that could arrive from an untyped native bridge, even though our own TS callers
    // are constrained to the union.
    expect(isValidIosWatchContext(validIos({ method: '' as unknown as IosWatchContextPayload['method'] }))).toBe(false);
    expect(isValidIosWatchContext(validIos({ madhab: '' as unknown as IosWatchContextPayload['madhab'] }))).toBe(false);
  });
});

function validWear(overrides: Partial<WearPrayerTimesPayload> = {}): WearPrayerTimesPayload {
  return {
    location: 'New York',
    fajr: '05:30',
    dhuhr: '12:15',
    asr: '15:45',
    maghrib: '17:05',
    isha: '18:30',
    ...overrides,
  };
}

describe('isValidWearPrayerTimesPayload', () => {
  it('accepts a well-formed payload', () => {
    expect(isValidWearPrayerTimesPayload(validWear())).toBe(true);
  });

  it('rejects a 12h-style time string (LocalTime.parse only accepts 24h HH:mm)', () => {
    expect(isValidWearPrayerTimesPayload(validWear({ fajr: '5:30 AM' }))).toBe(false);
  });

  it('rejects an out-of-range hour or minute', () => {
    expect(isValidWearPrayerTimesPayload(validWear({ dhuhr: '24:00' }))).toBe(false);
    expect(isValidWearPrayerTimesPayload(validWear({ asr: '15:60' }))).toBe(false);
  });

  it('rejects a missing/empty time string', () => {
    expect(isValidWearPrayerTimesPayload(validWear({ maghrib: '' }))).toBe(false);
  });
});
