// src/getTimes.ts
import { getSpa } from "nrel-spa";

// src/getSolarEphemeris.ts
var DEG = Math.PI / 180;
function toJulianDate(date) {
  return date.getTime() / 864e5 + 24405875e-1;
}
function solarEphemeris(jd) {
  const T = (jd - 2451545) / 36525;
  const L0 = ((280.46646 + 36000.76983 * T + 3032e-7 * T * T) % 360 + 360) % 360;
  const M = ((357.52911 + 35999.05029 * T - 1537e-7 * T * T) % 360 + 360) % 360;
  const Mrad = M * DEG;
  const e = 0.016708634 - 42037e-9 * T - 1267e-10 * T * T;
  const C = (1.914602 - 4817e-6 * T - 14e-6 * T * T) * Math.sin(Mrad) + (0.019993 - 101e-6 * T) * Math.sin(2 * Mrad) + 289e-6 * Math.sin(3 * Mrad);
  const sunLon = L0 + C;
  const nu = M + C;
  const nuRad = nu * DEG;
  const r = 1.000001018 * (1 - e * e) / (1 + e * Math.cos(nuRad));
  const Omega = ((125.04 - 1934.136 * T) % 360 + 360) % 360;
  const OmegaRad = Omega * DEG;
  const lambda = sunLon - 569e-5 - 478e-5 * Math.sin(OmegaRad);
  const lambdaRad = lambda * DEG;
  const epsilon0 = 23.439291 - 0.013004 * T - 1638e-10 * T * T + 5036e-10 * T * T * T;
  const epsilon = (epsilon0 + 256e-5 * Math.cos(OmegaRad)) * DEG;
  const sinDecl = Math.sin(epsilon) * Math.sin(lambdaRad);
  const decl = Math.asin(Math.max(-1, Math.min(1, sinDecl))) / DEG;
  const eclLon = (lambdaRad % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
  return { decl, r, eclLon };
}
function atmosphericRefraction(altitudeDeg, pressureMbar = 1013.25, temperatureC = 15) {
  if (altitudeDeg < -1) return 0;
  const R0 = 1.02 / Math.tan((altitudeDeg + 10.3 / (altitudeDeg + 5.11)) * DEG);
  const R = R0 * (pressureMbar / 1010) * (283 / (273 + temperatureC));
  return Math.max(0, R) / 60;
}

// src/getMSC.ts
function isLeapYear(year) {
  return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
}
function computeDyy(date, latitude) {
  const year = date.getFullYear();
  const daysInYear = isLeapYear(year) ? 366 : 365;
  const refMonth = latitude >= 0 ? 11 : 5;
  const refDay = 21;
  const zeroDate = new Date(year, refMonth, refDay);
  let diffDays = Math.floor(
    (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) - Date.UTC(zeroDate.getFullYear(), zeroDate.getMonth(), zeroDate.getDate())) / 864e5
  );
  if (diffDays < 0) diffDays += daysInYear;
  return { dyy: diffDays, daysInYear };
}
function interpolateSegment(dyy, daysInYear, a, b, c, d) {
  if (dyy < 91) {
    return a + (b - a) / 91 * dyy;
  } else if (dyy < 137) {
    return b + (c - b) / 46 * (dyy - 91);
  } else if (dyy < 183) {
    return c + (d - c) / 46 * (dyy - 137);
  } else if (dyy < 229) {
    return d + (c - d) / 46 * (dyy - 183);
  } else if (dyy < 275) {
    return c + (b - c) / 46 * (dyy - 229);
  } else {
    const len = daysInYear - 275;
    return b + (a - b) / len * (dyy - 275);
  }
}
function getMscFajr(date, latitude) {
  const latAbs = Math.abs(latitude);
  const { dyy, daysInYear } = computeDyy(date, latitude);
  const a = 75 + 28.65 / 55 * latAbs;
  const b = 75 + 19.44 / 55 * latAbs;
  const c = 75 + 32.74 / 55 * latAbs;
  const d = 75 + 48.1 / 55 * latAbs;
  return Math.round(interpolateSegment(dyy, daysInYear, a, b, c, d));
}
function getMscIsha(date, latitude, shafaq = "general") {
  const latAbs = Math.abs(latitude);
  const { dyy, daysInYear } = computeDyy(date, latitude);
  let a, b, c, d;
  switch (shafaq) {
    case "ahmer":
      a = 62 + 17.4 / 55 * latAbs;
      b = 62 - 7.16 / 55 * latAbs;
      c = 62 + 5.12 / 55 * latAbs;
      d = 62 + 19.44 / 55 * latAbs;
      break;
    case "abyad":
      a = 75 + 25.6 / 55 * latAbs;
      b = 75 + 7.16 / 55 * latAbs;
      c = 75 + 36.84 / 55 * latAbs;
      d = 75 + 81.84 / 55 * latAbs;
      break;
    default:
      a = 75 + 25.6 / 55 * latAbs;
      b = 75 + 2.05 / 55 * latAbs;
      c = 75 - 9.21 / 55 * latAbs;
      d = 75 + 6.14 / 55 * latAbs;
  }
  return Math.round(interpolateSegment(dyy, daysInYear, a, b, c, d));
}
function minutesToDepression(minutes, latDeg, declDeg) {
  const phi = latDeg * (Math.PI / 180);
  const delta = declDeg * (Math.PI / 180);
  const cosPhi = Math.cos(phi);
  const sinPhi = Math.sin(phi);
  const cosDelta = Math.cos(delta);
  const sinDelta = Math.sin(delta);
  const h0 = -0.833 * (Math.PI / 180);
  const sinH0 = Math.sin(h0);
  const denominator = cosPhi * cosDelta;
  if (Math.abs(denominator) < 1e-10) return NaN;
  const cosH_rise = (sinH0 - sinPhi * sinDelta) / denominator;
  if (cosH_rise < -1) return NaN;
  if (cosH_rise > 1) return NaN;
  const H_rise = Math.acos(cosH_rise);
  const deltaH = minutes / 60 * 15 * (Math.PI / 180);
  const H_prayer = H_rise + deltaH;
  if (H_prayer > Math.PI) {
    const sinH_midnight = sinPhi * sinDelta + cosPhi * cosDelta * Math.cos(Math.PI);
    const h_midnight = Math.asin(Math.max(-1, Math.min(1, sinH_midnight)));
    return -h_midnight / (Math.PI / 180);
  }
  const sinH_prayer = sinPhi * sinDelta + cosPhi * cosDelta * Math.cos(H_prayer);
  const h_prayer = Math.asin(Math.max(-1, Math.min(1, sinH_prayer)));
  return -h_prayer / (Math.PI / 180);
}

