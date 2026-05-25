/**
 * Purpose: Thin wrapper around the pray-calc npm package for RN usage.
 * Inputs: lat, lng, utcOffsetHours, date, settings
 * Outputs: DailyPrayerTimes with Prayer array and next-prayer metadata
 * Constraints: pray-calc returns fractional hours (e.g. 5.75 = 5:45).
 *   We convert to epoch-ms for countdown math.
 * SPORT: lib/prayCalc.ts
 */

import { getTimes } from 'pray-calc';
import type { DailyPrayerTimes, Prayer, PrayerName, CalcSettings } from '../types';

// ── Constants ──────────────────────────────────────────────────────────────

const PRAYER_NAMES: PrayerName[] = [
  'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Qiyam',
];

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Convert fractional hours (e.g. 5.75) to epoch-ms for a given calendar date.
 * Uses wall-clock date so the time represents local midnight + fractional hours.
 */
function fractionalHoursToMs(date: Date, fh: number): number {
  const hours = Math.floor(fh);
  const minutes = Math.round((fh - hours) * 60);
  const d = new Date(date);
  d.setHours(hours, minutes, 0, 0);
  return d.getTime();
}

/** Format ms timestamp as HH:MM or h:MM AM/PM. */
function formatTime(ms: number, use24h: boolean): string {
  const d = new Date(ms);
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  if (use24h) return `${h.toString().padStart(2, '0')}:${m}`;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = ((h % 12) || 12).toString();
  return `${h12}:${m} ${period}`;
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Calculate daily prayer times for a given location and date.
 *
 * @param lat            - Latitude in decimal degrees
 * @param lng            - Longitude in decimal degrees
 * @param utcOffsetHours - UTC offset in hours (e.g. -5 for EST)
 * @param date           - Calendar date (defaults to today)
 * @param settings       - User preferences (method, asrMethod, use24h)
 * @returns DailyPrayerTimes with next-prayer metadata
 */
export function computePrayerTimes(
  lat: number,
  lng: number,
  utcOffsetHours: number,
  date: Date = new Date(),
  settings: Pick<CalcSettings, 'asrMethod' | 'use24h'> = { asrMethod: 'shafii', use24h: false },
): DailyPrayerTimes {
  // pray-calc expects a UTC noon date for the given calendar day.
  const calcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12));

  const raw = getTimes(calcDate, lat, lng, utcOffsetHours, {
    asr: settings.asrMethod === 'hanafi' ? 'hanafi' : 'shafii',
  });

  const fractionals: Record<PrayerName, number> = {
    Fajr: raw.fajr,
    Sunrise: raw.sunrise,
    Dhuhr: raw.dhuhr,
    Asr: raw.asr,
    Maghrib: raw.maghrib,
    Isha: raw.isha,
    Qiyam: raw.qiyam,
  };

  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const prayers: Prayer[] = PRAYER_NAMES.map((name) => {
    const ms = fractionalHoursToMs(today, fractionals[name]);
    return {
      name,
      timeMs: ms,
      label: formatTime(ms, settings.use24h),
    };
  });

  const nowMs = Date.now();
  const nextPrayer = prayers.find((p) => p.timeMs > nowMs) ?? null;
  const minutesUntilNext = nextPrayer
    ? Math.round((nextPrayer.timeMs - nowMs) / 60_000)
    : 0;

  return { date, prayers, nextPrayer, minutesUntilNext };
}
