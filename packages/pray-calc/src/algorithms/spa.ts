/**
 * NREL Solar Position Algorithm (SPA) — TypeScript port.
 *
 * Purpose: Compute solar zenith/azimuth, sunrise/transit/sunset, plus
 *          custom-zenith rise/set events (used for Fajr/Isha).
 * Inputs: Date, lat/lng/tz, elevation, pressure, temperature, customAngles[].
 * Outputs: SpaResult { zenith, azimuth, sunrise, solarNoon, sunset, angles[] }
 * Constraints: Zero dependencies; direct port of spa.dart (which follows nrel-spa JS v2.0.1).
 * Accuracy: ±0.0003° for solar zenith angle.
 *
 * Reference: Reda, I. and Andreas, A. (2004). Solar Position Algorithm for
 * Solar Radiation Applications. NREL/TP-560-34302.
 */

import type { SpaResult, SpaAnglesResult } from "../types/index.js";

// ─── Constants ───────────────────────────────────────────────────────────────

const SPA_ZA_RTS = 2;
const SUN_RADIUS = 0.26667;

// ─── Periodic Term Tables ─────────────────────────────────────────────────────
// Each row: [A, B, C] — A = amplitude, B = phase, C = frequency

const L_TERMS: ReadonlyArray<ReadonlyArray<readonly [number, number, number]>> = [
  // L0 — 64 terms
  [
    [175347046, 0, 0],
    [3341656, 4.6692568, 6283.07585],
    [34894, 4.6261, 12566.1517],
    [3497, 2.7441, 5753.3849],
    [3418, 2.8289, 3.5231],
    [3136, 3.6277, 77713.7715],
    [2676, 4.4181, 7860.4194],
    [2343, 6.1352, 3930.2097],
    [1324, 0.7425, 11506.7698],
    [1273, 2.0371, 529.691],
    [1199, 1.1096, 1577.3435],
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
    [628331966747, 0, 0],
    [206059, 2.678235, 6283.07585],
    [4303, 2.6351, 12566.1517],
    [425, 1.59, 3.523],
    [119, 5.796, 26.298],
    [109, 2.966, 1577.344],
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
    [52919, 0, 0],
    [8720, 1.0721, 6283.0758],
    [309, 0.867, 12566.152],
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
    [289, 5.844, 6283.076],
    [35, 0, 0],
    [17, 5.49, 12566.15],
    [3, 5.2, 155.42],
    [1, 4.72, 3.52],
    [1, 5.3, 18849.23],
    [1, 5.97, 242.73],
  ],
  // L4 — 3 terms
  [
    [114, 3.142, 0],
    [8, 4.13, 6283.08],
    [1, 3.84, 12566.15],
  ],
  // L5 — 1 term
  [
    [1, 3.14, 0],
  ],
];

