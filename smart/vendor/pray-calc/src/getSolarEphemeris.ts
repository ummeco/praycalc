/**
 * High-accuracy solar ephemeris features without a full SPA call.
 *
 * Uses Jean Meeus "Astronomical Algorithms" (2nd ed., Ch. 25) low-precision
 * formulas, accurate to approximately ±0.01° for solar declination and
 * ±0.0001 AU for Earth-Sun distance over the years 1950-2050. This is
 * sufficient for computing twilight angles; exact Sun positioning for
 * prayer time solving still uses the full SPA via nrel-spa.
 */

import { DEG } from './constants.js';

/** Julian Date from a JavaScript Date (UTC). */
export function toJulianDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

export interface SolarEphemeris {
  /** Solar declination in degrees. */
  decl: number;
  /** Earth-Sun distance in AU. */
  r: number;
  /** Apparent solar ecliptic longitude in radians (season phase θ, 0–2π). */
  eclLon: number;
}

/**
 * Compute solar declination, Earth-Sun distance, and ecliptic longitude
 * from a Julian Date. Accuracy: ~0.01° for declination, ~0.0001 AU for r.
 */
export function solarEphemeris(jd: number): SolarEphemeris {
  const T = (jd - 2451545.0) / 36525.0;

  // Geometric mean longitude L0 (degrees)
  const L0 = (((280.46646 + 36000.76983 * T + 0.0003032 * T * T) % 360) + 360) % 360;

  // Mean anomaly M (degrees)
  const M = (((357.52911 + 35999.05029 * T - 0.0001537 * T * T) % 360) + 360) % 360;
  const Mrad = M * DEG;

  // Orbital eccentricity
  const e = 0.016708634 - 0.000042037 * T - 0.0000001267 * T * T;

  // Equation of center C (degrees)
  const C =
    (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mrad) +
    (0.019993 - 0.000101 * T) * Math.sin(2 * Mrad) +
    0.000289 * Math.sin(3 * Mrad);

  // Sun's true longitude (degrees)
  const sunLon = L0 + C;

  // Sun's true anomaly (degrees)
  const nu = M + C;
  const nuRad = nu * DEG;

  // Earth-Sun distance in AU
  const r = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(nuRad));

  // Longitude of ascending node of Moon's orbit (for nutation)
  const Omega = (((125.04 - 1934.136 * T) % 360) + 360) % 360;
  const OmegaRad = Omega * DEG;

  // Apparent solar longitude corrected for nutation and aberration
  const lambda = sunLon - 0.00569 - 0.00478 * Math.sin(OmegaRad);
  const lambdaRad = lambda * DEG;

  // Mean obliquity of the ecliptic (degrees)
  const epsilon0 = 23.439291 - 0.013004 * T - 1.638e-7 * T * T + 5.036e-7 * T * T * T;

  // True obliquity with nutation correction
  const epsilon = (epsilon0 + 0.00256 * Math.cos(OmegaRad)) * DEG;

  // Solar declination
  const sinDecl = Math.sin(epsilon) * Math.sin(lambdaRad);
  const decl = Math.asin(Math.max(-1, Math.min(1, sinDecl))) / DEG;

  // Ecliptic longitude as season phase θ ∈ [0, 2π)
  const eclLon = ((lambdaRad % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);

  return { decl, r, eclLon };
}

/**
 * Solar vertical angular speed near a given hour angle H (radians),
 * in degrees per hour. Useful as a confidence weight for angle predictions:
 * higher speed means each degree of angle error is fewer minutes of time error.
 *
 * Formula: dh/dt ≈ 15 × cos(φ) × cos(δ) × sin(H) [°/hr]
 */
export function solarVerticalSpeed(latRad: number, declRad: number, hAngleRad: number): number {
  return 15 * Math.abs(Math.cos(latRad) * Math.cos(declRad) * Math.sin(hAngleRad));
}

/**
 * Compute the atmospheric refraction correction (degrees) for a given
 * apparent solar altitude using the Bennett/Saemundsson formula.
 * Scaled for pressure and temperature.
 *
 * Returns a positive correction (the Sun appears higher than its geometric
 * position). For altitudes below -1°, returns 0 (not meaningful for Fajr/Isha
 * at depression angles like 12–20°, but included for completeness).
 */
export function atmosphericRefraction(
  altitudeDeg: number,
  pressureMbar = 1013.25,
  temperatureC = 15,
): number {
  if (altitudeDeg < -1) return 0;
  // Bennett's formula in arcminutes
  const R0 = 1.02 / Math.tan((altitudeDeg + 10.3 / (altitudeDeg + 5.11)) * DEG);
  // Scale for pressure and temperature
  const R = R0 * (pressureMbar / 1010) * (283 / (273 + temperatureC));
  return Math.max(0, R) / 60; // convert arcminutes to degrees
}