// src/getAngles.ts
var DEG2 = Math.PI / 180;
var FAJR_MIN = 10;
var FAJR_MAX = 22;
var ISHA_MIN = 10;
var ISHA_MAX = 22;
function clip(value, min, max) {
  return Math.max(min, Math.min(max, value));
}
function round3(value) {
  return Math.round(value * 1e3) / 1e3;
}
function earthSunDistanceCorrection(r) {
  return -0.5 * Math.log(r);
}
function fourierSmoothingCorrection(eclLon, latAbsDeg) {
  const theta = eclLon;
  const phi = latAbsDeg * DEG2;
  const a1 = 0.03 * Math.sin(theta);
  const b1 = -0.05 * Math.cos(theta);
  const a2 = 0.02 * Math.sin(2 * theta);
  const b2 = 0.02 * Math.cos(2 * theta);
  const c1 = -8e-3 * phi * Math.sin(theta);
  const d1 = 4e-3 * phi * Math.cos(theta);
  return a1 + b1 + a2 + b2 + c1 + d1;
}
function getAngles(date, lat, lng, elevation = 0, temperature = 15, pressure = 1013.25) {
  const noonDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0));
  const jd = toJulianDate(noonDate);
  const { decl, r, eclLon } = solarEphemeris(jd);
  const mscFajrMin = getMscFajr(date, lat);
  const mscIshaMin = getMscIsha(date, lat);
  let fajrBase = minutesToDepression(mscFajrMin, lat, decl);
  let ishaBase = minutesToDepression(mscIshaMin, lat, decl);
  if (!isFinite(fajrBase) || isNaN(fajrBase)) fajrBase = 18;
  if (!isFinite(ishaBase) || isNaN(ishaBase)) ishaBase = 18;
  const rCorr = earthSunDistanceCorrection(r);
  const fourierCorr = fourierSmoothingCorrection(eclLon, Math.abs(lat));
  const refrFajr = atmosphericRefraction(-(fajrBase + 0.5), pressure, temperature);
  const refrIsha = atmosphericRefraction(-(ishaBase + 0.5), pressure, temperature);
  const horizonDipDeg = 1.06 * Math.sqrt(elevation / 1e3);
  const elevCorr = horizonDipDeg * 0.3;
  const rawFajr = fajrBase + rCorr + fourierCorr + refrFajr + elevCorr;
  const rawIsha = ishaBase + rCorr + fourierCorr + refrIsha + elevCorr;
  const fajrAngle = round3(clip(rawFajr, FAJR_MIN, FAJR_MAX));
  const ishaAngle = round3(clip(rawIsha, ISHA_MIN, ISHA_MAX));
  return { fajrAngle, ishaAngle };
}

