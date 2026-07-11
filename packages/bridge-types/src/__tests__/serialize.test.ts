/**
 * Purpose: Verify method/madhab mapping tables, HH:mm formatting, and the two
 *   platform serializers against known-good inputs matching the documented
 *   native contracts.
 * SPORT: praycalc packages/bridge-types serialize tests
 */

import { describe, it, expect } from 'vitest';
import {
  mapMethodToIos,
  mapMadhabToIos,
  formatHHmm,
  toIosWatchContext,
  toWearPrayerTimes,
} from '../serialize.js';
import type { WatchSyncPayload } from '../types.js';

describe('mapMethodToIos', () => {
  it('maps known CalcMethodKey values to the watch enum', () => {
    expect(mapMethodToIos('MWL')).toBe('mwl');
    expect(mapMethodToIos('ISNA')).toBe('isna');
    expect(mapMethodToIos('Egypt')).toBe('egypt');
    expect(mapMethodToIos('Makkah')).toBe('makkah');
    expect(mapMethodToIos('Karachi')).toBe('karachi');
  });

  it('lowercases unknown keys as a safe pass-through (watch falls back to ISNA)', () => {
    expect(mapMethodToIos('DPC')).toBe('dpc');
    expect(mapMethodToIos('UOIF')).toBe('uoif');
    expect(mapMethodToIos('Custom')).toBe('custom');
  });
});

describe('mapMadhabToIos', () => {
  it('maps known Madhab values', () => {
    expect(mapMadhabToIos('Shafi')).toBe('shafi');
    expect(mapMadhabToIos('Hanafi')).toBe('hanafi');
  });

  it('lowercases unknown values as a safe pass-through', () => {
    expect(mapMadhabToIos('Whatever')).toBe('whatever');
  });
});

describe('formatHHmm', () => {
  it('zero-pads single-digit hours and minutes', () => {
    expect(formatHHmm(new Date(2026, 0, 1, 5, 7))).toBe('05:07');
  });

  it('formats a normal time unchanged', () => {
    expect(formatHHmm(new Date(2026, 0, 1, 18, 45))).toBe('18:45');
  });

  it('formats midnight as 00:00', () => {
    expect(formatHHmm(new Date(2026, 0, 1, 0, 0))).toBe('00:00');
  });
});

function makePayload(overrides: Partial<WatchSyncPayload> = {}): WatchSyncPayload {
  return {
    latitude: 40.7128,
    longitude: -74.006,
    city: 'New York',
    method: 'MWL',
    madhab: 'Shafi',
    prayerTimes: {
      fajr: new Date(2026, 0, 1, 5, 30),
      dhuhr: new Date(2026, 0, 1, 12, 15),
      asr: new Date(2026, 0, 1, 15, 45),
      maghrib: new Date(2026, 0, 1, 17, 5),
      isha: new Date(2026, 0, 1, 18, 30),
    },
    generatedAt: new Date(2026, 0, 1, 4, 0),
    ...overrides,
  };
}

describe('toIosWatchContext', () => {
  it('projects the exact WatchSessionManager.swift dictionary shape', () => {
    const payload = makePayload();
    const context = toIosWatchContext(payload);
    expect(context).toEqual({
      latitude: 40.7128,
      longitude: -74.006,
      city: 'New York',
      method: 'mwl',
      madhab: 'shafi',
      ts: Math.floor(payload.generatedAt.getTime() / 1000),
    });
  });

  it('ignores prayerTimes entirely (iOS computes its own on-watch)', () => {
    const context = toIosWatchContext(makePayload());
    expect(context).not.toHaveProperty('prayerTimes');
    expect(context).not.toHaveProperty('fajr');
  });
});

describe('toWearPrayerTimes', () => {
  it('projects the exact PrayerDataListenerService.kt DataMap keys', () => {
    const wear = toWearPrayerTimes(makePayload());
    expect(wear).toEqual({
      location: 'New York',
      fajr: '05:30',
      dhuhr: '12:15',
      asr: '15:45',
      maghrib: '17:05',
      isha: '18:30',
    });
  });

  it('ignores method/madhab entirely (wearOS owns those locally)', () => {
    const wear = toWearPrayerTimes(makePayload());
    expect(wear).not.toHaveProperty('method');
    expect(wear).not.toHaveProperty('madhab');
  });
});
