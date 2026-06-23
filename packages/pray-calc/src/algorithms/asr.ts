/**
 * Asr prayer time calculation.
 *
 * Purpose: Compute Asr time as fractional hours using shadow-length convention.
 * Inputs: Solar noon (fractional hours), latitude (deg), solar declination (deg), Hanafi flag.
 * Outputs: Asr time as fractional hours, or NaN if sun never reaches required altitude.
 * Constraints: Zero runtime dependencies. Pure function.
 *
 * Asr begins when shadow = (shadowFactor × object length) + shadow at noon.
 *  - Shafi'i/Maliki/Hanbali: shadowFactor = 1
 *  - Hanafi: shadowFactor = 2
 */

/**
 * Compute Asr time as fractional hours.
 *
 * @param solarNoon - Solar noon in fractional hours.
 * @param latitude - Observer latitude in degrees.
 * @param declination - Solar declination in degrees.
 * @param hanafi - true for Hanafi (shadow factor 2), false for Shafi'i (factor 1).
 */
export function getAsr(
  solarNoon: number,
  latitude: number,
  declination: number,
  hanafi = false,
): number {
  const DEG = Math.PI / 180;
  const phi = latitude * DEG;
  const delta = declination * DEG;
  const shadowFactor = hanafi ? 2 : 1;

  // Required solar altitude: tan(A) = 1 / (shadowFactor + tan(|φ − δ|))
  const x = Math.abs(phi - delta);
  const tanA = 1 / (shadowFactor + Math.tan(x));
  const sinA = tanA / Math.sqrt(1 + tanA * tanA); // sin(atan(tanA))

  // cos(H0) = (sin(A) − sin(φ)sin(δ)) / (cos(φ)cos(δ))
  const cosH0 = (sinA - Math.sin(phi) * Math.sin(delta)) / (Math.cos(phi) * Math.cos(delta));

  if (cosH0 < -1 || cosH0 > 1) return NaN;

  // H0 in hours (15°/hr)
  const h0h = Math.acos(cosH0) / DEG / 15;

  return solarNoon + h0h;
}
