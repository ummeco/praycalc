import 'dart:math' as math;

/// Odeh 2006 crescent visibility zone.
enum HilalZone {
  /// A: Easily visible to naked eye.
  naked,

  /// B: Visible with optical aid (binoculars/telescope).
  binoculars,

  /// C: Very difficult — only with optical aid in exceptional conditions.
  difficult,

  /// D: Not visible even with optical aid.
  invisible,
}

/// Result of a Hilal crescent visibility computation for one location.
class HilalVisibility {
  const HilalVisibility({
    required this.zone,
    required this.V,
    required this.ARCV,
    required this.ARCL,
    required this.W,
  });

  final HilalZone zone;

  /// Odeh V parameter: V = ARCV − arcvMin(W).  Positive = more visible.
  final double V;

  /// Moon altitude minus Sun altitude at observation time (degrees).
  final double ARCV;

  /// Geocentric Sun–Moon angular separation (degrees).
  final double ARCL;

  /// Crescent width in arc minutes.
  final double W;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const double _kDeg = math.pi / 180.0;
const double _kJ2000 = 2451545.0; // Julian Date of J2000.0
const double _kMoonRadKm = 1737.4;
const double _kAuKm = 149597870.7;

// ── Julian Date ───────────────────────────────────────────────────────────────

/// Convert a UTC [DateTime] to Julian Date.
double _jd(DateTime dt) {
  int y = dt.year;
  int m = dt.month;
  final d = dt.day +
      dt.hour / 24.0 +
      dt.minute / 1440.0 +
      dt.second / 86400.0;
  if (m <= 2) {
    y -= 1;
    m += 12;
  }
  final a = y ~/ 100;
  final b = 2 - a + a ~/ 4;
  return (365.25 * (y + 4716)).floor() +
      (30.6001 * (m + 1)).floor() +
      d +
      b -
      1524.5;
}

// ── Approximate Moon and Sun GCRS positions (Meeus Ch. 25 + 47) ───────────────

/// Longitude + distance terms [d, m, mp, f, Σl×1e-6°, Σr×0.001km]
const _kLD = <List<int>>[
  [0, 0, 1, 0, 6288774, -20905355],
  [2, 0, -1, 0, 1274027, -3699111],
  [2, 0, 0, 0, 658314, -2955968],
  [0, 0, 2, 0, 213618, -569925],
  [0, 1, 0, 0, -185116, 48888],
  [0, 0, 0, 2, -114332, -3149],
  [2, 0, -2, 0, 58793, 246158],
  [2, -1, -1, 0, 57066, -152138],
  [2, 0, 1, 0, 53322, -170733],
  [2, -1, 0, 0, 45758, -204586],
  [0, 1, -1, 0, -40923, -129620],
  [1, 0, 0, 0, -34720, 108743],
  [0, 1, 1, 0, -30383, 104755],
  [2, 0, 0, -2, 15327, 10321],
  [0, 0, 1, 2, -12528, 0],
  [0, 0, 1, -2, 10980, 79661],
  [4, 0, -1, 0, 10675, -34782],
  [0, 0, 3, 0, 10034, -23210],
  [4, 0, -2, 0, 8548, -21636],
  [2, 1, -1, 0, -7888, 24208],
  [2, 1, 0, 0, -6766, 30824],
  [1, 0, -1, 0, -5163, -8379],
  [1, 1, 0, 0, 4987, -16675],
  [2, -1, 1, 0, 4036, -12831],
  [2, 0, 2, 0, 3994, -10445],
  [4, 0, 0, 0, 3861, -11650],
  [2, 0, -3, 0, 3665, 14403],
  [0, 1, -2, 0, -2689, -7003],
  [2, 0, -1, 2, -2602, 0],
  [2, -1, -2, 0, 2390, 10056],
];

/// Latitude terms [d, m, mp, f, Σb×1e-6°]
const _kFB = <List<int>>[
  [0, 0, 0, 1, 5128122],
  [0, 0, 1, 1, 280602],
  [0, 0, 1, -1, 277693],
  [2, 0, 0, -1, 173237],
  [2, 0, -1, 1, 55413],
  [2, 0, -1, -1, 46271],
  [2, 0, 0, 1, 32573],
  [0, 0, 2, 1, 17198],
  [2, 0, 1, -1, 9266],
  [0, 0, 2, -1, 8822],
  [2, -1, 0, -1, 8216],
  [2, 0, -2, -1, 4324],
  [2, 0, 1, 1, 4200],
  [2, 1, 0, -1, -3359],
  [2, -1, -1, 1, 2463],
  [2, -1, 0, 1, 2211],
  [2, -1, -1, -1, 2065],
  [0, 1, -1, -1, -1870],
  [4, 0, -1, -1, 1828],
  [0, 1, 0, 1, -1794],
];

/// Compute approximate Moon and Sun GCRS positions using Meeus Ch. 25/47.
/// Returns positions in km as [x, y, z] and the Moon's geocentric distance.
({List<double> moon, List<double> sun, double moonDistKm}) _positions(
    double jdTT) {
  final T = (jdTT - _kJ2000) / 36525.0;

  // ── Sun (Meeus Ch. 25) ──────────────────────────────────────────────────────
  final L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  final Msun = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  final Msun_r = (Msun % 360) * _kDeg;
  final eSun = 0.016708634 - 0.000042037 * T;
  final C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * math.sin(Msun_r) +
      (0.019993 - 0.000101 * T) * math.sin(2 * Msun_r) +
      0.000289 * math.sin(3 * Msun_r);
  final nu_r = Msun_r + C * _kDeg;
  final R_km =
      1.000001018 * (1 - eSun * eSun) / (1 + eSun * math.cos(nu_r)) * _kAuKm;
  final omega = (125.04 - 1934.136 * T) * _kDeg;
  final sunLon_r =
      (L0 + C - 0.00569 - 0.00478 * math.sin(omega)) * _kDeg;
  final eps = (23.439291111 - 0.013004167 * T) * _kDeg;

  final sunGCRS = [
    R_km * math.cos(sunLon_r),
    R_km * math.sin(sunLon_r) * math.cos(eps),
    R_km * math.sin(sunLon_r) * math.sin(eps),
  ];

  // ── Moon (Meeus Ch. 47) ─────────────────────────────────────────────────────
  final Lp = 218.3164477 +
      481267.88123421 * T -
      0.0015786 * T * T +
      T * T * T / 538841 -
      T * T * T * T / 65194000;
  final D = 297.8501921 +
      445267.1114034 * T -
      0.0018819 * T * T +
      T * T * T / 545868 -
      T * T * T * T / 113065000;
  final M = 357.5291092 +
      35999.0502909 * T -
      0.0001536 * T * T +
      T * T * T / 24490000;
  final Mp = 134.9633964 +
      477198.8675055 * T +
      0.0087414 * T * T +
      T * T * T / 69699 -
      T * T * T * T / 14712000;
  final F = 93.2720950 +
      483202.0175233 * T -
      0.0036539 * T * T -
      T * T * T / 3526000 +
      T * T * T * T / 863310000;

  final A1 = (119.75 + 131.849 * T) * _kDeg;
  final A2 = (53.09 + 479264.290 * T) * _kDeg;
  final A3 = (313.45 + 481266.484 * T) * _kDeg;

  final D_r = (D % 360) * _kDeg;
  final M_r = (M % 360) * _kDeg;
  final Mp_r = (Mp % 360) * _kDeg;
  final F_r = (F % 360) * _kDeg;
  final E = 1 - 0.002516 * T - 0.0000074 * T * T;

  double Sl = 0, Sr = 0;
  for (final row in _kLD) {
    final arg = row[0] * D_r + row[1] * M_r + row[2] * Mp_r + row[3] * F_r;
    final absM = row[1].abs();
    final eCorr = absM == 2
        ? E * E
        : absM == 1
            ? E
            : 1.0;
    Sl += row[4] * eCorr * math.sin(arg);
    Sr += row[5] * eCorr * math.cos(arg);
  }
  Sl += 3958 * math.sin(A1) +
      1962 * math.sin((Lp - F) * _kDeg) +
      318 * math.sin(A2);

  double Sb = 0;
  for (final row in _kFB) {
    final arg = row[0] * D_r + row[1] * M_r + row[2] * Mp_r + row[3] * F_r;
    final absM = row[1].abs();
    final eCorr = absM == 2
        ? E * E
        : absM == 1
            ? E
            : 1.0;
    Sb += row[4] * eCorr * math.sin(arg);
  }
  Sb += -2235 * math.sin(Lp * _kDeg) +
      382 * math.sin(A3) +
      175 * math.sin(A1 - F_r) +
      175 * math.sin(A1 + F_r) +
      127 * math.sin((Lp - Mp) * _kDeg) -
      115 * math.sin((Lp + Mp) * _kDeg);

  final moonLon_r = (Lp + Sl * 1e-6) * _kDeg;
  final moonLat_r = (Sb * 1e-6) * _kDeg;
  final moonDistKm = 385000.56 + Sr * 0.001;

  final moonGCRS = [
    moonDistKm * math.cos(moonLat_r) * math.cos(moonLon_r),
    moonDistKm *
        (math.cos(eps) * math.cos(moonLat_r) * math.sin(moonLon_r) -
            math.sin(eps) * math.sin(moonLat_r)),
    moonDistKm *
        (math.sin(eps) * math.cos(moonLat_r) * math.sin(moonLon_r) +
            math.cos(eps) * math.sin(moonLat_r)),
  ];

  return (moon: moonGCRS, sun: sunGCRS, moonDistKm: moonDistKm);
}

// ── Observer altitude ─────────────────────────────────────────────────────────

/// Compute the altitude (degrees) of a body at GCRS position [gcrs] (km)
/// for an observer at geodetic [lat], [lon] (degrees east) at Julian Date [jd].
double _altitude(List<double> gcrs, double lat, double lon, double jd) {
  final dist = math.sqrt(
      gcrs[0] * gcrs[0] + gcrs[1] * gcrs[1] + gcrs[2] * gcrs[2]);
  final ra = math.atan2(gcrs[1], gcrs[0]) / _kDeg; // degrees
  final dec = math.asin((gcrs[2] / dist).clamp(-1.0, 1.0)) / _kDeg; // degrees

  // Greenwich Mean Sidereal Time (degrees)
  final T = (jd - _kJ2000) / 36525.0;
  final gmst = (280.46061837 +
          360.98564736629 * (jd - _kJ2000) +
          0.000387933 * T * T -
          T * T * T / 38710000.0) %
      360.0;

  // Local Hour Angle (degrees, adjusted to [-180, 180])
  var lha = (gmst + lon - ra) % 360.0;
  if (lha > 180.0) lha -= 360.0;

  final latR = lat * _kDeg;
  final decR = dec * _kDeg;
  final lhaR = lha * _kDeg;
  return math.asin((math.sin(latR) * math.sin(decR) +
              math.cos(latR) * math.cos(decR) * math.cos(lhaR))
          .clamp(-1.0, 1.0)) /
      _kDeg;
}

// ── Odeh geometry ─────────────────────────────────────────────────────────────

/// Geocentric elongation (degrees) between Moon and Sun.
double _elongation(List<double> moon, List<double> sun) {
  final rM = math.sqrt(
      moon[0] * moon[0] + moon[1] * moon[1] + moon[2] * moon[2]);
  final rS = math
      .sqrt(sun[0] * sun[0] + sun[1] * sun[1] + sun[2] * sun[2]);
  final dot = moon[0] * sun[0] + moon[1] * sun[1] + moon[2] * sun[2];
  return math.acos((dot / (rM * rS)).clamp(-1.0, 1.0)) / _kDeg;
}

/// Crescent width W in arc minutes (Odeh/Yallop formula).
double _crescentWidth(double arclDeg, double moonDistKm) {
  final sd = math.atan(_kMoonRadKm / moonDistKm) / _kDeg * 60; // arcmin
  return sd * (1 - math.cos(arclDeg * _kDeg));
}

/// Odeh 2006 arcv-minimum polynomial (standard Odeh criterion).
double _arcvMin(double W) {
  return 11.8371 - 6.3226 * W + 0.7319 * W * W - 0.1018 * W * W * W;
}

/// Map Odeh V parameter to a [HilalZone].
HilalZone _odehZone(double V) {
  if (V >= 5.65) return HilalZone.naked;
  if (V >= 2.00) return HilalZone.binoculars;
  if (V >= -0.96) return HilalZone.difficult;
  return HilalZone.invisible;
}

// ── Public API ────────────────────────────────────────────────────────────────

/// Compute Hilal crescent visibility for a single [lat]/[lon] (degrees) on
/// the given Gregorian [date].
///
/// The computation uses Meeus Ch. 25/47 approximate ephemeris and the Odeh
/// 2006 criterion.  Observation time is approximated as local sunset + 40 min
/// (when the moon is ideally placed for sighting).
HilalVisibility computeHilalVisibility(
    DateTime date, double lat, double lon) {
  // Local mean solar sunset ≈ 18:00 LST = (18.0 − lon/15) UTC hours.
  double utcHr = (18.0 - lon / 15.0) % 24.0;
  if (utcHr < 0) utcHr += 24.0;
  // Observation window: +40 minutes after sunset.
  double obsHr = (utcHr + 0.667) % 24.0;

  final hh = obsHr.floor();
  final mm = ((obsHr - hh) * 60).round();
  final obsUtc = DateTime.utc(date.year, date.month, date.day, hh, mm);
  final jd = _jd(obsUtc);

  final pos = _positions(jd);
  final moonAlt = _altitude(pos.moon, lat, lon, jd);
  final sunAlt = _altitude(pos.sun, lat, lon, jd);

  final arcl = _elongation(pos.moon, pos.sun);
  final W = _crescentWidth(arcl, pos.moonDistKm);

  // Moon must be above horizon for any sighting.
  if (moonAlt < 0) {
    return HilalVisibility(
        zone: HilalZone.invisible,
        V: -99.0,
        ARCV: moonAlt - sunAlt,
        ARCL: arcl,
        W: W);
  }

  final ARCV = moonAlt - sunAlt;
  final V = ARCV - _arcvMin(W);

  return HilalVisibility(
      zone: _odehZone(V), V: V, ARCV: ARCV, ARCL: arcl, W: W);
}

// ── Precomputed Visibility Grid ───────────────────────────────────────────────

/// A precomputed crescent visibility grid for a specific [date].
///
/// Covers latitudes [−80°, +80°] and all longitudes [−180°, +175°] at
/// [step]-degree resolution.  Moon and Sun positions are recomputed for each
/// longitude column (using the local-sunset UTC time for that column) so that
/// the curved visibility zones are accurately reproduced.
class HilalGrid {
  HilalGrid._({
    required this.date,
    required this.step,
    required List<HilalZone> zones,
    required int rows,
    required int cols,
  })  : _zones = zones,
        _rows = rows,
        _cols = cols;

