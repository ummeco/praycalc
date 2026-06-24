/**
 * FILE: packages/brand/src/seasonal.ts
 * PURPOSE: Pure functions mapping a Hijri date to the active Ummat theme.
 * INVARIANTS:
 *   - Theme activation windows are LOCKED per sprint spec:
 *       Muharram     1-10        → muharram
 *       Ramadan      1-29        → ramadan
 *       Shawwal      1-3         → eid (Eid ul-Fitr)
 *       Dhul Hijjah  1-13        → dhul-hijjah (covers Hajj + Eid ul-Adha)
 *       any other date           → default
 *   - Boundary days are INCLUSIVE on both ends.
 *   - Function is pure: same input → same output. No I/O.
 * DO NOT: read clock state here; the caller passes the Hijri date. Side-effects belong in
 *   ummat/backend/src/jobs/theme-scheduler.ts.
 * REF: T-P7-C-S10-T07
 */

import type { ThemeName } from './themes/types'

/** Hijri month index (1-12). 1 = Muharram, 9 = Ramadan, 10 = Shawwal, 12 = Dhul Hijjah. */
export type HijriMonth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12

export interface HijriDate {
  /** Hijri year (e.g. 1447). */
  readonly year: number
  /** Hijri month 1-12. */
  readonly month: HijriMonth
  /** Hijri day 1-30. */
  readonly day: number
}

/**
 * Resolve the active theme for a given Hijri date.
 *
 * @param date - Hijri date (year/month/day). Caller is responsible for sourcing this from
 *   a trusted Hijri library; this function does no calendar conversion.
 * @returns ThemeName for the activation window the date falls in; 'default' otherwise.
 */
export function getActiveTheme(date: HijriDate): ThemeName {
  const { month, day } = date

  // Muharram 1-10 → muharram
  if (month === 1 && day >= 1 && day <= 10) return 'muharram'
  // Ramadan 1-29 → ramadan
  if (month === 9 && day >= 1 && day <= 29) return 'ramadan'
  // Shawwal 1-3 → eid (Eid ul-Fitr)
  if (month === 10 && day >= 1 && day <= 3) return 'eid'
  // Dhul Hijjah 1-13 → dhul-hijjah (covers Hajj + Eid ul-Adha)
  if (month === 12 && day >= 1 && day <= 13) return 'dhul-hijjah'

  return 'default'
}