// src/getAsr.ts
var DEG3 = Math.PI / 180;
function getAsr(solarNoon, latitude, declination, hanafi = false) {
  const phi = latitude * DEG3;
  const delta = declination * DEG3;
  const shadowFactor = hanafi ? 2 : 1;
  const X = Math.abs(phi - delta);
  const tanA = 1 / (shadowFactor + Math.tan(X));
  const sinA = tanA / Math.sqrt(1 + tanA * tanA);
  const cosH0 = (sinA - Math.sin(phi) * Math.sin(delta)) / (Math.cos(phi) * Math.cos(delta));
  if (cosH0 < -1 || cosH0 > 1) return NaN;
  const H0h = Math.acos(cosH0) / DEG3 / 15;
  return solarNoon + H0h;
}

// src/getQiyam.ts
function getQiyam(fajrTime, ishaTime) {
  const adjustedFajr = fajrTime < ishaTime ? fajrTime + 24 : fajrTime;
  const nightLength = adjustedFajr - ishaTime;
  const lastThirdStart = ishaTime + 2 * nightLength / 3;
  return lastThirdStart >= 24 ? lastThirdStart - 24 : lastThirdStart;
}

// src/getTimes.ts
function getTimes(date, lat, lng, tz = -date.getTimezoneOffset() / 60, elevation = 0, temperature = 15, pressure = 1013.25, hanafi = false) {
  const { fajrAngle, ishaAngle } = getAngles(date, lat, lng, elevation, temperature, pressure);
  const fajrZenith = 90 + fajrAngle;
  const ishaZenith = 90 + ishaAngle;
  const spaOpts = { elevation, temperature, pressure };
  const spaData = getSpa(date, lat, lng, tz, spaOpts, [fajrZenith, ishaZenith]);
  const fajrTime = spaData.angles[0].sunrise;
  const sunriseTime = spaData.sunrise;
  const noonTime = spaData.solarNoon;
  const maghribTime = spaData.sunset;
  const ishaTime = spaData.angles[1].sunset;
  const dhuhrTime = noonTime + 2.5 / 60;
  const jd = toJulianDate(
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0))
  );
  const { decl } = solarEphemeris(jd);
  const asrTime = getAsr(noonTime, lat, decl, hanafi);
  const qiyamTime = getQiyam(fajrTime, ishaTime);
  return {
    Qiyam: isFinite(qiyamTime) ? qiyamTime : NaN,
    Fajr: isFinite(fajrTime) ? fajrTime : NaN,
    Sunrise: isFinite(sunriseTime) ? sunriseTime : NaN,
    Noon: isFinite(noonTime) ? noonTime : NaN,
    Dhuhr: isFinite(dhuhrTime) ? dhuhrTime : NaN,
    Asr: isFinite(asrTime) ? asrTime : NaN,
    Maghrib: isFinite(maghribTime) ? maghribTime : NaN,
    Isha: isFinite(ishaTime) ? ishaTime : NaN,
    angles: { fajrAngle, ishaAngle }
  };
}

