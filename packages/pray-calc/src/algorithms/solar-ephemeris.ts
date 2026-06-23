/**
 * High-accuracy solar ephemeris — Jean Meeus "Astronomical Algorithms" (2nd ed., Ch. 25).
 *
 * Purpose: Compute solar declination, Earth-Sun distance, and ecliptic longitude.
 * Inputs: Julian Date (number)
 * Outputs: SolarEphemeris { decl, r, eclLon }
 * Constraints: Zero dependencies; accuracy ~0.01° / ~0.0001 AU (1950–2050).
 */

import type { SolarEphemeris } from "../types/index.js";

/**
 * Convert a JS Date (UTC) to Julian Date.
 */
export function toJulianDate(date: Date): number {
  return date.getTime() / 86_400_000 + 2_440_587.5;
}

/**
 * Compute solar declination, Earth-Sun distance, and ecliptic longitude
 * from a Julian Date.
 */
export function solarEphemeris(jd: number): SolarEphemeris {
  const DEG = Math.PI / 180;
  const t = (jd - 2_451_545.0) / 36_525.0;

  // Geometric mean longitude L0 (degrees)
  const l0 = positiveMod(
    280.46646 + 36000.76983 * t + 0.0003032 * t * t,
    360,
  );

  // Mean anomaly M (degrees)
  const mDeg = positiveMod(
    357.52911 + 35999.05029 * t - 0.0001537 * t * t,
    360,
  );
  const mRad = mDeg * DEG;

  // Orbital eccentricity
  const e = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t;

  // Equation of center C (degrees)
  const c =
    (1.914602 - 0.004817 * t - 0.000014 * t * t) * Math.sin(mRad) +
    (0.019993 - 0.000101 * t) * Math.sin(2 * mRad) +
    0.000289 * Math.sin(3 * mRad);

  // Sun's true longitude (degrees)
  const sunLon = l0 + c;

  // Sun's true anomaly (degrees)
  const nu = mDeg + c;
  const nuRad = nu * DEG;

  // Earth-Sun distance in AU
  const r = (1.000001018 * (1 - e * e)) / (1 + e * Math.cos(nuRad));

  // Longitude of ascending node of Moon's orbit (for nutation)
  const omega = positiveMod(125.04 - 1934.136 * t, 360);
  const omegaRad = omega * DEG;

  // Apparent solar longitude corrected for nutation and aberration
  const lambda = sunLon - 0.00569 - 0.00478 * Math.sin(omegaRad);
  const lambdaRad = lambda * DEG;

  // Mean obliquity of the ecliptic (degrees)
  const epsilon0 =
    23.439291 -
    0.013004 * t -
    1.638e-7 * t * t +
    5.036e-7 * t * t * t;

  // True obliquity with nutation correction
  const epsilon = (epsilon0 + 0.00256 * Math.cos(omegaRad)) * DEG;

  // Solar declination
  const sinDecl = Math.sin(epsilon) * Math.sin(lambdaRad);
  const decl = Math.asin(clamp(sinDecl, -1, 1)) / DEG;

  // Ecliptic longitude as season phase θ ∈ [0, 2π)
  const eclLon = positiveMod(lambdaRad, 2 * Math.PI);

  return { decl, r, eclLon };
}

/**
 * Solar vertical angular speed near a given hour angle (degrees/hour).
 */
export function solarVerticalSpeed(
  latRad: number,
  declRad: number,
  hAngleRad: number,
): number {
  return (
    15 *
    Math.abs(
      Math.cos(latRad) * Math.cos(declRad) * Math.sin(hAngleRad),
    )
  );
}

/**
 * Atmospheric refraction correction (degrees) for a given apparent solar altitude.
 * Uses Bennett/Saemundsson formula.
 * Returns a positive correction. Returns 0 for altitudes below −1°.
 */
export function atmosphericRefraction(
  altitudeDeg: number,
  pressureMbar = 1013.25,
  temperatureC = 15,
): number {
  if (altitudeDeg < -1) return 0;
  const DEG = Math.PI / 180;
  // Bennett's formula in arcminutes
  const r0 =
    1.02 /
    Math.tan(
      (altitudeDeg + 10.3 / (altitudeDeg + 5.11)) * DEG,
    );
  // Scale for pressure and temperature
  const r = r0 * (pressureMbar / 1010) * (283 / (273 + temperatureC));
  return r < 0 ? 0 : r / 60; // convert arcminutes to degrees
}

// ─── Utilities ───────────────────────────────────────────────────────────────

export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

function positiveMod(x: number, n: number): number {
  return ((x % n) + n) % n;
}
