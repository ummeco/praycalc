/**
 * Purpose: Pure builders for the two ambient-screensaver text lines fed to the native
 *   DreamService via TvSystemModule.setAmbientLines. Kept free of RN/native imports so the
 *   formatting is unit-testable in isolation.
 *   - line1: next-prayer countdown, e.g. "Maghrib in 43 min — 8:32 PM".
 *   - line2: a rotating cited text (English + source) from rotationContent.ts (no new content).
 * Inputs: a PrayerDay (HH:mm strings), the next PrayerName, "now", and a rotation index.
 * Outputs: two plain strings.
 * Constraints: no fabricated religious content — line2 is drawn only from ROTATION_ITEMS.
 *   Handles the after-Isha wrap (next = fajr) as "tomorrow" so the countdown stays positive.
 * SPORT: praycalc/tv lib/native
 */

import { PrayerDay, PrayerName } from '../../types';
import { itemForIndex } from '../content/rotationContent';

const PRAYER_LABEL: Record<PrayerName, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

/** Formats a 24h "HH:mm" string as a 12h clock, e.g. "20:32" -> "8:32 PM". */
export function formatClock12(hhmm: string): string {
  const [hStr, mStr] = hhmm.split(':');
  const h = Number(hStr);
  const m = Number(mStr);
  if (Number.isNaN(h) || Number.isNaN(m)) return hhmm;
  const period = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
}

/** Minutes from `now` until the given "HH:mm" today; wraps to tomorrow when already past. */
export function minutesUntil(hhmm: string, now: Date): number {
  const [h, m] = hhmm.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return 0;
  const target = new Date(now);
  target.setHours(h, m, 0, 0);
  let diffMs = target.getTime() - now.getTime();
  // After the time has passed (e.g. Fajr shown after Isha), roll to tomorrow.
  if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;
  return Math.round(diffMs / 60000);
}

/** Builds line1: "<Prayer> in <n> min — <h:mm A>" (or blank when data is missing). */
export function buildAmbientLine1(
  day: PrayerDay | null,
  nextPrayer: PrayerName | null,
  now: Date
): string {
  if (!day || !nextPrayer) return '';
  const hhmm = day[nextPrayer];
  if (!hhmm) return '';
  const mins = minutesUntil(hhmm, now);
  const label = PRAYER_LABEL[nextPrayer];
  const clock = formatClock12(hhmm);
  return `${label} in ${mins} min — ${clock}`;
}

/** Builds line2 from the rotation deck: "<English text> — <source>" (cited, never authored). */
export function buildAmbientLine2(rotationIndex: number): string {
  const item = itemForIndex(rotationIndex);
  return `${item.textEn} — ${item.source}`;
}