// src/calcTimes.ts
import { formatTime } from "nrel-spa";
function calcTimes(date, lat, lng, tz = -date.getTimezoneOffset() / 60, elevation = 0, temperature = 15, pressure = 1013.25, hanafi = false) {
  const raw = getTimes(date, lat, lng, tz, elevation, temperature, pressure, hanafi);
  return {
    Qiyam: formatTime(raw.Qiyam),
    Fajr: formatTime(raw.Fajr),
    Sunrise: formatTime(raw.Sunrise),
    Noon: formatTime(raw.Noon),
    Dhuhr: formatTime(raw.Dhuhr),
    Asr: formatTime(raw.Asr),
    Maghrib: formatTime(raw.Maghrib),
    Isha: formatTime(raw.Isha),
    angles: raw.angles
  };
}

// src/getTimesAll.ts
import { getSpa as getSpa2 } from "nrel-spa";
var METHODS = [
  { id: "UOIF", name: "Union des Organisations Islamiques de France", region: "France", fajrAngle: 12, ishaAngle: 12 },
  { id: "ISNACA", name: "IQNA / Islamic Council of North America", region: "Canada", fajrAngle: 13, ishaAngle: 13 },
  { id: "ISNA", name: "FCNA / Islamic Society of North America", region: "US, UK, AU, NZ", fajrAngle: 15, ishaAngle: 15 },
  { id: "SAMR", name: "Spiritual Administration of Muslims of Russia", region: "Russia", fajrAngle: 16, ishaAngle: 15 },
  { id: "IGUT", name: "Institute of Geophysics, University of Tehran", region: "Iran", fajrAngle: 17.7, ishaAngle: 14 },
  { id: "MWL", name: "Muslim World League", region: "Global", fajrAngle: 18, ishaAngle: 17 },
  { id: "DIBT", name: "Diyanet \u0130\u015Fleri Ba\u015Fkanl\u0131\u011F\u0131, Turkey", region: "Turkey", fajrAngle: 18, ishaAngle: 17 },
  { id: "Karachi", name: "University of Islamic Sciences, Karachi", region: "PK, BD, IN, AF", fajrAngle: 18, ishaAngle: 18 },
  { id: "Kuwait", name: "Kuwait Ministry of Islamic Affairs", region: "Kuwait", fajrAngle: 18, ishaAngle: 17.5 },
  { id: "UAQ", name: "Umm Al-Qura University, Makkah", region: "Saudi Arabia", fajrAngle: 18.5, ishaAngle: null, ishaMinutes: 90 },
  { id: "Qatar", name: "Qatar / Gulf Standard", region: "Qatar, Gulf", fajrAngle: 18, ishaAngle: null, ishaMinutes: 90 },
  { id: "Egypt", name: "Egyptian General Authority of Survey", region: "EG, SY, IQ, LB", fajrAngle: 19.5, ishaAngle: 17.5 },
  { id: "MUIS", name: "Majlis Ugama Islam Singapura", region: "Singapore", fajrAngle: 20, ishaAngle: 18 },
  { id: "MSC", name: "Moonsighting Committee Worldwide", region: "Global", fajrAngle: null, ishaAngle: null, useMSC: true }
];
function getTimesAll(date, lat, lng, tz = -date.getTimezoneOffset() / 60, elevation = 0, temperature = 15, pressure = 1013.25, hanafi = false) {
  const { fajrAngle, ishaAngle } = getAngles(date, lat, lng, elevation, temperature, pressure);
  const methodZeniths = [];
  for (const m of METHODS) {
    const fZ = m.fajrAngle !== null ? 90 + m.fajrAngle : 90 + 18;
    const iZ = m.ishaAngle !== null ? 90 + m.ishaAngle : 90 + 18;
    methodZeniths.push(fZ, iZ);
  }
  const allZeniths = [
    90 + fajrAngle,
    90 + ishaAngle,
    ...methodZeniths
  ];
  const spaOpts = { elevation, temperature, pressure };
  const spaData = getSpa2(date, lat, lng, tz, spaOpts, allZeniths);
  const fajrTime = spaData.angles[0].sunrise;
  const sunriseTime = spaData.sunrise;
  const noonTime = spaData.solarNoon;
  const maghribTime = spaData.sunset;
  const ishaTime = spaData.angles[1].sunset;
  const dhuhrTime = noonTime + 2.5 / 60;
  const jd = toJulianDate(
    new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0))
  );
  const { decl } = solarEphemeris(jd);
  const asrTime = getAsr(noonTime, lat, decl, hanafi);
  const qiyamTime = getQiyam(fajrTime, ishaTime);
  const Methods = {};
  for (let i = 0; i < METHODS.length; i++) {
    const m = METHODS[i];
    const spaBaseIdx = 2 + i * 2;
    let methodFajr = spaData.angles[spaBaseIdx].sunrise;
    let methodIsha;
    if (m.useMSC) {
      const mscFajrMin = getMscFajr(date, lat);
      const mscIshaMin = getMscIsha(date, lat);
      methodFajr = isFinite(sunriseTime) ? sunriseTime - mscFajrMin / 60 : NaN;
      methodIsha = isFinite(maghribTime) ? maghribTime + mscIshaMin / 60 : NaN;
    } else if (m.ishaMinutes !== void 0) {
      methodIsha = isFinite(maghribTime) ? maghribTime + m.ishaMinutes / 60 : NaN;
    } else {
      methodIsha = spaData.angles[spaBaseIdx + 1].sunset;
    }
    Methods[m.id] = [methodFajr, methodIsha];
  }
  return {
    Qiyam: isFinite(qiyamTime) ? qiyamTime : NaN,
    Fajr: isFinite(fajrTime) ? fajrTime : NaN,
    Sunrise: isFinite(sunriseTime) ? sunriseTime : NaN,
    Noon: isFinite(noonTime) ? noonTime : NaN,
    Dhuhr: isFinite(dhuhrTime) ? dhuhrTime : NaN,
    Asr: isFinite(asrTime) ? asrTime : NaN,
    Maghrib: isFinite(maghribTime) ? maghribTime : NaN,
    Isha: isFinite(ishaTime) ? ishaTime : NaN,
    Methods,
    angles: { fajrAngle, ishaAngle }
  };
}

