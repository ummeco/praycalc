/**
 * SERVER-ONLY — imports pray-calc which depends on nrel-spa (node:module).
 * Never import this file from a client component.
 */
import "server-only";
import { calcTimes } from "pray-calc";
import type { FormattedPrayerTimes } from "pray-calc";
import type { PrayerResult } from "./prayer-utils";

export type { PrayerResult } from "./prayer-utils";

export function getPrayerTimes(
  date: Date,
  lat: number,
  lng: number,
  tzOffset: number,
  hanafi = false,
): PrayerResult {
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
