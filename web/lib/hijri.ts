import { toHijri, formatHijriDate } from "luxon-hijri";

export interface HijriDateInfo {
  year: number;
  month: number;
  day: number;
  formatted: string;
  monthName: string;
}

/**
 * Hijri calendar calculation method.
 *
 * - "astronomical": Pure astronomical calculation via the `luxon-hijri` library
 *   (Kuwaiti algorithm, default). Always consistent; may differ from actual
 *   moon sighting by 1–2 days.
 * - "umm-al-qura": Umm al-Qura calendar as used in Saudi Arabia. This
 *   implementation applies the standard +1 day offset from the astronomical
 *   base, which is the accepted approximation; actual UQ tables may differ.
 * - "moonsighting": Adds a region-dependent offset (currently +1 day, reflecting
 *   the typical Moonsighting Committee Worldwide adjustment). A full lat/lng
 *   aware implementation should be wired to the user's location in a future
 *   task. ⚠️  FLAG FOR ISLAMIC REVIEW — this offset is approximate.
 *
 * The setting is persisted by the caller (localStorage key `hijriCalendar` or
 * `pc_user_settings.hijri_calendar` in the backend).
 */
export type HijriCalendar = "astronomical" | "umm-al-qura" | "moonsighting";

/** Day offset applied to the astronomical base for each method. */
const METHOD_OFFSET: Record<HijriCalendar, number> = {
  "astronomical": 0,
  "umm-al-qura":   1, // Standard UQ offset vs astronomical Kuwaiti algorithm
  "moonsighting":  1, // Conservative MCW offset; full lat/lng logic is future work
};

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  "Jumada al-Ula",
  "Jumada al-Akhira",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhul Qi'da",
  "Dhul Hijja",
];

const DAYS_IN_MONTH = [30, 29, 30, 29, 30, 29, 30, 29, 30, 29, 30, 29];

/**
 * Apply a day offset to a Hijri date object, handling month/year rollovers.
 * This is a simple approximation; a production-grade implementation should
 * use an actual UQ table lookup for the umm-al-qura method.
 */
function applyHijriOffset(
  h: { hy: number; hm: number; hd: number },
  offset: number,
): { hy: number; hm: number; hd: number } {
  if (offset === 0) return h;
  let { hy, hm, hd } = h;
  hd += offset;
  while (hd > DAYS_IN_MONTH[hm - 1]) {
    hd -= DAYS_IN_MONTH[hm - 1];
    hm += 1;
    if (hm > 12) { hm = 1; hy += 1; }
  }
  while (hd < 1) {
    hm -= 1;
    if (hm < 1) { hm = 12; hy -= 1; }
    hd += DAYS_IN_MONTH[hm - 1];
  }
  return { hy, hm, hd };
}

/**
 * Returns the Hijri date for `date` using the specified calculation method.
 *
 * @param date - Gregorian date to convert (defaults to today)
 * @param calendar - Calculation method (default: "astronomical")
 */
export function getHijriDate(
  date: Date = new Date(),
  calendar: HijriCalendar = "astronomical",
): HijriDateInfo {
  const base = toHijri(date);
  if (!base) return { day: 0, month: 0, monthName: "", year: 0, formatted: "" };

  const offset = METHOD_OFFSET[calendar] ?? 0;
  const h = applyHijriOffset({ hy: base.hy, hm: base.hm, hd: base.hd }, offset);

  const monthName = HIJRI_MONTHS[h.hm - 1] ?? "";
  let formatted = "";
  try {
    // Pass the adjusted date object to formatHijriDate if offset was applied;
    // otherwise use the original toHijri result for best format compatibility.
    const fmtSource = offset === 0 ? base : { ...base, hy: h.hy, hm: h.hm, hd: h.hd };
    formatted = formatHijriDate(fmtSource, "iD iMMMM iYYYY ioooo");
  } catch {
    formatted = `${h.hd} ${monthName} ${h.hy} AH`;
  }
  return {
    year: h.hy,
    month: h.hm,
    day: h.hd,
    formatted,
    monthName,
  };
}