// src/calcTimesAll.ts
import { formatTime as formatTime2 } from "nrel-spa";
function calcTimesAll(date, lat, lng, tz = -date.getTimezoneOffset() / 60, elevation = 0, temperature = 15, pressure = 1013.25, hanafi = false) {
  const raw = getTimesAll(date, lat, lng, tz, elevation, temperature, pressure, hanafi);
  const Methods = {};
  for (const [id, [fajr, isha]] of Object.entries(raw.Methods)) {
    Methods[id] = [formatTime2(fajr), formatTime2(isha)];
  }
  return {
    Qiyam: formatTime2(raw.Qiyam),
    Fajr: formatTime2(raw.Fajr),
    Sunrise: formatTime2(raw.Sunrise),
    Noon: formatTime2(raw.Noon),
    Dhuhr: formatTime2(raw.Dhuhr),
    Asr: formatTime2(raw.Asr),
    Maghrib: formatTime2(raw.Maghrib),
    Isha: formatTime2(raw.Isha),
    angles: raw.angles,
    Methods
  };
}
export {
  METHODS,
  calcTimes,
  calcTimesAll,
  getAngles,
  getAsr,
  getMscFajr,
  getMscIsha,
  getQiyam,
  getTimes,
  getTimesAll,
  solarEphemeris,
  toJulianDate
};
//# sourceMappingURL=index.mjs.map