  final DateTime date;
  final int step;
  final List<HilalZone> _zones;
  final int _rows;
  final int _cols;

  static const double _latMax = 80.0;
  static const double _latMin = -80.0;
  static const double _lonMin = -180.0;
  static const double _lonMax = 175.0;

  /// Compute a new visibility grid for [date] at [step]-degree resolution.
  ///
  /// Positions are computed once per longitude column (all cells in a column
  /// share the same local-sunset UTC time) for efficiency and accuracy.
  factory HilalGrid.compute(DateTime date, {int step = 5}) {
    final rows = ((_latMax - _latMin) / step).round() + 1;
    final cols = ((_lonMax - _lonMin) / step).round() + 1;
    final zones =
        List<HilalZone>.filled(rows * cols, HilalZone.invisible);

    for (var c = 0; c < cols; c++) {
      final lon = _lonMin + c * step;

      // UTC time of local sunset + 40 min for this longitude column.
      double utcHr = (18.0 - lon / 15.0 + 0.667) % 24.0;
      if (utcHr < 0) utcHr += 24.0;
      final hh = utcHr.floor();
      final mm = ((utcHr - hh) * 60).round();
      final obsUtc = DateTime.utc(date.year, date.month, date.day, hh, mm);
      final jd = _jd(obsUtc);

      // Compute Moon/Sun positions once for this column.
      final pos = _positions(jd);
      final arcl = _elongation(pos.moon, pos.sun);
      final W = _crescentWidth(arcl, pos.moonDistKm);
      final arcvMinVal = _arcvMin(W);

      for (var r = 0; r < rows; r++) {
        final lat = _latMax - r * step;
        final moonAlt = _altitude(pos.moon, lat, lon, jd);

        HilalZone zone;
        if (moonAlt < 0) {
          zone = HilalZone.invisible;
        } else {
          final sunAlt = _altitude(pos.sun, lat, lon, jd);
          final V = (moonAlt - sunAlt) - arcvMinVal;
          zone = _odehZone(V);
        }
        zones[r * cols + c] = zone;
      }
    }

    return HilalGrid._(
        date: date, step: step, zones: zones, rows: rows, cols: cols);
  }

  /// Zone at the nearest grid point to [lat], [lon].
  HilalZone zoneAt(double lat, double lon) {
    final r =
        ((_latMax - lat.clamp(_latMin, _latMax)) / step).round().clamp(0, _rows - 1);
    final c =
        ((lon.clamp(_lonMin, _lonMax) - _lonMin) / step).round().clamp(0, _cols - 1);
    return _zones[r * _cols + c];
  }
}
