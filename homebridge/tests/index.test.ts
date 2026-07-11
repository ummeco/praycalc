import { describe, it, expect } from 'vitest';
import { isPrayerWindowActive, validateConfig } from '../src/helpers';

// Fixed base date for deterministic tests — 2024-01-15
function at(h: number, m: number, s = 0, ms = 0): Date {
  return new Date(2024, 0, 15, h, m, s, ms);
}

// Add milliseconds to a Date without mutating it
function addMs(d: Date, ms: number): Date {
  return new Date(d.getTime() + ms);
}

const WINDOW = 30; // default windowMinutes

describe('isPrayerWindowActive', () => {
  describe('boundary conditions', () => {
    it('returns true exactly at prayer start (diffMs = 0)', () => {
      expect(isPrayerWindowActive('05:30', at(5, 30), WINDOW)).toBe(true);
    });

    it('returns true exactly at window end (diffMs = windowMs)', () => {
      // 05:30 + 30 min = 06:00 — still within window (inclusive)
      expect(isPrayerWindowActive('05:30', at(6, 0), WINDOW)).toBe(true);
    });

    it('returns false 1 ms before prayer start', () => {
      expect(isPrayerWindowActive('05:30', at(5, 29, 59, 999), WINDOW)).toBe(false);
    });

    it('returns false 1 ms after window end', () => {
      // 06:00:00.001 is 1ms past the inclusive end
      expect(isPrayerWindowActive('05:30', at(6, 0, 0, 1), WINDOW)).toBe(false);
    });
  });

  describe('open within window for each prayer (5 min after start)', () => {
    const prayers: Array<{ name: string; time: string }> = [
      { name: 'fajr',    time: '05:30' },
      { name: 'dhuhr',   time: '12:10' },
      { name: 'asr',     time: '15:20' },
      { name: 'maghrib', time: '17:45' },
      { name: 'isha',    time: '19:15' },
    ];

    for (const { name, time } of prayers) {
      it(`${name} (${time}): OPEN 5 min after start`, () => {
        const [h, m] = time.split(':').map(Number);
        const now = addMs(at(h, m), 5 * 60 * 1000);
        expect(isPrayerWindowActive(time, now, WINDOW)).toBe(true);
      });
    }
  });

  describe('before Fajr and after Isha+window', () => {
    it('returns false before Fajr window opens (04:00, fajr=05:30)', () => {
      expect(isPrayerWindowActive('05:30', at(4, 0), WINDOW)).toBe(false);
    });

    it('returns false after Isha window closes (isha=19:15, window end=19:45)', () => {
      // 19:45:00.001 — 1 ms past inclusive end
      expect(isPrayerWindowActive('19:15', at(19, 45, 0, 1), WINDOW)).toBe(false);
    });
  });

  describe('custom windowMinutes', () => {
    it('returns false when now is beyond a shorter custom window', () => {
      // 15 min after 05:30, custom window = 10 min → outside
      const now = addMs(at(5, 30), 15 * 60 * 1000);
      expect(isPrayerWindowActive('05:30', now, 10)).toBe(false);
    });

    it('returns true when now is within a longer custom window', () => {
      // 45 min after 05:30, custom window = 60 min → inside
      const now = addMs(at(5, 30), 45 * 60 * 1000);
      expect(isPrayerWindowActive('05:30', now, 60)).toBe(true);
    });
  });
});

describe('validateConfig', () => {
  const ERR = 'homebridge-praycalc: latitude and longitude are required in config.json';

  it('throws when latitude is missing', () => {
    expect(() => validateConfig({ longitude: -81.69 })).toThrow(ERR);
  });

  it('throws when longitude is missing', () => {
    expect(() => validateConfig({ latitude: 41.49 })).toThrow(ERR);
  });

  it('throws when both are missing', () => {
    expect(() => validateConfig({})).toThrow(ERR);
  });

  it('does not throw when both latitude and longitude are provided', () => {
    expect(() => validateConfig({ latitude: 41.49, longitude: -81.69 })).not.toThrow();
  });
});
