/**
 * Purpose: Tap-to-cycle HH:mm time control helpers (no native date-picker
 *   dependency). `cycleClock` advances a 24h "HH:mm" string by 30 minutes,
 *   wrapping past midnight; `formatClock` renders it for display. Matches the
 *   tap-to-cycle UX already used for notification lead-time in NotificationSettings.
 * Inputs: "HH:mm" 24h strings.
 * Outputs: next "HH:mm" (cycleClock); localized-ish display string (formatClock).
 * Constraints: Pure, no DOM/native APIs. Malformed input falls back to "00:00".
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-jumuah-time-cycle
 */

const STEP_MINUTES = 30;
const DAY_MINUTES = 24 * 60;

/** Parse "HH:mm" into total minutes since midnight; 0 if malformed. */
function toMinutes(hhmm: string): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return 0;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return 0;
  return h * 60 + min;
}

/** Format total minutes since midnight back to zero-padded "HH:mm". */
function fromMinutes(total: number): string {
  const wrapped = ((total % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
  const h = Math.floor(wrapped / 60);
  const min = wrapped % 60;
  return `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/** Advance a "HH:mm" clock by 30 minutes, wrapping at midnight. */
export function cycleClock(hhmm: string): string {
  return fromMinutes(toMinutes(hhmm) + STEP_MINUTES);
}

/**
 * Display a "HH:mm" 24h string as a 12h clock with am/pm (e.g. "12:30 pm").
 * Purely presentational — the stored value stays 24h.
 */
export function formatClock(hhmm: string): string {
  const total = toMinutes(hhmm);
  const h24 = Math.floor(total / 60);
  const min = total % 60;
  const period = h24 < 12 ? 'am' : 'pm';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(min).padStart(2, '0')} ${period}`;
}
