/**
 * Qiyam al-Layl (night prayer) time calculation.
 *
 * Returns the start of the last third of the night, which is the recommended
 * time for Tahajjud / Qiyam al-Layl. The night is defined as the period
 * from Isha to Fajr.
 */

/**
 * Compute the start of the last third of the night.
 *
 * @param fajrTime - Fajr time in fractional hours
 * @param ishaTime - Isha time in fractional hours
 * @returns Start of the last third of the night (fractional hours)
 */
export function getQiyam(fajrTime: number, ishaTime: number): number {
  // If Fajr is numerically earlier (e.g. 5.5) than Isha (e.g. 21.5), Fajr
  // is actually the NEXT day — add 24 to get the correct night length.
  const adjustedFajr = fajrTime < ishaTime ? fajrTime + 24 : fajrTime;

  const nightLength = adjustedFajr - ishaTime;
  const lastThirdStart = ishaTime + (2 * nightLength) / 3;

  return lastThirdStart >= 24 ? lastThirdStart - 24 : lastThirdStart;
}
