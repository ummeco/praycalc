/**
 * Moonsighting Committee Worldwide (MCW) seasonal algorithm.
 *
 * Computes Fajr and Isha as time offsets from sunrise/sunset using the
 * empirical piecewise-linear seasonal functions developed by the Moonsighting
 * Committee Worldwide (Khalid Shaukat). The functions were derived by
 * curve-fitting observations of Subh Sadiq (true dawn) and the end of
 * Shafaq (twilight glow) across multiple latitudes.
 *
 * Reference: moonsighting.com/isha_fajr.html
 *
 * ## MCW Coefficient Key
 *
 * The piecewise-linear anchor values (a, b, c, d) follow the pattern:
 *   value = BASE + (SLOPE / LAT_SCALE) × |latitude|
 *
 * where BASE is the equatorial offset in minutes, SLOPE is the per-degree
 * latitude coefficient, and LAT_SCALE = 55° is the normalisation latitude.
 * Coefficients were curve-fit to multi-latitude observations of Subh Sadiq
 * and Shafaq by the Moonsighting Committee (moonsighting.com/isha_fajr.html).
 *
 * High-latitude handling (|lat| > 55°): falls back to 1/7-night rule.
 */

export type ShafaqMode = 'general' | 'ahmer' | 'abyad';

/**
 * Normalisation latitude (degrees) used as the divisor in MCW latitude
 * scaling coefficients. All MCW slope values are expressed per 55° of
 * latitude so that the piecewise function smoothly scales from equator
 * to mid-high latitudes.
 */
const LAT_SCALE = 55;

function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

/**
 * Compute the MCW seasonal index (dyy): days elapsed since the nearest
 * winter solstice (Northern Hemisphere) or summer solstice (Southern).
 */
function computeDyy(date: Date, latitude: number): { dyy: number; daysInYear: number } {
  const year = date.getFullYear();
  const daysInYear = isLeapYear(year) ? 366 : 365;

  // Reference solstice: Dec 21 for Northern, Jun 21 for Southern
  const refMonth = latitude >= 0 ? 11 : 5; // Dec = 11, Jun = 5
  const refDay = 21;

  const zeroDate = new Date(year, refMonth, refDay);
  let diffDays = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
      Date.UTC(zeroDate.getFullYear(), zeroDate.getMonth(), zeroDate.getDate())) /
      86400000,
  );
  if (diffDays < 0) diffDays += daysInYear;

  return { dyy: diffDays, daysInYear };
}

/**
 * Piecewise-linear seasonal interpolation over 6 segments.
 * a, b, c, d are the reference values at the seasonal anchor points.
 */
function interpolateSegment(
  dyy: number,
  daysInYear: number,
  a: number,
  b: number,
  c: number,
  d: number,
): number {
  if (dyy < 91) {
    return a + ((b - a) / 91) * dyy;
  } else if (dyy < 137) {
    return b + ((c - b) / 46) * (dyy - 91);
  } else if (dyy < 183) {
    return c + ((d - c) / 46) * (dyy - 137);
  } else if (dyy < 229) {
    return d + ((c - d) / 46) * (dyy - 183);
  } else if (dyy < 275) {
    return c + ((b - c) / 46) * (dyy - 229);
  } else {
    const len = daysInYear - 275;
    return b + ((a - b) / len) * (dyy - 275);
  }
}

/**
 * Compute Fajr offset in minutes before sunrise using the MCW algorithm.
 *
 * Returns minutes before sunrise. At latitudes above 55°, the 1/7-night
 * approximation is recommended (handled at the calling site).
 */
export function getMscFajr(date: Date, latitude: number): number {
  const latAbs = Math.abs(latitude);
  const { dyy, daysInYear } = computeDyy(date, latitude);

  // Anchor values: BASE + (SLOPE / LAT_SCALE) × |lat|
  // BASE = 75 min (equatorial Fajr offset). Slopes from MCW curve-fit.
  const a = 75 + (28.65 / LAT_SCALE) * latAbs;
  const b = 75 + (19.44 / LAT_SCALE) * latAbs;
  const c = 75 + (32.74 / LAT_SCALE) * latAbs;
  const d = 75 + (48.1 / LAT_SCALE) * latAbs;

  return Math.round(interpolateSegment(dyy, daysInYear, a, b, c, d));
}

