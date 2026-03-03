/// Core types for pray_calc_dart.
library;

/// Asr shadow convention: Shafi'i (1x) or Hanafi (2x).
enum AsrConvention { shafii, hanafi }

/// Shafaq variant for MSC Isha model.
enum ShafaqMode { general, ahmer, abyad }

/// Computed twilight depression angles for Fajr and Isha.
class TwilightAngles {
  /// Solar depression angle for Fajr (positive degrees below horizon).
  final double fajrAngle;

  /// Solar depression angle for Isha (positive degrees below horizon).
  final double ishaAngle;

  const TwilightAngles({required this.fajrAngle, required this.ishaAngle});
}

/// Raw prayer times as fractional hours. NaN = unreachable event.
class PrayerTimes {
  /// Start of the last third of the night (Qiyam al-Layl).
  final double qiyam;

  /// True dawn (Subh Sadiq).
  final double fajr;

  /// Astronomical sunrise.
  final double sunrise;

  /// Solar noon (exact geometric transit).
  final double noon;

  /// Dhuhr (2.5 minutes after solar noon).
  final double dhuhr;

  /// Asr (Shafi'i or Hanafi shadow convention).
  final double asr;

  /// Maghrib (sunset).
  final double maghrib;

  /// Isha (nightfall, end of shafaq).
  final double isha;

  /// Dynamic twilight angles used for this calculation.
  final TwilightAngles angles;

  const PrayerTimes({
    required this.qiyam,
    required this.fajr,
    required this.sunrise,
    required this.noon,
    required this.dhuhr,
    required this.asr,
    required this.maghrib,
    required this.isha,
    required this.angles,
  });
}

/// Prayer times formatted as HH:MM:SS strings.
class FormattedPrayerTimes {
  final String qiyam;
  final String fajr;
  final String sunrise;
  final String noon;
  final String dhuhr;
  final String asr;
  final String maghrib;
  final String isha;
  final TwilightAngles angles;

  const FormattedPrayerTimes({
    required this.qiyam,
    required this.fajr,
    required this.sunrise,
    required this.noon,
    required this.dhuhr,
    required this.asr,
    required this.maghrib,
    required this.isha,
    required this.angles,
  });
}

/// Solar ephemeris result.
class SolarEphemeris {
  /// Solar declination in degrees.
  final double decl;

  /// Earth-Sun distance in AU.
  final double r;

  /// Apparent solar ecliptic longitude in radians (0–2π).
  final double eclLon;

  const SolarEphemeris({required this.decl, required this.r, required this.eclLon});
}

/// SPA result from the NREL Solar Position Algorithm.
class SpaResult {
  /// Topocentric zenith angle in degrees.
  final double zenith;

  /// Topocentric azimuth angle, eastward from north, in degrees.
  final double azimuth;

  /// Local sunrise time as fractional hours (NaN if polar).
  final double sunrise;

  /// Local sun transit time (solar noon) as fractional hours.
  final double solarNoon;

  /// Local sunset time as fractional hours (NaN if polar).
  final double sunset;

  /// Custom zenith angle results (one per angle in the input list).
  final List<SpaAnglesResult> angles;

  const SpaResult({
    required this.zenith,
    required this.azimuth,
    required this.sunrise,
    required this.solarNoon,
    required this.sunset,
    this.angles = const [],
  });
}

/// Sunrise/sunset pair for a custom zenith angle.
class SpaAnglesResult {
  final double sunrise;
  final double sunset;

  const SpaAnglesResult({required this.sunrise, required this.sunset});
}