const B_TERMS: ReadonlyArray<ReadonlyArray<readonly [number, number, number]>> = [
  // B0 — 5 terms
  [
    [280, 3.199, 84334.662],
    [102, 5.422, 5507.553],
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

const R_TERMS: ReadonlyArray<ReadonlyArray<readonly [number, number, number]>> = [
  // R0 — 40 terms
  [
    [100013989, 0, 0],
    [1670700, 3.0984635, 6283.07585],
    [13956, 3.05525, 12566.1517],
    [3084, 5.1985, 77713.7715],
    [1628, 1.1739, 5753.3849],
    [1576, 2.8469, 7860.4194],
    [925, 5.453, 11506.77],
    [542, 4.564, 3930.21],
    [472, 3.661, 5884.927],
    [346, 0.964, 5507.553],
    [329, 5.9, 5223.694],
    [307, 0.299, 5573.143],
    [243, 4.273, 11790.629],
    [212, 5.847, 1577.344],
    [186, 5.022, 10977.079],
    [175, 3.012, 18849.228],
    [110, 5.055, 5486.778],
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
    [103019, 1.10749, 6283.07585],
    [1721, 1.0644, 12566.1517],
    [702, 3.142, 0],
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
    [4359, 5.7846, 6283.0758],
    [124, 5.579, 12566.152],
    [12, 3.14, 0],
    [9, 3.63, 77713.77],
    [6, 1.87, 5573.14],
    [3, 5.47, 18849.23],
  ],
  // R3 — 2 terms
  [
    [145, 4.273, 6283.076],
    [7, 3.92, 12566.15],
  ],
  // R4 — 1 term
  [
    [4, 2.56, 6283.08],
  ],
];

const L_SUBCOUNT = [64, 34, 20, 7, 3, 1];
const B_SUBCOUNT = [5, 2];
const R_SUBCOUNT = [40, 10, 6, 2, 1];

// Periodic terms for nutation in longitude and obliquity
const Y_TERMS: ReadonlyArray<readonly [number, number, number, number, number]> = [
  [0, 0, 0, 0, 1], [-2, 0, 0, 2, 2], [0, 0, 0, 2, 2], [0, 0, 0, 0, 2],
  [0, 1, 0, 0, 0], [0, 0, 1, 0, 0], [-2, 1, 0, 2, 2], [0, 0, 0, 2, 1],
  [0, 0, 1, 2, 2], [-2, -1, 0, 2, 2], [-2, 0, 1, 0, 0], [-2, 0, 0, 2, 1],
  [0, 0, -1, 2, 2], [2, 0, 0, 0, 0], [0, 0, 1, 0, 1], [2, 0, -1, 2, 2],
  [0, 0, -1, 0, 1], [0, 0, 1, 2, 1], [-2, 0, 2, 0, 0], [0, 0, -2, 2, 1],
  [2, 0, 0, 2, 2], [0, 0, 2, 2, 2], [0, 0, 2, 0, 0], [-2, 0, 1, 2, 2],
  [0, 0, 0, 2, 0], [-2, 0, 0, 2, 0], [0, 0, -1, 2, 1], [0, 2, 0, 0, 0],
  [2, 0, -1, 0, 1], [-2, 2, 0, 2, 2], [0, 1, 0, 0, 1], [-2, 0, 1, 0, 1],
  [0, -1, 0, 0, 1], [0, 0, 2, -2, 0], [2, 0, -1, 2, 1], [2, 0, 1, 2, 2],
  [0, 1, 0, 2, 2], [-2, 1, 1, 0, 0], [0, -1, 0, 2, 2], [2, 0, 0, 2, 1],
  [2, 0, 1, 0, 0], [-2, 0, 2, 2, 2], [-2, 0, 1, 2, 1], [2, 0, -2, 0, 1],
  [2, 0, 0, 0, 1], [0, -1, 1, 0, 0], [-2, -1, 0, 2, 1], [-2, 0, 0, 0, 1],
  [0, 0, 2, 2, 1], [-2, 0, 2, 0, 1], [-2, 1, 0, 2, 1], [0, 0, 1, -2, 0],
  [-1, 0, 1, 0, 0], [-2, 1, 0, 0, 0], [1, 0, 0, 0, 0], [0, 0, 1, 2, 0],
  [0, 0, -2, 2, 2], [-1, -1, 1, 0, 0], [0, 1, 1, 0, 0], [0, -1, 1, 2, 2],
  [2, -1, -1, 2, 2], [0, 0, 3, 2, 2], [2, -1, 0, 2, 2],
];

// Nutation coefficients [psiA, psiB, epsC, epsD]
const PE_TERMS: ReadonlyArray<readonly [number, number, number, number]> = [
  [-171996, -174.2, 92025, 8.9], [-13187, -1.6, 5736, -3.1],
  [-2274, -0.2, 977, -0.5], [2062, 0.2, -895, 0.5],
  [1426, -3.4, 54, -0.1], [712, 0.1, -7, 0],
  [-517, 1.2, 224, -0.6], [-386, -0.4, 200, 0],
  [-301, 0, 129, -0.1], [217, -0.5, -95, 0.3],
  [-158, 0, 0, 0], [129, 0.1, -70, 0],
  [123, 0, -53, 0], [63, 0, 0, 0],
  [63, 0.1, -33, 0], [-59, 0, 26, 0],
  [-58, -0.1, 32, 0], [-51, 0, 27, 0],
  [48, 0, 0, 0], [46, 0, -24, 0],
  [-38, 0, 16, 0], [-31, 0, 13, 0],
  [29, 0, 0, 0], [29, 0, -12, 0],
  [26, 0, 0, 0], [-22, 0, 0, 0],
  [21, 0, -10, 0], [17, -0.1, 0, 0],
  [16, 0, -8, 0], [-16, 0.1, 7, 0],
  [-15, 0, 9, 0], [-13, 0, 7, 0],
  [-12, 0, 6, 0], [11, 0, 0, 0],
  [-10, 0, 5, 0], [-8, 0, 3, 0],
  [7, 0, -3, 0], [-7, 0, 0, 0],
  [-7, 0, 3, 0], [-7, 0, 3, 0],
  [6, 0, 0, 0], [6, 0, -3, 0],
  [6, 0, -3, 0], [-6, 0, 3, 0],
  [-6, 0, 3, 0], [5, 0, 0, 0],
  [-5, 0, 3, 0], [-5, 0, 3, 0],
  [-5, 0, 3, 0], [4, 0, 0, 0],
  [4, 0, 0, 0], [4, 0, 0, 0],
  [-4, 0, 0, 0], [-4, 0, 0, 0],
  [-4, 0, 0, 0], [3, 0, 0, 0],
  [-3, 0, 0, 0], [-3, 0, 0, 0],
  [-3, 0, 0, 0], [-3, 0, 0, 0],
  [-3, 0, 0, 0], [-3, 0, 0, 0],
  [-3, 0, 0, 0],
];

// ─── Internal state ───────────────────────────────────────────────────────────

interface SpaState {
  year: number; month: number; day: number;
  hour: number; minute: number; second: number;
  deltaUt1: number; deltaT: number; timezone: number;
  longitude: number; latitude: number; elevation: number;
  pressure: number; temperature: number;
  slope: number; azmRotation: number; atmosRefract: number;
  fn: number;
  // intermediate
  jd: number; jc: number; jde: number; jce: number; jme: number;
  l: number; b: number; r: number; theta: number; beta: number;
  x0: number; x1: number; x2: number; x3: number; x4: number;
  delPsi: number; delEpsilon: number; epsilon0: number; epsilon: number;
  delTau: number; lamda: number; nu0: number; nu: number;
  alpha: number; delta: number; h: number; xi: number;
  delAlpha: number; deltaPrime: number; alphaPrime: number; hPrime: number;
  e0: number; delE: number; e: number;
  eot: number; srha: number; ssha: number; sta: number;
  // outputs
  zenith: number; azimuthAstro: number; azimuth: number; incidence: number;
  suntransit: number; sunrise: number; sunset: number;
}

function newState(): SpaState {
  return {
    year: 0, month: 0, day: 0, hour: 0, minute: 0, second: 0,
    deltaUt1: 0, deltaT: 0, timezone: 0, longitude: 0, latitude: 0,
    elevation: 0, pressure: 0, temperature: 0, slope: 0, azmRotation: 0,
    atmosRefract: 0, fn: 0,
    jd: 0, jc: 0, jde: 0, jce: 0, jme: 0, l: 0, b: 0, r: 0,
    theta: 0, beta: 0, x0: 0, x1: 0, x2: 0, x3: 0, x4: 0,
    delPsi: 0, delEpsilon: 0, epsilon0: 0, epsilon: 0, delTau: 0,
    lamda: 0, nu0: 0, nu: 0, alpha: 0, delta: 0, h: 0, xi: 0,
    delAlpha: 0, deltaPrime: 0, alphaPrime: 0, hPrime: 0,
    e0: 0, delE: 0, e: 0, eot: 0, srha: 0, ssha: 0, sta: 0,
    zenith: 0, azimuthAstro: 0, azimuth: 0, incidence: 0,
    suntransit: 0, sunrise: 0, sunset: 0,
  };
}

function cloneState(s: SpaState): SpaState {
  return { ...s };
}

// ─── Math utilities ────────────────────────────────────────────────────────────

function deg2rad(d: number): number { return (Math.PI / 180) * d; }
function rad2deg(r: number): number { return (180 / Math.PI) * r; }

function limitDegrees(deg: number): number {
  deg /= 360;
  let limited = 360 * (deg - Math.floor(deg));
  if (limited < 0) limited += 360;
  return limited;
}

function thirdOrderPolynomial(a: number, b: number, c: number, d: number, x: number): number {
  return ((a * x + b) + c) * x + d;
}

function limitDegrees180pm(deg: number): number {
  deg /= 360;
  let limited = 360 * (deg - Math.floor(deg));
  if (limited < -180) limited += 360;
  else if (limited > 180) limited -= 360;
  return limited;
}

function limitDegrees180(deg: number): number {
  deg /= 180;
  let limited = 180 * (deg - Math.floor(deg));
  if (limited < 0) limited += 180;
  return limited;
}

function limitZero2one(v: number): number {
  let limited = v - Math.floor(v);
  if (limited < 0) limited += 1;
  return limited;
}

function limitMinutes(min: number): number {
  let limited = min;
  if (limited < -20) limited += 1440;
  else if (limited > 20) limited -= 1440;
  return limited;
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

// ─── Geometric functions ──────────────────────────────────────────────────────

function geocentricRightAscension(lamda: number, epsilon: number, beta: number): number {
  const lambdaRad = deg2rad(lamda);
  const epsilonRad = deg2rad(epsilon);
  return limitDegrees(rad2deg(Math.atan2(
    Math.sin(lambdaRad) * Math.cos(epsilonRad) - Math.tan(deg2rad(beta)) * Math.sin(epsilonRad),
    Math.cos(lambdaRad),
  )));
}

function geocentricDeclination(beta: number, epsilon: number, lamda: number): number {
  const betaRad = deg2rad(beta);
  const epsilonRad = deg2rad(epsilon);
  return rad2deg(Math.asin(
    Math.sin(betaRad) * Math.cos(epsilonRad) +
    Math.cos(betaRad) * Math.sin(epsilonRad) * Math.sin(deg2rad(lamda)),
  ));
}

function observerHourAngle(nu: number, longitude: number, alphaDeg: number): number {
  return limitDegrees(nu + longitude - alphaDeg);
}

function rightAscensionParallaxAndTopocentricDec(
  latitude: number, elevation: number, xi: number,
  h: number, delta: number,
  out: { deltaAlpha: number; deltaPrime: number },
): void {
  const latRad = deg2rad(latitude);
  const xiRad = deg2rad(xi);
  const hRad = deg2rad(h);
  const deltaRad = deg2rad(delta);
  const u = Math.atan(0.99664719 * Math.tan(latRad));
  const y = 0.99664719 * Math.sin(u) + elevation * Math.sin(latRad) / 6378140;
  const x = Math.cos(u) + elevation * Math.cos(latRad) / 6378140;
  const deltaAlphaRad = Math.atan2(
    -x * Math.sin(xiRad) * Math.sin(hRad),
    Math.cos(deltaRad) - x * Math.sin(xiRad) * Math.cos(hRad),
  );
  out.deltaPrime = rad2deg(Math.atan2(
    (Math.sin(deltaRad) - y * Math.sin(xiRad)) * Math.cos(deltaAlphaRad),
    Math.cos(deltaRad) - x * Math.sin(xiRad) * Math.cos(hRad),
  ));
  out.deltaAlpha = rad2deg(deltaAlphaRad);
}

function topocentricElevationAngle(latitude: number, deltaPrime: number, hPrime: number): number {
  const latRad = deg2rad(latitude);
  const deltaPrimeRad = deg2rad(deltaPrime);
  return rad2deg(Math.asin(
    Math.sin(latRad) * Math.sin(deltaPrimeRad) +
    Math.cos(latRad) * Math.cos(deltaPrimeRad) * Math.cos(deg2rad(hPrime)),
  ));
}

function atmosphericRefractionCorrection(
  pressure: number, temperature: number, atmosRefract: number, e0: number,
): number {
  let delE = 0;
  if (e0 >= -1 * (SUN_RADIUS + atmosRefract)) {
    delE = (pressure / 1010) * (283 / (273 + temperature)) *
      1.02 / (60 * Math.tan(deg2rad(e0 + 10.3 / (e0 + 5.11))));
  }
  return delE;
}

function topocentricAzimuthAngleAstro(hPrime: number, latitude: number, deltaPrime: number): number {
  const hPrimeRad = deg2rad(hPrime);
  const latRad = deg2rad(latitude);
  return limitDegrees(rad2deg(Math.atan2(
    Math.sin(hPrimeRad),
    Math.cos(hPrimeRad) * Math.sin(latRad) - Math.tan(deg2rad(deltaPrime)) * Math.cos(latRad),
  )));
}

// ─── Julian / time functions ──────────────────────────────────────────────────

function julianDay(
  year: number, month: number, day: number,
  hour: number, minute: number, second: number,
  dut1: number, tz: number,
): number {
  const dayDecimal = day + (hour - tz + (minute + (second + dut1) / 60) / 60) / 24;
  let y = year, m = month;
  if (m < 3) { m += 12; y--; }
  let jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + dayDecimal - 1524.5;
  if (jd > 2299160) {
    const a = Math.floor(y / 100);
    jd += 2 - a + Math.floor(a / 4);
  }
  return jd;
}

function julianCentury(jd: number): number { return (jd - 2451545) / 36525; }
function julianEphemerisDay(jd: number, deltaT: number): number { return jd + deltaT / 86400; }
function julianEphemerisCentury(jde: number): number { return (jde - 2451545) / 36525; }
function julianEphemerisMillennium(jce: number): number { return jce / 10; }

// ─── Periodic term summation ─────────────────────────────────────────────────

function earthPeriodicTermSummation(
  terms: ReadonlyArray<readonly [number, number, number]>,
  count: number,
  jme: number,
): number {
  let sum = 0;
  for (let i = 0; i < count; i++) {
    sum += terms[i][0] * Math.cos(terms[i][1] + terms[i][2] * jme);
  }
  return sum;
}

function earthValues(termSum: number[], count: number, jme: number): number {
  let sum = 0;
  for (let i = 0; i < count; i++) {
    sum += termSum[i] * Math.pow(jme, i);
  }
  return sum / 1e8;
}

function earthHeliocentricLongitude(jme: number): number {
  const sum: number[] = [];
  for (let i = 0; i < 6; i++) {
    sum.push(earthPeriodicTermSummation(L_TERMS[i], L_SUBCOUNT[i], jme));
  }
  return limitDegrees(rad2deg(earthValues(sum, 6, jme)));
}

function earthHeliocentricLatitude(jme: number): number {
  const sum: number[] = [];
  for (let i = 0; i < 2; i++) {
    sum.push(earthPeriodicTermSummation(B_TERMS[i], B_SUBCOUNT[i], jme));
  }
  return rad2deg(earthValues(sum, 2, jme));
}

function earthRadiusVector(jme: number): number {
  const sum: number[] = [];
  for (let i = 0; i < 5; i++) {
    sum.push(earthPeriodicTermSummation(R_TERMS[i], R_SUBCOUNT[i], jme));
  }
  return earthValues(sum, 5, jme);
}

function geocentricLongitude(l: number): number {
  let theta = l + 180;
  if (theta >= 360) theta -= 360;
  return theta;
}

// ─── X anomaly terms ─────────────────────────────────────────────────────────

function meanElongationMoonSun(jce: number): number {
  return thirdOrderPolynomial(1 / 189474, -0.0019142, 445267.11148, 297.85036, jce);
}
function meanAnomalySun(jce: number): number {
  return thirdOrderPolynomial(-1 / 300000, -0.0001603, 35999.05034, 357.52772, jce);
}
function meanAnomalyMoon(jce: number): number {
  return thirdOrderPolynomial(1 / 56250, 0.0086972, 477198.867398, 134.96298, jce);
}
function argumentLatitudeMoon(jce: number): number {
  return thirdOrderPolynomial(1 / 327270, -0.0036825, 483202.017538, 93.27191, jce);
}
function ascendingLongitudeMoon(jce: number): number {
  return thirdOrderPolynomial(1 / 450000, 0.0020708, -1934.136261, 125.04452, jce);
}

// ─── Nutation ─────────────────────────────────────────────────────────────────

function xyTermSummation(i: number, x: number[]): number {
  let sum = 0;
  for (let j = 0; j < 5; j++) sum += x[j] * Y_TERMS[i][j];
  return sum;
}

function nutationLongitudeAndObliquity(jce: number, x: number[], spa: SpaState): void {
  let sumPsi = 0, sumEpsilon = 0;
  for (let i = 0; i < 63; i++) {
    const xyTermSum = deg2rad(xyTermSummation(i, x));
    sumPsi += (PE_TERMS[i][0] + jce * PE_TERMS[i][1]) * Math.sin(xyTermSum);
    sumEpsilon += (PE_TERMS[i][2] + jce * PE_TERMS[i][3]) * Math.cos(xyTermSum);
  }
  spa.delPsi = sumPsi / 36_000_000;
  spa.delEpsilon = sumEpsilon / 36_000_000;
}

function eclipticMeanObliquity(jme: number): number {
  const u = jme / 10;
  return 84381.448 + u * (-4680.93 + u * (-1.55 + u * (1999.25 + u * (-51.38 +
    u * (-249.67 + u * (-39.05 + u * (7.12 + u * (27.87 + u * (5.79 + u * 2.45)))))))));
}

// ─── Sidereal & apparent sun ──────────────────────────────────────────────────

function greenwichMeanSiderealTime(jd: number, jc: number): number {
  return limitDegrees(
    280.46061837 + 360.98564736629 * (jd - 2451545) + jc * jc * (0.000387933 - jc / 38710000),
  );
}

function sunMeanLongitude(jme: number): number {
  return limitDegrees(280.4664567 + jme * (360007.6982779 + jme * (0.03032028 +
    jme * (1 / 49931 + jme * (-1 / 15300 + jme * (-1 / 2000000))))));
}

function eot(m: number, alpha: number, delPsi: number, epsilon: number): number {
  return limitMinutes(4 * (m - 0.0057183 - alpha + delPsi * Math.cos(deg2rad(epsilon))));
}

// ─── RTS ─────────────────────────────────────────────────────────────────────

function approxSunTransitTime(alphaZero: number, longitude: number, nu: number): number {
  return (alphaZero - longitude - nu) / 360;
}

function sunHourAngleAtRiseSet(latitude: number, deltaZero: number, h0Prime: number): number {
  const latRad = deg2rad(latitude);
  const deltaZeroRad = deg2rad(deltaZero);
  const argument =
    (Math.sin(deg2rad(h0Prime)) - Math.sin(latRad) * Math.sin(deltaZeroRad)) /
    (Math.cos(latRad) * Math.cos(deltaZeroRad));
  if (Math.abs(argument) <= 1) {
    return limitDegrees180(rad2deg(Math.acos(argument)));
  }
  return -99999;
}

function approxSunRiseAndSet(mRts: number[], h0: number): void {
  const h0Dfrac = h0 / 360;
  mRts[1] = limitZero2one(mRts[0] - h0Dfrac); // rise
  mRts[2] = limitZero2one(mRts[0] + h0Dfrac); // set
  mRts[0] = limitZero2one(mRts[0]);            // transit
}

function rtsAlphaDeltaPrime(ad: number[], n: number): number {
  let a = ad[1] - ad[0];
  let b = ad[2] - ad[1];
  if (Math.abs(a) >= 2) a = limitZero2one(a);
  if (Math.abs(b) >= 2) b = limitZero2one(b);
  return ad[1] + n * (a + b + (b - a) * n) / 2;
}

function rtsSunAltitude(latitude: number, deltaPrime: number, hPrime: number): number {
  const latRad = deg2rad(latitude);
  const deltaPrimeRad = deg2rad(deltaPrime);
  return rad2deg(Math.asin(
    Math.sin(latRad) * Math.sin(deltaPrimeRad) +
    Math.cos(latRad) * Math.cos(deltaPrimeRad) * Math.cos(deg2rad(hPrime)),
  ));
}

function sunRiseAndSet(
  mRts: number[], hRts: number[], deltaPrime: number[],
  latitude: number, hPrime: number[], h0Prime: number, sun: number,
): number {
  return mRts[sun] +
    (hRts[sun] - h0Prime) /
    (360 * Math.cos(deg2rad(deltaPrime[sun])) * Math.cos(deg2rad(latitude)) * Math.sin(deg2rad(hPrime[sun])));
}

function dayfracToLocalHr(dayfrac: number, timezone: number): number {
  return 24 * limitZero2one(dayfrac + timezone / 24);
}

// ─── Core geocentric calculation ──────────────────────────────────────────────

function calculateGeocentricSunRightAscensionAndDeclination(spa: SpaState): void {
  spa.jc = julianCentury(spa.jd);
  spa.jde = julianEphemerisDay(spa.jd, spa.deltaT);
  spa.jce = julianEphemerisCentury(spa.jde);
  spa.jme = julianEphemerisMillennium(spa.jce);

  spa.l = earthHeliocentricLongitude(spa.jme);
  spa.b = earthHeliocentricLatitude(spa.jme);
  spa.r = earthRadiusVector(spa.jme);

  spa.theta = geocentricLongitude(spa.l);
  spa.beta = -spa.b;

  const x = [
    spa.x0 = meanElongationMoonSun(spa.jce),
    spa.x1 = meanAnomalySun(spa.jce),
    spa.x2 = meanAnomalyMoon(spa.jce),
    spa.x3 = argumentLatitudeMoon(spa.jce),
    spa.x4 = ascendingLongitudeMoon(spa.jce),
  ];

  nutationLongitudeAndObliquity(spa.jce, x, spa);

  spa.epsilon0 = eclipticMeanObliquity(spa.jme);
  spa.epsilon = spa.delEpsilon + spa.epsilon0 / 3600;
  spa.delTau = -20.4898 / (3600 * spa.r);
  spa.lamda = spa.theta + spa.delPsi + spa.delTau;
  spa.nu0 = greenwichMeanSiderealTime(spa.jd, spa.jc);
  spa.nu = spa.nu0 + spa.delPsi * Math.cos(deg2rad(spa.epsilon));
  spa.alpha = geocentricRightAscension(spa.lamda, spa.epsilon, spa.beta);
  spa.delta = geocentricDeclination(spa.beta, spa.epsilon, spa.lamda);
}

// ─── EOT + RTS ────────────────────────────────────────────────────────────────

function calculateEotAndSunRiseTransitSet(spa: SpaState): void {
  const h0Prime = -1 * (SUN_RADIUS + spa.atmosRefract);
  const sunRts = cloneState(spa);
  sunRts.hour = sunRts.minute = 0;
  sunRts.second = 0;
  sunRts.deltaUt1 = sunRts.timezone = 0;
  sunRts.jd = julianDay(
    sunRts.year, sunRts.month, sunRts.day,
    sunRts.hour, sunRts.minute, sunRts.second,
    sunRts.deltaUt1, sunRts.timezone,
  );

  const m = sunMeanLongitude(spa.jme);
  spa.eot = eot(m, spa.alpha, spa.delPsi, spa.epsilon);

  calculateGeocentricSunRightAscensionAndDeclination(sunRts);
  const nu = sunRts.nu;
  sunRts.deltaT = 0;

  const alpha: number[] = [0, 0, 0];
  const delta: number[] = [0, 0, 0];
  sunRts.jd--;
  for (let i = 0; i < 3; i++) {
    calculateGeocentricSunRightAscensionAndDeclination(sunRts);
    alpha[i] = sunRts.alpha;
    delta[i] = sunRts.delta;
    sunRts.jd++;
  }

  const mRts: number[] = [0, 0, 0];
  mRts[0] = approxSunTransitTime(alpha[1], spa.longitude, nu);
  const h0 = sunHourAngleAtRiseSet(spa.latitude, delta[1], h0Prime);

  if (h0 >= 0) {
    approxSunRiseAndSet(mRts, h0);

    const nuRts: number[] = [0, 0, 0];
    const alphaPrime: number[] = [0, 0, 0];
    const deltaPrime: number[] = [0, 0, 0];
    const hPrime: number[] = [0, 0, 0];
    const hRts: number[] = [0, 0, 0];

    for (let i = 0; i < 3; i++) {
      nuRts[i] = nu + 360.985647 * mRts[i];
      const n = mRts[i] + spa.deltaT / 86400;
      alphaPrime[i] = rtsAlphaDeltaPrime(alpha, n);
      deltaPrime[i] = rtsAlphaDeltaPrime(delta, n);
      hPrime[i] = limitDegrees180pm(nuRts[i] + spa.longitude - alphaPrime[i]);
      hRts[i] = rtsSunAltitude(spa.latitude, deltaPrime[i], hPrime[i]);
    }

    spa.srha = hPrime[1];
    spa.ssha = hPrime[2];
    spa.sta = hRts[0];

    spa.suntransit = dayfracToLocalHr(mRts[0] - hPrime[0] / 360, spa.timezone);
    spa.sunrise = dayfracToLocalHr(
      sunRiseAndSet(mRts, hRts, deltaPrime, spa.latitude, hPrime, h0Prime, 1),
      spa.timezone,
    );
    spa.sunset = dayfracToLocalHr(
      sunRiseAndSet(mRts, hRts, deltaPrime, spa.latitude, hPrime, h0Prime, 2),
      spa.timezone,
    );
  } else {
    spa.srha = spa.ssha = spa.sta = spa.suntransit = spa.sunrise = spa.sunset = -99999;
  }
}

// ─── Full SPA calculation ─────────────────────────────────────────────────────

function spaCalculate(spa: SpaState): number {
  if (spa.year < -2000 || spa.year > 6000) return 1;
  if (spa.month < 1 || spa.month > 12) return 2;
  if (spa.day < 1 || spa.day > 31) return 3;
  if (spa.hour < 0 || spa.hour > 24) return 4;
  if (spa.minute < 0 || spa.minute > 59) return 5;
  if (spa.second < 0 || spa.second >= 60) return 6;
  if (spa.pressure < 0 || spa.pressure > 5000) return 12;
  if (spa.temperature <= -273 || spa.temperature > 6000) return 13;
  if (spa.deltaUt1 <= -1 || spa.deltaUt1 >= 1) return 17;
  if (spa.hour === 24 && spa.minute > 0) return 5;
  if (spa.hour === 24 && spa.second > 0) return 6;
  if (Math.abs(spa.deltaT) > 8000) return 7;
  if (Math.abs(spa.timezone) > 18) return 8;
  if (Math.abs(spa.longitude) > 180) return 9;
  if (Math.abs(spa.latitude) > 90) return 10;
  if (Math.abs(spa.atmosRefract) > 5) return 16;
  if (spa.elevation < -6500000) return 11;

  spa.jd = julianDay(
    spa.year, spa.month, spa.day, spa.hour, spa.minute, spa.second,
    spa.deltaUt1, spa.timezone,
  );

  calculateGeocentricSunRightAscensionAndDeclination(spa);

  spa.h = observerHourAngle(spa.nu, spa.longitude, spa.alpha);
  spa.xi = 8.794 / (3600 * spa.r);

  const out = { deltaAlpha: spa.delAlpha, deltaPrime: spa.deltaPrime };
  rightAscensionParallaxAndTopocentricDec(
    spa.latitude, spa.elevation, spa.xi, spa.h, spa.delta, out,
  );
  spa.delAlpha = out.deltaAlpha;
  spa.deltaPrime = out.deltaPrime;

  spa.alphaPrime = spa.alpha + spa.delAlpha;
  spa.hPrime = spa.h - spa.delAlpha;

  spa.e0 = topocentricElevationAngle(spa.latitude, spa.deltaPrime, spa.hPrime);
  spa.delE = atmosphericRefractionCorrection(
    spa.pressure, spa.temperature, spa.atmosRefract, spa.e0,
  );
  spa.e = spa.e0 + spa.delE;

  spa.zenith = 90 - spa.e;
  spa.azimuthAstro = topocentricAzimuthAngleAstro(spa.hPrime, spa.latitude, spa.deltaPrime);
  spa.azimuth = limitDegrees(spa.azimuthAstro + 180);

  if (spa.fn === SPA_ZA_RTS) {
    calculateEotAndSunRiseTransitSet(spa);
  }

  return 0;
}

// ─── Custom angle ─────────────────────────────────────────────────────────────

function adjustForCustomAngle(base: SpaState, zenithAngle: number): SpaAnglesResult {
  const phi = base.latitude * Math.PI / 180;
  const delta = base.delta * Math.PI / 180;
  const z = zenithAngle * Math.PI / 180;
  const cosH0 = (Math.cos(z) - Math.sin(phi) * Math.sin(delta)) / (Math.cos(phi) * Math.cos(delta));
  if (cosH0 < -1 || cosH0 > 1) return { sunrise: NaN, sunset: NaN };
  const h0h = Math.acos(cosH0) * 180 / Math.PI / 15;
  return {
    sunrise: base.suntransit - h0h,
    sunset: base.suntransit + h0h,
  };
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Compute solar position for the given parameters.
 *
 * @param date - Date in UTC (time-of-day matters for zenith; for RTS, only date is used).
 * @param latitude - Decimal degrees (−90 to 90, south = negative).
 * @param longitude - Decimal degrees (−180 to 180, west = negative).
 * @param timezone - Hours from UTC (e.g., −5 for EST).
 * @param customAngles - Zenith angles for which rise/set times are needed.
 */
export function getSpa(
  date: Date,
  latitude: number,
  longitude: number,
  timezone: number,
  options: {
    elevation?: number;
    pressure?: number;
    temperature?: number;
    deltaUt1?: number;
    deltaT?: number;
    slope?: number;
    azmRotation?: number;
    atmosRefract?: number;
    customAngles?: number[];
  } = {},
): SpaResult {
  const {
    elevation = 0,
    pressure = 1013,
    temperature = 15,
    deltaUt1 = 0,
    deltaT = 67,
    slope = 0,
    azmRotation = 0,
    atmosRefract = 0.5667,
    customAngles = [],
  } = options;

  const d = newState();
  const utc = new Date(date.toISOString());
  d.year = utc.getUTCFullYear();
  d.month = utc.getUTCMonth() + 1;
  d.day = utc.getUTCDate();
  d.hour = utc.getUTCHours();
  d.minute = utc.getUTCMinutes();
  d.second = utc.getUTCSeconds();
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
  d.fn = SPA_ZA_RTS;

  const rc = spaCalculate(d);
  if (rc !== 0) throw new Error(`SPA calculation failed (error code ${rc})`);

  const polar = d.sunrise === -99999;

  return {
    zenith: d.zenith,
    azimuth: d.azimuth,
    sunrise: polar ? NaN : d.sunrise,
    solarNoon: polar ? NaN : d.suntransit,
    sunset: polar ? NaN : d.sunset,
    angles: customAngles.map((z) => adjustForCustomAngle(d, z)),
  };
}
