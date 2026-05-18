/**
 * SERVER-ONLY — imports pray-calc which depends on nrel-spa (node:module).
 * Never import this file from a client component.
 */
import "server-only";
import { calcTimes, calcTimesAll } from "pray-calc";
import type { FormattedPrayerTimes, FormattedPrayerTimesAll } from "pray-calc";
import type { PrayerResult } from "./prayer-utils";

export type { PrayerResult } from "./prayer-utils";

// Muslim World League (method index 5) uses 18° Fajr / 17° Isha — the
// traditional Hanafi standard in the UK/Indo-Pakistani tradition.
// ⚠️  FLAG FOR ISLAMIC REVIEW: other Hanafi positions exist (e.g. 15°/15°).
// These values match the dominant UK/South-Asian Hanafi practice per T02.
const _HANAFI_METHOD_INDEX = 5; // MWL: Fajr=18°, Isha=17°

/**
 * Returns formatted prayer times.
 *
 * When hanafiAngles=true (requires hanafi=true), overrides the dynamic
 * Fajr/Isha with fixed 18°/17° Hanafi depression angles (MWL standard).
 * All other times (Sunrise, Dhuhr, Asr, Maghrib, Qiyam) use the dynamic
 * method as normal.
 */
export function getPrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  tzOffset: number,
  hanafi = false,
  hanafiAngles = false,
): PrayerResult {
  // When Hanafi angle override is requested, use getTimesAll to retrieve the
  // fixed 18°/17° Fajr/Isha from the MWL method, and use the dynamic method
  // for all other prayer times.
  if (hanafi && hanafiAngles) {
    const allTimes = calcTimesAll(date, lat, lng, tzOffset, 0, undefined, undefined, hanafi) as FormattedPrayerTimesAll;
    // Methods is Record<string, [fajrStr, ishaStr]>; key is method index as string.
    const hanafiEntry = allTimes.Methods[String(_HANAFI_METHOD_INDEX)];
    return {
      Fajr:    (hanafiEntry?.[0]  ?? allTimes.Fajr)    ?? "N/A",
      Sunrise: allTimes.Sunrise ?? "N/A",
      Dhuhr:   allTimes.Dhuhr   ?? "N/A",
      Asr:     allTimes.Asr     ?? "N/A",
      Maghrib: allTimes.Maghrib ?? "N/A",
      Isha:    (hanafiEntry?.[1]  ?? allTimes.Isha)    ?? "N/A",
      Qiyam:   allTimes.Qiyam   ?? "N/A",
    };
  }

  const times = calcTimes(
    date,
    lat,
    lng,
    tzOffset,
    0,
    undefined,
    undefined,
    hanafi,
  ) as FormattedPrayerTimes;
  return {
    Fajr:    times.Fajr    ?? "N/A",
    Sunrise: times.Sunrise ?? "N/A",
    Dhuhr:   times.Dhuhr   ?? "N/A",
    Asr:     times.Asr     ?? "N/A",
    Maghrib: times.Maghrib ?? "N/A",
    Isha:    times.Isha    ?? "N/A",
    Qiyam:   times.Qiyam   ?? "N/A",
  };
}
