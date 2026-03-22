/**
 * Islamic midnight calculation.
 *
 * Returns the midpoint of the night, commonly used as the endpoint
 * of the Isha prayer window. The standard definition uses the interval
 * from Maghrib to Fajr; the astronomical variant uses Maghrib to Sunrise.
 */

/**
 * Compute the midpoint of the night.
 *
 * @param maghribTime - Maghrib (sunset) time in fractional hours
 * @param endTime     - Fajr or Sunrise time in fractional hours (next day)
 * @returns Midnight as fractional hours
 */
export function getMidnight(maghribTime: number, endTime: number): number {
  // If endTime is numerically earlier (e.g. 5.5) than Maghrib (e.g. 20.0),
  // the endpoint is on the NEXT day: add 24 to get the correct span.
  const adjusted = endTime < maghribTime ? endTime + 24 : endTime;

  const mid = maghribTime + (adjusted - maghribTime) / 2;

  return mid >= 24 ? mid - 24 : mid;
}
