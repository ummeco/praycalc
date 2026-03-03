/// NREL Solar Position Algorithm (SPA) — Dart port.
///
/// Direct port of the nrel-spa JavaScript library (spa.js v2.0.1).
/// Accurate to ±0.0003° for solar zenith angle.
///
/// Reference: Reda, I. and Andreas, A. (2004). Solar Position Algorithm for
/// Solar Radiation Applications. NREL/TP-560-34302.
library;

import 'dart:math';

import 'types.dart';

// ─── Constants ──────────────────────────────────────────────────────────────

const int _sPaZaRts = 2;
const int _sPaAll = 3;
const double _sunRadius = 0.26667;

// ─── Earth Periodic Term Tables ─────────────────────────────────────────────

// Each row: [A, B, C] where A is amplitude, B is phase, C is frequency
const List<List<List<double>>> _lTerms = [
  // L0 — 64 terms
  [
    [175347046.0, 0, 0],
    [3341656.0, 4.6692568, 6283.07585],
    [34894.0, 4.6261, 12566.1517],
    [3497.0, 2.7441, 5753.3849],
    [3418.0, 2.8289, 3.5231],
    [3136.0, 3.6277, 77713.7715],
    [2676.0, 4.4181, 7860.4194],
    [2343.0, 6.1352, 3930.2097],
    [1324.0, 0.7425, 11506.7698],
    [1273.0, 2.0371, 529.691],
    [1199.0, 1.1096, 1577.3435],
    [990, 5.233, 5884.927],
    [902, 2.045, 26.298],
    [857, 3.508, 398.149],
    [780, 1.179, 5223.694],
    [753, 2.533, 5507.553],
    [505, 4.583, 18849.228],
    [492, 4.205, 775.523],
    [357, 2.92, 0.067],
    [317, 5.849, 11790.629],
    [284, 1.899, 796.298],
    [271, 0.315, 10977.079],
    [243, 0.345, 5486.778],
    [206, 4.806, 2544.314],
    [205, 1.869, 5573.143],
    [202, 2.458, 6069.777],
    [156, 0.833, 213.299],
    [132, 3.411, 2942.463],
    [126, 1.083, 20.775],
    [115, 0.645, 0.98],
    [103, 0.636, 4694.003],
    [102, 0.976, 15720.839],
    [102, 4.267, 7.114],
    [99, 6.21, 2146.17],
    [98, 0.68, 155.42],
    [86, 5.98, 161000.69],
    [85, 1.3, 6275.96],
    [85, 3.67, 71430.7],
    [80, 1.81, 17260.15],
    [79, 3.04, 12036.46],
    [75, 1.76, 5088.63],
    [74, 3.5, 3154.69],
    [74, 4.68, 801.82],
    [70, 0.83, 9437.76],
    [62, 3.98, 8827.39],
    [61, 1.82, 7084.9],
    [57, 2.78, 6286.6],
    [56, 4.39, 14143.5],
    [56, 3.47, 6279.55],
    [52, 0.19, 12139.55],
    [52, 1.33, 1748.02],
    [51, 0.28, 5856.48],
    [49, 0.49, 1194.45],
    [41, 5.37, 8429.24],
    [41, 2.4, 19651.05],
    [39, 6.17, 10447.39],
    [37, 6.04, 10213.29],
    [37, 2.57, 1059.38],
    [36, 1.71, 2352.87],
    [36, 1.78, 6812.77],
    [33, 0.59, 17789.85],
    [30, 0.44, 83996.85],
    [30, 2.74, 1349.87],
    [25, 3.16, 4690.48],
  ],
  // L1 — 34 terms
  [
    [628331966747.0, 0, 0],
    [206059.0, 2.678235, 6283.07585],
    [4303.0, 2.6351, 12566.1517],
    [425.0, 1.59, 3.523],
    [119.0, 5.796, 26.298],
    [109.0, 2.966, 1577.344],
    [93, 2.59, 18849.23],
    [72, 1.14, 529.69],
    [68, 1.87, 398.15],
    [67, 4.41, 5507.55],
    [59, 2.89, 5223.69],
    [56, 2.17, 155.42],
    [45, 0.4, 796.3],
    [36, 0.47, 775.52],
    [29, 2.65, 7.11],
    [21, 5.34, 0.98],
    [19, 1.85, 5486.78],
    [19, 4.97, 213.3],
    [17, 2.99, 6275.96],
    [16, 0.03, 2544.31],
    [16, 1.43, 2146.17],
    [15, 1.21, 10977.08],
    [12, 2.83, 1748.02],
    [12, 3.26, 5088.63],
    [12, 5.27, 1194.45],
    [12, 2.08, 4694],
    [11, 0.77, 553.57],
    [10, 1.3, 6286.6],
    [10, 4.24, 1349.87],
    [9, 2.7, 242.73],
    [9, 5.64, 951.72],
    [8, 5.3, 2352.87],
    [6, 2.65, 9437.76],
    [6, 4.67, 4690.48],
  ],
  // L2 — 20 terms
  [
    [52919.0, 0, 0],
    [8720.0, 1.0721, 6283.0758],
    [309.0, 0.867, 12566.152],
    [27, 0.05, 3.52],
    [16, 5.19, 26.3],
    [16, 3.68, 155.42],
    [10, 0.76, 18849.23],
    [9, 2.06, 77713.77],
    [7, 0.83, 775.52],
    [5, 4.66, 1577.34],
    [4, 1.03, 7.11],
    [4, 3.44, 5573.14],
    [3, 5.14, 796.3],
    [3, 6.05, 5507.55],
    [3, 1.19, 242.73],
    [3, 6.12, 529.69],
    [3, 0.31, 398.15],
    [3, 2.28, 553.57],
    [2, 4.38, 5223.69],
    [2, 3.75, 0.98],
  ],
  // L3 — 7 terms
  [
    [289.0, 5.844, 6283.076],
    [35, 0, 0],
    [17, 5.49, 12566.15],
    [3, 5.2, 155.42],
    [1, 4.72, 3.52],
    [1, 5.3, 18849.23],
    [1, 5.97, 242.73],
  ],
  // L4 — 3 terms
  [
    [114.0, 3.142, 0],
    [8, 4.13, 6283.08],
    [1, 3.84, 12566.15],
  ],
  // L5 — 1 term
  [
    [1, 3.14, 0],
  ],
];

