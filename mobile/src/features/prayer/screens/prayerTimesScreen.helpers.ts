/**
 * Purpose: UI-local pure helpers for PrayerTimesScreen (time/countdown formatting,
 *   device timezone offset). Extracted verbatim from PrayerTimesScreen.tsx to keep
 *   that file under the 300-line cap. Not prayer-calculation logic — that lives in
 *   ../../../lib/ (timezone.ts, hijri.ts, etc.) and is untouched by this split.
 * Inputs: Date/seconds/locale primitives.
 * Outputs: formatTime, formatCountdown, getTimezoneOffset — same behavior as before.
 * Constraints: No React, no state — pure functions only.
 */

export function formatTime(date: Date, format: '12h' | '24h', locale: string): string {
  if (format === '24h') {
    return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', hour12: false });
  }
  return date.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', hour12: true });
}

export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

export function getTimezoneOffset(): number {
  return -(new Date().getTimezoneOffset() / 60);
}
