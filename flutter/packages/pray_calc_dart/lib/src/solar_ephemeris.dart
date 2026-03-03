/// High-accuracy solar ephemeris using Jean Meeus "Astronomical Algorithms"
/// (2nd ed., Ch. 25) low-precision formulas.
///
/// Accuracy: ~0.01° for solar declination, ~0.0001 AU for Earth-Sun distance
/// over years 1950–2050.
library;

import 'dart:math';

import 'types.dart';

/// Julian Date from a Dart [DateTime] (UTC).
double toJulianDate(DateTime date) {
  return date.millisecondsSinceEpoch / 86400000.0 + 2440587.5;
}

/// Compute solar declination, Earth-Sun distance, and ecliptic longitude
/// from a Julian Date.
SolarEphemeris solarEphemeris(double jd) {
  const deg = pi / 180;
  final t = (jd - 2451545.0) / 36525.0;

  // Geometric mean longitude L0 (degrees)
  final l0 = ((280.46646 + 36000.76983 * t + 0.0003032 * t * t) % 360 + 360) % 360;

  // Mean anomaly M (degrees)
  final m = ((357.52911 + 35999.05029 * t - 0.0001537 * t * t) % 360 + 360) % 360;
  final mRad = m * deg;

  // Orbital eccentricity
  final e = 0.016708634 - 0.000042037 * t - 0.0000001267 * t * t;

  // Equation of center C (degrees)
  final c = (1.914602 - 0.004817 * t - 0.000014 * t * t) * sin(mRad) +
      (0.019993 - 0.000101 * t) * sin(2 * mRad) +
      0.000289 * sin(3 * mRad);

  // Sun's true longitude (degrees)
  final sunLon = l0 + c;

  // Sun's true anomaly (degrees)
  final nu = m + c;
  final nuRad = nu * deg;

  // Earth-Sun distance in AU
  final r = (1.000001018 * (1 - e * e)) / (1 + e * cos(nuRad));

  // Longitude of ascending node of Moon's orbit (for nutation)
  final omega = ((125.04 - 1934.136 * t) % 360 + 360) % 360;
  final omegaRad = omega * deg;

  // Apparent solar longitude corrected for nutation and aberration
  final lambda = sunLon - 0.00569 - 0.00478 * sin(omegaRad);
  final lambdaRad = lambda * deg;

  // Mean obliquity of the ecliptic (degrees)
  final epsilon0 = 23.439291 -
      0.013004 * t -
      1.638e-7 * t * t +
      5.036e-7 * t * t * t;

  // True obliquity with nutation correction
  final epsilon = (epsilon0 + 0.00256 * cos(omegaRad)) * deg;

  // Solar declination
  final sinDecl = sin(epsilon) * sin(lambdaRad);
  final decl = asin(sinDecl.clamp(-1.0, 1.0)) / deg;

  // Ecliptic longitude as season phase θ ∈ [0, 2π)
  final eclLon = ((lambdaRad % (2 * pi)) + 2 * pi) % (2 * pi);

  return SolarEphemeris(decl: decl, r: r, eclLon: eclLon);
}

/// Solar vertical angular speed near a given hour angle [hAngleRad] (radians),
/// in degrees per hour.
double solarVerticalSpeed(
  double latRad,
  double declRad,
  double hAngleRad,
) {
  return 15 * (cos(latRad) * cos(declRad) * sin(hAngleRad)).abs();
}

/// Compute the atmospheric refraction correction (degrees) for a given
/// apparent solar altitude using the Bennett/Saemundsson formula.
///
/// Returns a positive correction. For altitudes below -1°, returns 0.
double atmosphericRefraction(
  double altitudeDeg, {
  double pressureMbar = 1013.25,
  double temperatureC = 15,
}) {
  if (altitudeDeg < -1) return 0;
  const deg = pi / 180;
  // Bennett's formula in arcminutes
  final r0 = 1.02 / tan((altitudeDeg + 10.3 / (altitudeDeg + 5.11)) * deg);
  // Scale for pressure and temperature
  final r = r0 * (pressureMbar / 1010) * (283 / (273 + temperatureC));
  return r < 0 ? 0.0 : r / 60; // convert arcminutes to degrees
}
