// FILE: src/components/islands/PrayerTimePreview.tsx
// PURPOSE: Astro island — prayer time preview widget for the homepage.
//   Displays today's prayer times for a selected location using the
//   @acamarata/pray-calc package. Shows Hijri date via @umalqura/core (Umm al-Qura algorithm).
// INPUTS: coordinates (lat/lng/label) or defaults to Mecca
// OUTPUTS: Table of today's 6 prayer times + Hijri date header
// CONSTRAINTS:
//   - client:visible — lazy-hydrates when scrolled into view
//   - Hijri date uses @umalqura/core (same Umm al-Qura algorithm as @ummat/shared/hijri)
//     NEVER use Intl.DateTimeFormat with the hijri calendar option (T-01 AC)
//   - Times displayed in user's local timezone
//   - Prayer times from @acamarata/pray-calc getTimes() which returns decimal hours (0–24),
//     not Date objects — convert with decimalHoursToDate()
//   - AsrConvention.shafii is the default (no Method enum; no MWL fixed angles — PrayCalc Dynamic)
// REF: T-01 (P2-E3-W01-S01) · D-P2-REACT19

'use client';

import { useState, useEffect } from 'react';
import type { Coordinates } from './LocationPicker';

// Type-only imports for @acamarata/pray-calc (lazy-loaded to avoid SSR issues)
// PrayerTimes values are decimal hours (e.g. 5.25 = 05:15)
interface PrayerTimesDecimal {
  fajr: number;
  sunrise: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

const PRAYER_LABELS: Record<keyof PrayerTimesDecimal, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

const DEFAULT_LOCATION: Coordinates = {
  lat: 21.3891,
  lng: 39.8579,
  label: 'Mecca, Saudi Arabia',
};

interface Props {
  coordinates?: Coordinates;
}

/**
 * Convert decimal hours (e.g. 5.25) to a Date object on the given day.
 * Decimal hours are in UTC+tz; we create a UTC Date by subtracting tz offset.
 */
function decimalHoursToDate(decimalHours: number, date: Date, tzOffsetHours: number): Date {
  const utcHours = decimalHours - tzOffsetHours;
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  d.setTime(d.getTime() + utcHours * 3600 * 1000);
  return d;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Get the UTC offset in hours for the user's local timezone. */
function getLocalTzOffset(): number {
  return -new Date().getTimezoneOffset() / 60;
}

export default function PrayerTimePreview({ coordinates }: Props) {
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimesDecimal | null>(null);
  const [hijriDate, setHijriDate] = useState<{ day: number; monthName: string; year: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loc = coordinates ?? DEFAULT_LOCATION;

  useEffect(() => {
    let cancelled = false;

    async function compute() {
      setLoading(true);
      setError(null);
      try {
        // Dynamic import — @acamarata/pray-calc is a pure computation package
        // @umalqura/core: Umm al-Qura Hijri calendar (same algorithm as @ummat/shared/hijri)
        const [{ getTimes, AsrConvention }, { default: umalqura }] = await Promise.all([
          import('@acamarata/pray-calc'),
          import('@umalqura/core'),
        ]);

        const today = new Date();
        const tz = getLocalTzOffset();

        const times = getTimes({
          date: today,
          lat: loc.lat,
          lng: loc.lng,
          tz,
          asrConvention: AsrConvention.shafii,
        });

        // Extract only the 6 display prayers (PrayerTimes also has qiyam, noon)
        const display: PrayerTimesDecimal = {
          fajr: times.fajr,
          sunrise: times.sunrise,
          dhuhr: times.dhuhr,
          asr: times.asr,
          maghrib: times.maghrib,
          isha: times.isha,
        };

        // Hijri date via @umalqura/core (Umm al-Qura algorithm) — not Intl (T-01 AC)
        const hDate = umalqura(today);
        const hijriMonthNames = [
          'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
          'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
          'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
        ];

        if (!cancelled) {
          setPrayerTimes(display);
          setHijriDate({
            day: hDate.hd,
            monthName: hijriMonthNames[hDate.hm - 1] ?? String(hDate.hm),
            year: hDate.hy,
          });
        }
      } catch (err) {
        if (!cancelled) {
          setError('Unable to compute prayer times. Please try again.');
          console.error('[PrayerTimePreview]', err);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    compute();
    return () => { cancelled = true; };
  }, [loc.lat, loc.lng]);

  if (loading) {
    return (
      <div
        className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
        aria-label="Loading prayer times"
        aria-busy="true"
      >
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-3 w-20 rounded bg-zinc-100 dark:bg-zinc-800" />
              <div className="h-3 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950"
        role="alert"
      >
        <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
      </div>
    );
  }

  if (!prayerTimes || !hijriDate) return null;

  const today = new Date();
  const tz = getLocalTzOffset();

  return (
    <div
      className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
      aria-label={`Prayer times for ${loc.label}`}
    >
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">{loc.label}</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            {hijriDate.day} {hijriDate.monthName} {hijriDate.year} AH
          </p>
        </div>
        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800 dark:bg-green-950 dark:text-green-300">
          Today
        </span>
      </div>

      {/* Prayer times table */}
      <table className="w-full text-sm" aria-label="Today's prayer times">
        <thead className="sr-only">
          <tr>
            <th scope="col">Prayer</th>
            <th scope="col">Time</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {(Object.keys(PRAYER_LABELS) as Array<keyof PrayerTimesDecimal>).map((key) => (
            <tr key={key}>
              <td className="py-2 font-medium text-zinc-700 dark:text-zinc-300">
                {PRAYER_LABELS[key]}
              </td>
              <td className="py-2 text-right tabular-nums text-zinc-900 dark:text-white">
                {formatTime(decimalHoursToDate(prayerTimes[key], today, tz))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4 text-xs text-zinc-400 dark:text-zinc-500">
        PrayCalc Dynamic Method · Shafi&#x2019;i Asr
      </p>
    </div>
  );
}