const List<List<List<double>>> _bTerms = [
  // B0 — 5 terms
  [
    [280.0, 3.199, 84334.662],
    [102.0, 5.422, 5507.553],
    [80, 3.88, 5223.69],
    [44, 3.7, 2352.87],
    [32, 4, 1577.34],
  ],
  // B1 — 2 terms
  [
    [9, 3.9, 5507.55],
    [6, 1.73, 5223.69],
  ],
];

const List<List<List<double>>> _rTerms = [
  // R0 — 40 terms
  [
    [100013989.0, 0, 0],
    [1670700.0, 3.0984635, 6283.07585],
    [13956.0, 3.05525, 12566.1517],
    [3084.0, 5.1985, 77713.7715],
    [1628.0, 1.1739, 5753.3849],
    [1576.0, 2.8469, 7860.4194],
    [925.0, 5.453, 11506.77],
    [542.0, 4.564, 3930.21],
    [472.0, 3.661, 5884.927],
    [346.0, 0.964, 5507.553],
    [329.0, 5.9, 5223.694],
    [307.0, 0.299, 5573.143],
    [243.0, 4.273, 11790.629],
    [212.0, 5.847, 1577.344],
    [186.0, 5.022, 10977.079],
    [175.0, 3.012, 18849.228],
    [110.0, 5.055, 5486.778],
    [98, 0.89, 6069.78],
    [86, 5.69, 15720.84],
    [86, 1.27, 161000.69],
    [65, 0.27, 17260.15],
    [63, 0.92, 529.69],
    [57, 2.01, 83996.85],
    [56, 5.24, 71430.7],
    [49, 3.25, 2544.31],
    [47, 2.58, 775.52],
    [45, 5.54, 9437.76],
    [43, 6.01, 6275.96],
    [39, 5.36, 4694],
    [38, 2.39, 8827.39],
    [37, 0.83, 19651.05],
    [37, 4.9, 12139.55],
    [36, 1.67, 12036.46],
    [35, 1.84, 2942.46],
    [33, 0.24, 7084.9],
    [32, 0.18, 5088.63],
    [32, 1.78, 398.15],
    [28, 1.21, 6286.6],
    [28, 1.9, 6279.55],
    [26, 4.59, 10447.39],
  ],
  // R1 — 10 terms
  [
    [103019.0, 1.10749, 6283.07585],
    [1721.0, 1.0644, 12566.1517],
    [702.0, 3.142, 0],
    [32, 1.02, 18849.23],
    [31, 2.84, 5507.55],
    [25, 1.32, 5223.69],
    [18, 1.42, 1577.34],
    [10, 5.91, 10977.08],
    [9, 1.42, 6275.96],
    [9, 0.27, 5486.78],
  ],
  // R2 — 6 terms
  [
    [4359.0, 5.7846, 6283.0758],
    [124.0, 5.579, 12566.152],
    [12, 3.14, 0],
    [9, 3.63, 77713.77],
    [6, 1.87, 5573.14],
    [3, 5.47, 18849.23],
  ],
  // R3 — 2 terms
  [
    [145.0, 4.273, 6283.076],
    [7, 3.92, 12566.15],
  ],
  // R4 — 1 term
  [
    [4, 2.56, 6283.08],
  ],
];

