/**
 * Qiyam al-Layl (night prayer) time calculation.
 *
 * Purpose: Compute the start of the last third of the night (Tahajjud time).
 * Inputs: Fajr time (fractional hours), Isha time (fractional hours).
 * Outputs: Start of last third of night (fractional hours).
 * Constraints: Zero runtime dependencies. Pure function.
 *
 * The night is defined as the period from Isha to Fajr (next day).
 */

/**
 * Compute the start of the last third of the night.
 *
 * @param fajrTime - Fajr time in fractional hours.
 * @param ishaTime - Isha time in fractional hours.
 * @returns Start of the last third of the night (fractional hours).
 */
export function getQiyam(fajrTime: number, ishaTime: number): number {
  // If Fajr is numerically earlier (e.g. 5.5) than Isha (e.g. 21.5),
  // Fajr is the NEXT day — add 24 to get the correct night length.
  const adjustedFajr = fajrTime < ishaTime ? fajrTime + 24 : fajrTime;

  const nightLength = adjustedFajr - ishaTime;
  const lastThirdStart = ishaTime + (2 * nightLength) / 3;

  return lastThirdStart >= 24 ? lastThirdStart - 24 : lastThirdStart;
}
