/**
 * Asr prayer time calculation.
 *
 * Asr begins when the shadow of an object equals (Shafi'i/Maliki/Hanbali)
 * or twice (Hanafi) the object's length plus its shadow at solar noon.
 * This is a pure spherical trigonometry problem once solar declination
 * and solar noon are known.
 */

import { DEG } from './constants.js';

/**
 * Compute Asr time as fractional hours.
 *
 * @param solarNoon   - Solar noon in fractional hours (from getSpa)
 * @param latitude    - Observer latitude in degrees
 * @param declination - Solar declination in degrees (from solarEphemeris)
 * @param hanafi      - true for Hanafi (shadow factor 2), false for Shafi'i (factor 1)
 * @returns Fractional hours, or NaN if the sun never reaches the required altitude
 */
export function getAsr(
  solarNoon: number,
  latitude: number,
  declination: number,
  hanafi = false,
): number {
  const phi = latitude * DEG;
  const delta = declination * DEG;
  const shadowFactor = hanafi ? 2 : 1;

  // Required solar altitude:
  // tan(A) = 1 / (shadowFactor + tan(|φ − δ|))
  const X = Math.abs(phi - delta);
  const tanA = 1 / (shadowFactor + Math.tan(X));
  const sinA = tanA / Math.sqrt(1 + tanA * tanA); // sin(atan(tanA))

  // Solve the hour-angle equation:
  // cos(H0) = (sin(A) − sin(φ)sin(δ)) / (cos(φ)cos(δ))
  const cosH0 = (sinA - Math.sin(phi) * Math.sin(delta)) / (Math.cos(phi) * Math.cos(delta));

  if (cosH0 < -1 || cosH0 > 1) return NaN; // sun never reaches A

  // H0 in hours (15°/hr)
  const H0h = Math.acos(cosH0) / DEG / 15;

  return solarNoon + H0h;
}
