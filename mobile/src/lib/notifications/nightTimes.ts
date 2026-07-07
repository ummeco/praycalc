/**
 * Purpose: Compute Islamic "night" divisions (last third, middle of the night) and
 *   the derived Suhoor / Tahajjud alarm trigger times, from the prayer engine's
 *   Maghrib (sunset) and the NEXT day's Fajr (true dawn). The Islamic night runs
 *   Maghrib → Fajr, so its length crosses midnight and the next day's Fajr must be
 *   used, never the same day's Fajr.
 * Inputs: Maghrib Date (day D) and Fajr Date (day D+1), plus a target date for
 *   which the alarm is being scheduled. Pure — no notifications, no store, no clock.
 * Outputs: NightTimes { maghrib, fajr, nightLengthMs, middleOfNight, lastThirdStart }
 *   and helpers suhoorTime()/tahajjudTime() returning Date trigger instants.
 * Constraints: Fajr must be strictly after Maghrib (caller passes NEXT-day Fajr).
 *   All arithmetic in ms on absolute instants — DST-safe because the engine already
 *   rendered both endpoints onto the host-local wall clock.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-night-times
 */

export interface NightTimes {
  /** Sunset (start of the Islamic night). */
  maghrib: Date;
  /** True dawn ending the night — the NEXT calendar day's Fajr. */
  fajr: Date;
  /** Maghrib → Fajr span in milliseconds. */
  nightLengthMs: number;
  /** Instant exactly halfway between Maghrib and Fajr. */
  middleOfNight: Date;
  /** Instant the final third of the night begins (Maghrib + ⅔ of the night). */
  lastThirdStart: Date;
}

/**
 * Divide the Maghrib→Fajr night into its middle and last-third boundaries.
 * `fajr` MUST be the dawn that ENDS this night (i.e. the next day's Fajr), so it
 * is always later than `maghrib`; a same-day Fajr would give a negative span.
 */
export function computeNightTimes(maghrib: Date, fajr: Date): NightTimes {
  const start = maghrib.getTime();
  const end = fajr.getTime();
  const nightLengthMs = end - start;
  return {
    maghrib,
    fajr,
    nightLengthMs,
    middleOfNight: new Date(start + nightLengthMs / 2),
    // Last third begins after two-thirds of the night has elapsed.
    lastThirdStart: new Date(start + (nightLengthMs * 2) / 3),
  };
}

/**
 * Suhoor alarm trigger: `minutesBeforeFajr` before the given Fajr instant.
 * (Suhoor — the pre-dawn meal — must end by Fajr; the alarm wakes the user
 * with enough lead time to eat before the fast begins.)
 */
export function suhoorTime(fajr: Date, minutesBeforeFajr: number): Date {
  return new Date(fajr.getTime() - minutesBeforeFajr * 60_000);
}

/**
 * Tahajjud/Qiyam alarm trigger for the night ending at `night.fajr`.
 *   - 'lastThird': the moment the last third of the night begins (the time the
 *     Prophet ﷺ described Allah descending — Sahih al-Bukhari 1145 / Muslim 758).
 *   - 'custom': a fixed wall-clock HH:mm. Interpreted on the calendar day of the
 *     Fajr endpoint if that clock time falls after midnight (i.e. <= Fajr's hour),
 *     otherwise on the Maghrib day — so "03:00" lands in the small hours before
 *     dawn, not the previous evening.
 */
export function tahajjudTime(
  night: NightTimes,
  mode: 'lastThird' | 'custom',
  customTime: string,
): Date {
  if (mode === 'lastThird') return night.lastThirdStart;

  const [hStr, mStr] = customTime.split(':');
  const hours = Number(hStr);
  const minutes = Number(mStr);

  // A custom time in the small hours (<= Fajr hour) belongs to the Fajr calendar
  // day; a late-evening custom time belongs to the Maghrib day.
  const anchor = hours <= night.fajr.getHours() ? night.fajr : night.maghrib;
  const t = new Date(anchor);
  t.setHours(Number.isFinite(hours) ? hours : 3, Number.isFinite(minutes) ? minutes : 0, 0, 0);
  return t;
}