/**
 * Compute Isha offset in minutes after sunset using the MCW algorithm.
 *
 * Three Shafaq modes:
 * - 'general': blend that reduces hardship at high latitudes (default)
 * - 'ahmer': based on disappearance of redness (shafaq ahmer)
 * - 'abyad': based on disappearance of whiteness (shafaq abyad), later
 */
export function getMscIsha(date: Date, latitude: number, shafaq: ShafaqMode = 'general'): number {
  const latAbs = Math.abs(latitude);
  const { dyy, daysInYear } = computeDyy(date, latitude);

  let a: number, b: number, c: number, d: number;

  switch (shafaq) {
    case 'ahmer':
      // Shafaq ahmer (red glow): BASE = 62 min (shorter twilight)
      a = 62 + (17.4 / LAT_SCALE) * latAbs;
      b = 62 - (7.16 / LAT_SCALE) * latAbs;
      c = 62 + (5.12 / LAT_SCALE) * latAbs;
      d = 62 + (19.44 / LAT_SCALE) * latAbs;
      break;
    case 'abyad':
      // Shafaq abyad (white glow): BASE = 75 min (longer twilight)
      a = 75 + (25.6 / LAT_SCALE) * latAbs;
      b = 75 + (7.16 / LAT_SCALE) * latAbs;
      c = 75 + (36.84 / LAT_SCALE) * latAbs;
      d = 75 + (81.84 / LAT_SCALE) * latAbs;
      break;
    default: // 'general'
      // General (blended) mode: BASE = 75 min
      a = 75 + (25.6 / LAT_SCALE) * latAbs;
      b = 75 + (2.05 / LAT_SCALE) * latAbs;
      c = 75 - (9.21 / LAT_SCALE) * latAbs;
      d = 75 + (6.14 / LAT_SCALE) * latAbs;
  }

  return Math.round(interpolateSegment(dyy, daysInYear, a, b, c, d));
}

/**
 * Convert MCW minutes-before-sunrise to an equivalent solar depression angle
 * in degrees, using exact spherical trigonometry.
 *
 * This is the inverse of the standard hour-angle sunrise formula and gives
 * the depression angle that corresponds to a given pre-sunrise interval at
 * the observer's latitude and the given solar declination.
 *
 * Returns NaN if the geometry is unreachable (polar day/night).
 */
export function minutesToDepression(minutes: number, latDeg: number, declDeg: number): number {
  const phi = latDeg * (Math.PI / 180);
  const delta = declDeg * (Math.PI / 180);

  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const cosDelta = Math.cos(delta);
  const sinDelta = Math.sin(delta);

  // Standard sunrise/sunset: h = -0.833° (includes refraction + semi-diameter)
  const h0 = -0.833 * (Math.PI / 180);
  const sinH0 = Math.sin(h0);

  const denominator = cosPhi * cosDelta;
  if (Math.abs(denominator) < 1e-10) return NaN;

  // Hour angle at standard sunrise
  const cosH_rise = (sinH0 - sinPhi * sinDelta) / denominator;

  if (cosH_rise < -1) return NaN; // polar night
  if (cosH_rise > 1) return NaN; // polar day

  const H_rise = Math.acos(cosH_rise); // radians

  // Hour angle at the prayer time (further from solar noon)
  const deltaH = (minutes / 60) * 15 * (Math.PI / 180);
  const H_prayer = H_rise + deltaH;

  // Cap at π (midnight) - sun cannot go further below horizon
  if (H_prayer > Math.PI) {
    // Return the depression at midnight (minimum possible for this date/lat)
    const sinH_midnight = sinPhi * sinDelta + cosPhi * cosDelta * Math.cos(Math.PI);
    const h_midnight = Math.asin(Math.max(-1, Math.min(1, sinH_midnight)));
    return -h_midnight / (Math.PI / 180);
  }

  // Solar altitude at H_prayer
  const sinH_prayer = sinPhi * sinDelta + cosPhi * cosDelta * Math.cos(H_prayer);
  const h_prayer = Math.asin(Math.max(-1, Math.min(1, sinH_prayer)));

  // Depression angle: positive when sun is below horizon
  return -h_prayer / (Math.PI / 180);
}