// Periodic terms for nutation in longitude and obliquity
// Each row: [x0, x1, x2, x3, x4]
const List<List<int>> _yTerms = [
  [0, 0, 0, 0, 1],
  [-2, 0, 0, 2, 2],
  [0, 0, 0, 2, 2],
  [0, 0, 0, 0, 2],
  [0, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [-2, 1, 0, 2, 2],
  [0, 0, 0, 2, 1],
  [0, 0, 1, 2, 2],
  [-2, -1, 0, 2, 2],
  [-2, 0, 1, 0, 0],
  [-2, 0, 0, 2, 1],
  [0, 0, -1, 2, 2],
  [2, 0, 0, 0, 0],
  [0, 0, 1, 0, 1],
  [2, 0, -1, 2, 2],
  [0, 0, -1, 0, 1],
  [0, 0, 1, 2, 1],
  [-2, 0, 2, 0, 0],
  [0, 0, -2, 2, 1],
  [2, 0, 0, 2, 2],
  [0, 0, 2, 2, 2],
  [0, 0, 2, 0, 0],
  [-2, 0, 1, 2, 2],
  [0, 0, 0, 2, 0],
  [-2, 0, 0, 2, 0],
  [0, 0, -1, 2, 1],
  [0, 2, 0, 0, 0],
  [2, 0, -1, 0, 1],
  [-2, 2, 0, 2, 2],
  [0, 1, 0, 0, 1],
  [-2, 0, 1, 0, 1],
  [0, -1, 0, 0, 1],
  [0, 0, 2, -2, 0],
  [2, 0, -1, 2, 1],
  [2, 0, 1, 2, 2],
  [0, 1, 0, 2, 2],
  [-2, 1, 1, 0, 0],
  [0, -1, 0, 2, 2],
  [2, 0, 0, 2, 1],
  [2, 0, 1, 0, 0],
  [-2, 0, 2, 2, 2],
  [-2, 0, 1, 2, 1],
  [2, 0, -2, 0, 1],
  [2, 0, 0, 0, 1],
  [0, -1, 1, 0, 0],
  [-2, -1, 0, 2, 1],
  [-2, 0, 0, 0, 1],
  [0, 0, 2, 2, 1],
  [-2, 0, 2, 0, 1],
  [-2, 1, 0, 2, 1],
  [0, 0, 1, -2, 0],
  [-1, 0, 1, 0, 0],
  [-2, 1, 0, 0, 0],
  [1, 0, 0, 0, 0],
  [0, 0, 1, 2, 0],
  [0, 0, -2, 2, 2],
  [-1, -1, 1, 0, 0],
  [0, 1, 1, 0, 0],
  [0, -1, 1, 2, 2],
  [2, -1, -1, 2, 2],
  [0, 0, 3, 2, 2],
  [2, -1, 0, 2, 2],
];

// Nutation longitude/obliquity coefficients [psiA, psiB, epsC, epsD]
const List<List<double>> _peTerms = [
  [-171996, -174.2, 92025, 8.9],
  [-13187, -1.6, 5736, -3.1],
  [-2274, -0.2, 977, -0.5],
  [2062, 0.2, -895, 0.5],
  [1426, -3.4, 54, -0.1],
  [712, 0.1, -7, 0],
  [-517, 1.2, 224, -0.6],
  [-386, -0.4, 200, 0],
  [-301, 0, 129, -0.1],
  [217, -0.5, -95, 0.3],
  [-158, 0, 0, 0],
  [129, 0.1, -70, 0],
  [123, 0, -53, 0],
  [63, 0, 0, 0],
  [63, 0.1, -33, 0],
  [-59, 0, 26, 0],
  [-58, -0.1, 32, 0],
  [-51, 0, 27, 0],
  [48, 0, 0, 0],
  [46, 0, -24, 0],
  [-38, 0, 16, 0],
  [-31, 0, 13, 0],
  [29, 0, 0, 0],
  [29, 0, -12, 0],
  [26, 0, 0, 0],
  [-22, 0, 0, 0],
  [21, 0, -10, 0],
  [17, -0.1, 0, 0],
  [16, 0, -8, 0],
  [-16, 0.1, 7, 0],
  [-15, 0, 9, 0],
  [-13, 0, 7, 0],
  [-12, 0, 6, 0],
  [11, 0, 0, 0],
  [-10, 0, 5, 0],
  [-8, 0, 3, 0],
  [7, 0, -3, 0],
  [-7, 0, 0, 0],
  [-7, 0, 3, 0],
  [-7, 0, 3, 0],
  [6, 0, 0, 0],
  [6, 0, -3, 0],
  [6, 0, -3, 0],
  [-6, 0, 3, 0],
  [-6, 0, 3, 0],
  [5, 0, 0, 0],
  [-5, 0, 3, 0],
  [-5, 0, 3, 0],
  [-5, 0, 3, 0],
  [4, 0, 0, 0],
  [4, 0, 0, 0],
  [4, 0, 0, 0],
  [-4, 0, 0, 0],
  [-4, 0, 0, 0],
  [-4, 0, 0, 0],
  [3, 0, 0, 0],
  [-3, 0, 0, 0],
  [-3, 0, 0, 0],
  [-3, 0, 0, 0],
  [-3, 0, 0, 0],
  [-3, 0, 0, 0],
  [-3, 0, 0, 0],
  [-3, 0, 0, 0],
];

const List<int> _lSubcount = [64, 34, 20, 7, 3, 1];
const List<int> _bSubcount = [5, 2];
const List<int> _rSubcount = [40, 10, 6, 2, 1];

// ─── Mutable internal state ─────────────────────────────────────────────────

class _Spa {
  // Inputs
  int year = 0;
  int month = 0;
  int day = 0;
  int hour = 0;
  int minute = 0;
  double second = 0.0;
  double deltaUt1 = 0.0;
  double deltaT = 0.0;
  double timezone = 0.0;
  double longitude = 0.0;
  double latitude = 0.0;
  double elevation = 0.0;
  double pressure = 0.0;
  double temperature = 0.0;
  double slope = 0.0;
  double azmRotation = 0.0;
  double atmosRefract = 0.0;
  int function = 0;
  // Intermediate
  double jd = 0.0;
  double jc = 0.0;
  double jde = 0.0;
  double jce = 0.0;
  double jme = 0.0;
  double l = 0.0;
  double b = 0.0;
  double r = 0.0;
  double theta = 0.0;
  double beta = 0.0;
  double x0 = 0.0;
  double x1 = 0.0;
  double x2 = 0.0;
  double x3 = 0.0;
  double x4 = 0.0;
  double delPsi = 0.0;
  double delEpsilon = 0.0;
  double epsilon0 = 0.0;
  double epsilon = 0.0;
  double delTau = 0.0;
  double lamda = 0.0;
  double nu0 = 0.0;
  double nu = 0.0;
  double alpha = 0.0;
  double delta = 0.0;
  double h = 0.0;
  double xi = 0.0;
  double delAlpha = 0.0;
  double deltaPrime = 0.0;
  double alphaPrime = 0.0;
  double hPrime = 0.0;
  double e0 = 0.0;
  double delE = 0.0;
  double e = 0.0;
  double eot = 0.0;
  double srha = 0.0;
  double ssha = 0.0;
  double sta = 0.0;
  // Outputs
  double zenith = 0.0;
  double azimuthAstro = 0.0;
  double azimuth = 0.0;
  double incidence = 0.0;
  double suntransit = 0.0;
  double sunrise = 0.0;
  double sunset = 0.0;

  _Spa clone() {
    final c = _Spa();
    c.year = year; c.month = month; c.day = day; c.hour = hour;
    c.minute = minute; c.second = second; c.deltaUt1 = deltaUt1;
    c.deltaT = deltaT; c.timezone = timezone; c.longitude = longitude;
    c.latitude = latitude; c.elevation = elevation; c.pressure = pressure;
    c.temperature = temperature; c.slope = slope; c.azmRotation = azmRotation;
    c.atmosRefract = atmosRefract; c.function = function;
    c.jd = jd; c.jc = jc; c.jde = jde; c.jce = jce; c.jme = jme;
    c.l = l; c.b = b; c.r = r; c.theta = theta; c.beta = beta;
    c.x0 = x0; c.x1 = x1; c.x2 = x2; c.x3 = x3; c.x4 = x4;
    c.delPsi = delPsi; c.delEpsilon = delEpsilon; c.epsilon0 = epsilon0;
    c.epsilon = epsilon; c.delTau = delTau; c.lamda = lamda;
    c.nu0 = nu0; c.nu = nu; c.alpha = alpha; c.delta = delta;
    c.h = h; c.xi = xi; c.delAlpha = delAlpha; c.deltaPrime = deltaPrime;
    c.alphaPrime = alphaPrime; c.hPrime = hPrime; c.e0 = e0; c.delE = delE;
    c.e = e; c.eot = eot; c.srha = srha; c.ssha = ssha; c.sta = sta;
    c.zenith = zenith; c.azimuthAstro = azimuthAstro; c.azimuth = azimuth;
    c.incidence = incidence; c.suntransit = suntransit;
    c.sunrise = sunrise; c.sunset = sunset;
    return c;
  }
}

// ─── Math utility functions ──────────────────────────────────────────────────

double _deg2rad(double degrees) => (pi / 180.0) * degrees;
double _rad2deg(double radians) => (180.0 / pi) * radians;

double _limitDegrees(double degrees) {
  degrees /= 360;
  double limited = 360 * (degrees - degrees.floor());
  if (limited < 0) limited += 360;
  return limited;
}

/// Note: implements JS behavior: ((a*x + b) + c)*x + d  (matches nrel-spa JS)
double _thirdOrderPolynomial(double a, double b, double c, double d, double x) {
  return ((a * x + b) + c) * x + d;
}

double _limitDegrees180pm(double degrees) {
  degrees /= 360.0;
  double limited = 360.0 * (degrees - degrees.floor());
  if (limited < -180.0) { limited += 360.0; }
  else if (limited > 180.0) { limited -= 360.0; }
  return limited;
}

double _limitDegrees180(double degrees) {
  degrees /= 180.0;
  double limited = 180.0 * (degrees - degrees.floor());
  if (limited < 0) limited += 180.0;
  return limited;
}

double _limitZero2one(double value) {
  double limited = value - value.floor();
  if (limited < 0) limited += 1.0;
  return limited;
}

double _limitMinutes(double minutes) {
  double limited = minutes;
  if (limited < -20.0) { limited += 1440.0; }
  else if (limited > 20.0) { limited -= 1440.0; }
  return limited;
}

// ─── Geometric functions ─────────────────────────────────────────────────────

double _geocentricRightAscension(double lamda, double epsilon, double beta) {
  final lambdaRad = _deg2rad(lamda);
  final epsilonRad = _deg2rad(epsilon);
  return _limitDegrees(_rad2deg(atan2(
    sin(lambdaRad) * cos(epsilonRad) - tan(_deg2rad(beta)) * sin(epsilonRad),
    cos(lambdaRad),
  )));
}

double _geocentricDeclination(double beta, double epsilon, double lamda) {
  final betaRad = _deg2rad(beta);
  final epsilonRad = _deg2rad(epsilon);
  return _rad2deg(asin(
    sin(betaRad) * cos(epsilonRad) +
        cos(betaRad) * sin(epsilonRad) * sin(_deg2rad(lamda)),
  ));
}

double _observerHourAngle(double nu, double longitude, double alphaDeg) {
  return _limitDegrees(nu + longitude - alphaDeg);
}

// Mutates dltap fields via a two-element list [deltaAlpha, deltaPrime]
void _rightAscensionParallaxAndTopocentricDec(
  double latitude,
  double elevation,
  double xi,
  double h,
  double delta,
  List<double> dltap, // [0]=deltaAlpha, [1]=deltaPrime
) {
  final latRad = _deg2rad(latitude);
  final xiRad = _deg2rad(xi);
  final hRad = _deg2rad(h);
  final deltaRad = _deg2rad(delta);
  final u = atan(0.99664719 * tan(latRad));
  final y = 0.99664719 * sin(u) + elevation * sin(latRad) / 6378140.0;
  final x = cos(u) + elevation * cos(latRad) / 6378140.0;
  final deltaAlphaRad = atan2(
    -x * sin(xiRad) * sin(hRad),
    cos(deltaRad) - x * sin(xiRad) * cos(hRad),
  );
  dltap[1] = _rad2deg(atan2(
    (sin(deltaRad) - y * sin(xiRad)) * cos(deltaAlphaRad),
    cos(deltaRad) - x * sin(xiRad) * cos(hRad),
  ));
  dltap[0] = _rad2deg(deltaAlphaRad);
}

double _topocentricElevationAngle(
    double latitude, double deltaPrime, double hPrime) {
  final latRad = _deg2rad(latitude);
  final deltaPrimeRad = _deg2rad(deltaPrime);
  return _rad2deg(asin(
    sin(latRad) * sin(deltaPrimeRad) +
        cos(latRad) * cos(deltaPrimeRad) * cos(_deg2rad(hPrime)),
  ));
}

double _atmosphericRefractionCorrection(
    double pressure, double temperature, double atmosRefract, double e0) {
  double delE = 0;
  if (e0 >= -1 * (_sunRadius + atmosRefract)) {
    delE = (pressure / 1010.0) *
        (283.0 / (273.0 + temperature)) *
        1.02 /
        (60.0 * tan(_deg2rad(e0 + 10.3 / (e0 + 5.11))));
  }
  return delE;
}

double _topocentricAzimuthAngleAstro(
    double hPrime, double latitude, double deltaPrime) {
  final hPrimeRad = _deg2rad(hPrime);
  final latRad = _deg2rad(latitude);
  return _limitDegrees(_rad2deg(atan2(
    sin(hPrimeRad),
    cos(hPrimeRad) * sin(latRad) - tan(_deg2rad(deltaPrime)) * cos(latRad),
  )));
}

double _surfaceIncidenceAngle(
    double zenith, double azimuthAstro, double azmRotation, double slope) {
  final zenithRad = _deg2rad(zenith);
  final slopeRad = _deg2rad(slope);
  return _rad2deg(acos(
    cos(zenithRad) * cos(slopeRad) +
        sin(slopeRad) *
            sin(zenithRad) *
            cos(_deg2rad(azimuthAstro - azmRotation)),
  ));
}

// ─── Julian / time functions ─────────────────────────────────────────────────

double _julianDay(int year, int month, int day, int hour, int minute,
    double second, double dut1, double tz) {
  final dayDecimal =
      day + (hour - tz + (minute + (second + dut1) / 60.0) / 60.0) / 24.0;
  int y = year, m = month;
  if (m < 3) { m += 12; y--; }
  double jd = (365.25 * (y + 4716.0)).floor().toDouble() +
      (30.6001 * (m + 1)).floor().toDouble() +
      dayDecimal -
      1524.5;
  if (jd > 2299160.0) {
    final a = (y / 100).floor().toDouble();
    jd += 2 - a + (a / 4).floor();
  }
  return jd;
}

double _julianCentury(double jd) => (jd - 2451545.0) / 36525.0;
double _julianEphemerisDay(double jd, double deltaT) => jd + deltaT / 86400.0;
double _julianEphemerisCentury(double jde) => (jde - 2451545.0) / 36525.0;
double _julianEphemerisMillennium(double jce) => jce / 10.0;

// ─── Periodic term summation ─────────────────────────────────────────────────

double _earthPeriodicTermSummation(
    List<List<double>> terms, int count, double jme) {
  double sum = 0;
  for (int i = 0; i < count; i++) {
    sum += terms[i][0] * cos(terms[i][1] + terms[i][2] * jme);
  }
  return sum;
}

double _earthValues(List<double> termSum, int count, double jme) {
  double sum = 0;
  for (int i = 0; i < count; i++) {
    sum += termSum[i] * pow(jme, i).toDouble();
  }
  return sum / 1.0e8;
}

double _earthHeliocentricLongitude(double jme) {
  final sum = List<double>.filled(6, 0);
  for (int i = 0; i < 6; i++) {
    sum[i] = _earthPeriodicTermSummation(_lTerms[i], _lSubcount[i], jme);
  }
  return _limitDegrees(_rad2deg(_earthValues(sum, 6, jme)));
}

double _earthHeliocentricLatitude(double jme) {
  final sum = List<double>.filled(2, 0);
  for (int i = 0; i < 2; i++) {
    sum[i] = _earthPeriodicTermSummation(_bTerms[i], _bSubcount[i], jme);
  }
  return _rad2deg(_earthValues(sum, 2, jme));
}

double _earthRadiusVector(double jme) {
  final sum = List<double>.filled(5, 0);
  for (int i = 0; i < 5; i++) {
    sum[i] = _earthPeriodicTermSummation(_rTerms[i], _rSubcount[i], jme);
  }
  return _earthValues(sum, 5, jme);
}

double _geocentricLongitude(double l) {
  double theta = l + 180.0;
  if (theta >= 360.0) theta -= 360.0;
  return theta;
}

// ─── X anomaly terms ─────────────────────────────────────────────────────────

double _meanElongationMoonSun(double jce) =>
    _thirdOrderPolynomial(1.0 / 189474.0, -0.0019142, 445267.11148, 297.85036, jce);
double _meanAnomalySun(double jce) =>
    _thirdOrderPolynomial(-1.0 / 300000.0, -0.0001603, 35999.05034, 357.52772, jce);
double _meanAnomalyMoon(double jce) =>
    _thirdOrderPolynomial(1.0 / 56250.0, 0.0086972, 477198.867398, 134.96298, jce);
double _argumentLatitudeMoon(double jce) =>
    _thirdOrderPolynomial(1.0 / 327270.0, -0.0036825, 483202.017538, 93.27191, jce);
double _ascendingLongitudeMoon(double jce) =>
    _thirdOrderPolynomial(1.0 / 450000.0, 0.0020708, -1934.136261, 125.04452, jce);

// ─── Nutation ────────────────────────────────────────────────────────────────

double _xyTermSummation(int i, List<double> x) {
  double sum = 0;
  for (int j = 0; j < 5; j++) {
    sum += x[j] * _yTerms[i][j];
  }
  return sum;
}

void _nutationLongitudeAndObliquity(double jce, List<double> x, _Spa spa) {
  double sumPsi = 0;
  double sumEpsilon = 0;
  for (int i = 0; i < 63; i++) {
    final xyTermSum = _deg2rad(_xyTermSummation(i, x));
    sumPsi += (_peTerms[i][0] + jce * _peTerms[i][1]) * sin(xyTermSum);
    sumEpsilon += (_peTerms[i][2] + jce * _peTerms[i][3]) * cos(xyTermSum);
  }
  spa.delPsi = sumPsi / 36000000.0;
  spa.delEpsilon = sumEpsilon / 36000000.0;
}

double _eclipticMeanObliquity(double jme) {
  final u = jme / 10.0;
  return 84381.448 +
      u * (-4680.93 +
          u * (-1.55 +
              u * (1999.25 +
                  u * (-51.38 +
                      u * (-249.67 +
                          u * (-39.05 +
                              u * (7.12 +
                                  u * (27.87 + u * (5.79 + u * 2.45)))))))));
}

// ─── Sidereal & apparent sun ─────────────────────────────────────────────────

double _greenwichMeanSiderealTime(double jd, double jc) {
  return _limitDegrees(280.46061837 +
      360.98564736629 * (jd - 2451545.0) +
      jc * jc * (0.000387933 - jc / 38710000.0));
}

double _sunMeanLongitude(double jme) {
  return _limitDegrees(280.4664567 +
      jme * (360007.6982779 +
          jme * (0.03032028 +
              jme * (1 / 49931.0 + jme * (-1 / 15300.0 + jme * (-1 / 2000000.0))))));
}

double _eot(double m, double alpha, double delPsi, double epsilon) {
  return _limitMinutes(
      4.0 * (m - 0.0057183 - alpha + delPsi * cos(_deg2rad(epsilon))));
}

// ─── RTS (Rise/Transit/Set) ──────────────────────────────────────────────────

double _approxSunTransitTime(double alphaZero, double longitude, double nu) {
  return (alphaZero - longitude - nu) / 360.0;
}

double _sunHourAngleAtRiseSet(
    double latitude, double deltaZero, double h0Prime) {
  double h0 = -99999;
  final latRad = _deg2rad(latitude);
  final deltaZeroRad = _deg2rad(deltaZero);
  final argument = (sin(_deg2rad(h0Prime)) -
          sin(latRad) * sin(deltaZeroRad)) /
      (cos(latRad) * cos(deltaZeroRad));
  if (argument.abs() <= 1) {
    h0 = _limitDegrees180(_rad2deg(acos(argument)));
  }
  return h0;
}

void _approxSunRiseAndSet(List<double> mRts, double h0) {
  final h0Dfrac = h0 / 360.0;
  mRts[1] = _limitZero2one(mRts[0] - h0Dfrac); // SUN_RISE
  mRts[2] = _limitZero2one(mRts[0] + h0Dfrac); // SUN_SET
  mRts[0] = _limitZero2one(mRts[0]);            // SUN_TRANSIT
}

double _rtsAlphaDeltaPrime(List<double> ad, double n) {
  double a = ad[1] - ad[0]; // JD_ZERO - JD_MINUS
  double b = ad[2] - ad[1]; // JD_PLUS - JD_ZERO
  if (a.abs() >= 2.0) a = _limitZero2one(a);
  if (b.abs() >= 2.0) b = _limitZero2one(b);
  return ad[1] + n * (a + b + (b - a) * n) / 2.0;
}

double _rtsSunAltitude(double latitude, double deltaPrime, double hPrime) {
  final latRad = _deg2rad(latitude);
  final deltaPrimeRad = _deg2rad(deltaPrime);
  return _rad2deg(asin(
    sin(latRad) * sin(deltaPrimeRad) +
        cos(latRad) * cos(deltaPrimeRad) * cos(_deg2rad(hPrime)),
  ));
}

double _sunRiseAndSet(List<double> mRts, List<double> hRts,
    List<double> deltaPrime, double latitude, List<double> hPrime,
    double h0Prime, int sun) {
  return mRts[sun] +
      (hRts[sun] - h0Prime) /
          (360.0 *
              cos(_deg2rad(deltaPrime[sun])) *
              cos(_deg2rad(latitude)) *
              sin(_deg2rad(hPrime[sun])));
}

double _dayfracToLocalHr(double dayfrac, double timezone) {
  return 24.0 * _limitZero2one(dayfrac + timezone / 24.0);
}

// ─── Core geocentric calculation ─────────────────────────────────────────────

void _calculateGeocentricSunRightAscensionAndDeclination(_Spa spa) {
  spa.jc = _julianCentury(spa.jd);
  spa.jde = _julianEphemerisDay(spa.jd, spa.deltaT);
  spa.jce = _julianEphemerisCentury(spa.jde);
  spa.jme = _julianEphemerisMillennium(spa.jce);

  spa.l = _earthHeliocentricLongitude(spa.jme);
  spa.b = _earthHeliocentricLatitude(spa.jme);
  spa.r = _earthRadiusVector(spa.jme);

  spa.theta = _geocentricLongitude(spa.l);
  spa.beta = -spa.b; // geocentric latitude

  final x = <double>[
    spa.x0 = _meanElongationMoonSun(spa.jce),
    spa.x1 = _meanAnomalySun(spa.jce),
    spa.x2 = _meanAnomalyMoon(spa.jce),
    spa.x3 = _argumentLatitudeMoon(spa.jce),
    spa.x4 = _ascendingLongitudeMoon(spa.jce),
  ];

  _nutationLongitudeAndObliquity(spa.jce, x, spa);

  spa.epsilon0 = _eclipticMeanObliquity(spa.jme);
  spa.epsilon = spa.delEpsilon + spa.epsilon0 / 3600.0;
  spa.delTau = -20.4898 / (3600.0 * spa.r);
  spa.lamda = spa.theta + spa.delPsi + spa.delTau;
  spa.nu0 = _greenwichMeanSiderealTime(spa.jd, spa.jc);
  spa.nu = spa.nu0 + spa.delPsi * cos(_deg2rad(spa.epsilon));
  spa.alpha = _geocentricRightAscension(spa.lamda, spa.epsilon, spa.beta);
  spa.delta = _geocentricDeclination(spa.beta, spa.epsilon, spa.lamda);
}

// ─── EOT + RTS ───────────────────────────────────────────────────────────────

void _calculateEotAndSunRiseTransitSet(_Spa spa) {
  final h0Prime = -1 * (_sunRadius + spa.atmosRefract);

  final sunRts = spa.clone();
  sunRts.hour = sunRts.minute = 0;
  sunRts.second = 0.0;
  sunRts.deltaUt1 = sunRts.timezone = 0.0;
  sunRts.jd = _julianDay(sunRts.year, sunRts.month, sunRts.day,
      sunRts.hour, sunRts.minute, sunRts.second, sunRts.deltaUt1, sunRts.timezone);

  final m = _sunMeanLongitude(spa.jme);
  spa.eot = _eot(m, spa.alpha, spa.delPsi, spa.epsilon);

  _calculateGeocentricSunRightAscensionAndDeclination(sunRts);
  final nu = sunRts.nu;
  sunRts.deltaT = 0;

  // Compute alpha and delta for JD-1, JD, JD+1
  // indices: [0]=JD_MINUS, [1]=JD_ZERO, [2]=JD_PLUS
  final alpha = List<double>.filled(3, 0);
  final delta = List<double>.filled(3, 0);
  sunRts.jd--;
  for (int i = 0; i < 3; i++) {
    _calculateGeocentricSunRightAscensionAndDeclination(sunRts);
    alpha[i] = sunRts.alpha;
    delta[i] = sunRts.delta;
    sunRts.jd++;
  }

  // mRts: [0]=transit, [1]=rise, [2]=set
  final mRts = List<double>.filled(3, 0);
  mRts[0] = _approxSunTransitTime(alpha[1], spa.longitude, nu);
  final h0 = _sunHourAngleAtRiseSet(spa.latitude, delta[1], h0Prime);

  if (h0 >= 0) {
    _approxSunRiseAndSet(mRts, h0);

    final nuRts = List<double>.filled(3, 0);
    final alphaPrime = List<double>.filled(3, 0);
    final deltaPrime = List<double>.filled(3, 0);
    final hPrime = List<double>.filled(3, 0);
    final hRts = List<double>.filled(3, 0);

    for (int i = 0; i < 3; i++) {
      nuRts[i] = nu + 360.985647 * mRts[i];
      final n = mRts[i] + spa.deltaT / 86400.0;
      alphaPrime[i] = _rtsAlphaDeltaPrime(alpha, n);
      deltaPrime[i] = _rtsAlphaDeltaPrime(delta, n);
      hPrime[i] = _limitDegrees180pm(nuRts[i] + spa.longitude - alphaPrime[i]);
      hRts[i] = _rtsSunAltitude(spa.latitude, deltaPrime[i], hPrime[i]);
    }

    spa.srha = hPrime[1]; // SUN_RISE
    spa.ssha = hPrime[2]; // SUN_SET
    spa.sta = hRts[0];   // SUN_TRANSIT

    spa.suntransit = _dayfracToLocalHr(
        mRts[0] - hPrime[0] / 360.0, spa.timezone);
    spa.sunrise = _dayfracToLocalHr(
        _sunRiseAndSet(mRts, hRts, deltaPrime, spa.latitude, hPrime, h0Prime, 1),
        spa.timezone);
    spa.sunset = _dayfracToLocalHr(
        _sunRiseAndSet(mRts, hRts, deltaPrime, spa.latitude, hPrime, h0Prime, 2),
        spa.timezone);
  } else {
    spa.srha = spa.ssha = spa.sta = spa.suntransit = spa.sunrise = spa.sunset = -99999;
  }
}

// ─── Full SPA calculation ────────────────────────────────────────────────────

int _spaCalculate(_Spa spa) {
  // Validate inputs
  if (spa.year < -2000 || spa.year > 6000) return 1;
  if (spa.month < 1 || spa.month > 12) return 2;
  if (spa.day < 1 || spa.day > 31) return 3;
  if (spa.hour < 0 || spa.hour > 24) return 4;
  if (spa.minute < 0 || spa.minute > 59) return 5;
  if (spa.second < 0 || spa.second >= 60) return 6;
  if (spa.pressure < 0 || spa.pressure > 5000) return 12;
  if (spa.temperature <= -273 || spa.temperature > 6000) return 13;
  if (spa.deltaUt1 <= -1 || spa.deltaUt1 >= 1) return 17;
  if (spa.hour == 24 && spa.minute > 0) return 5;
  if (spa.hour == 24 && spa.second > 0) return 6;
  if (spa.deltaT.abs() > 8000) return 7;
  if (spa.timezone.abs() > 18) return 8;
  if (spa.longitude.abs() > 180) return 9;
  if (spa.latitude.abs() > 90) return 10;
  if (spa.atmosRefract.abs() > 5) return 16;
  if (spa.elevation < -6500000) return 11;

  spa.jd = _julianDay(spa.year, spa.month, spa.day, spa.hour, spa.minute,
      spa.second, spa.deltaUt1, spa.timezone);

  _calculateGeocentricSunRightAscensionAndDeclination(spa);

  spa.h = _observerHourAngle(spa.nu, spa.longitude, spa.alpha);
  spa.xi = 8.794 / (3600.0 * spa.r); // sun equatorial horizontal parallax

  final dltap = [spa.delAlpha, spa.deltaPrime];
  _rightAscensionParallaxAndTopocentricDec(
      spa.latitude, spa.elevation, spa.xi, spa.h, spa.delta, dltap);
  spa.delAlpha = dltap[0];
  spa.deltaPrime = dltap[1];

  spa.alphaPrime = spa.alpha + spa.delAlpha;
  spa.hPrime = spa.h - spa.delAlpha;

  spa.e0 = _topocentricElevationAngle(spa.latitude, spa.deltaPrime, spa.hPrime);
  spa.delE = _atmosphericRefractionCorrection(
      spa.pressure, spa.temperature, spa.atmosRefract, spa.e0);
  spa.e = spa.e0 + spa.delE;

  spa.zenith = 90.0 - spa.e;
  spa.azimuthAstro =
      _topocentricAzimuthAngleAstro(spa.hPrime, spa.latitude, spa.deltaPrime);
  spa.azimuth = _limitDegrees(spa.azimuthAstro + 180.0);

  if (spa.function == 1 || spa.function == 3) {
    // SPA_ZA_INC or SPA_ALL: compute surface incidence
    spa.incidence = _surfaceIncidenceAngle(
        spa.zenith, spa.azimuthAstro, spa.azmRotation, spa.slope);
  }

  if (spa.function == _sPaZaRts || spa.function == _sPaAll) {
    _calculateEotAndSunRiseTransitSet(spa);
  }

  return 0;
}

// ─── Custom angle adjustment ─────────────────────────────────────────────────

SpaAnglesResult _adjustForCustomAngle(_Spa base, double zenithAngle) {
  final phi = base.latitude * pi / 180;
  final delta = base.delta * pi / 180;
  final z = zenithAngle * pi / 180;
  final cosH0 =
      (cos(z) - sin(phi) * sin(delta)) / (cos(phi) * cos(delta));
  if (cosH0 < -1 || cosH0 > 1) {
    return SpaAnglesResult(sunrise: double.nan, sunset: double.nan);
  }
  final h0h = acos(cosH0) * 180 / pi / 15;
  return SpaAnglesResult(
    sunrise: base.suntransit - h0h,
    sunset: base.suntransit + h0h,
  );
}

// ─── Public API ──────────────────────────────────────────────────────────────

/// Compute solar position for the given parameters.
///
/// [date] is used in UTC components.
/// [latitude] is in degrees (−90 to 90, south = negative).
/// [longitude] is in degrees (−180 to 180, west = negative).
/// [timezone] is hours from UTC (e.g., −5 for EST).
/// [customAngles] are zenith angles in degrees for which rise/set times
/// should be calculated (e.g., [96, 102] for civil/nautical twilight).
SpaResult getSpa(
  DateTime date,
  double latitude,
  double longitude,
  double timezone, {
  double elevation = 0,
  double pressure = 1013,
  double temperature = 15,
  double deltaUt1 = 0,
  double deltaT = 67,
  double slope = 0,
  double azmRotation = 0,
  double atmosRefract = 0.5667,
  List<double> customAngles = const [],
}) {
  final d = _Spa();
  d.year = date.toUtc().year;
  d.month = date.toUtc().month;
  d.day = date.toUtc().day;
  d.hour = date.toUtc().hour;
  d.minute = date.toUtc().minute;
  d.second = date.toUtc().second.toDouble();
  d.longitude = longitude;
  d.latitude = latitude;
  d.timezone = timezone;
  d.elevation = elevation;
  d.pressure = pressure;
  d.temperature = temperature;
  d.deltaUt1 = deltaUt1;
  d.deltaT = deltaT;
  d.slope = slope;
  d.azmRotation = azmRotation;
  d.atmosRefract = atmosRefract;
  d.function = _sPaZaRts;

  final rc = _spaCalculate(d);
  if (rc != 0) {
    throw ArgumentError('SPA calculation failed (error code $rc)');
  }

  final angleResults = customAngles
      .map((z) => _adjustForCustomAngle(d, z))
      .toList(growable: false);

  return SpaResult(
    zenith: d.zenith,
    azimuth: d.azimuth,
    sunrise: d.sunrise,
    solarNoon: d.suntransit,
    sunset: d.sunset,
    angles: angleResults,
  );
}
