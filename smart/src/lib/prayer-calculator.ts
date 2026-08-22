import NodeCache from 'node-cache';

/** Calculation methods supported. */
export type CalcMethod = 'isna' | 'mwl' | 'egypt' | 'umm_al_qura' | 'tehran' | 'karachi';
export type Madhab = 'shafii' | 'hanafi';

export interface PrayerTimesResult {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface PrayerTimesResponse {
  prayers: PrayerTimesResult;
  nextPrayer: {
    name: string;
    time: string;
    minutesUntil: number;
  } | null;
  hijriDate: string;
  qibla: {
    bearing: number;
  };
  meta: {
    lat: number;
    lng: number;
    date: string;
    method: string;
    madhab: string;
    timezone: string;
  };
}

// Cache prayer calculations for 1 hour per unique location+date combo
const cache = new NodeCache({ stdTTL: 3600, maxKeys: 10000 });

function cacheKey(lat: number, lng: number, date: string, method: string, madhab: string): string {
  // Round coords to 2 decimal places for cache grouping
  const rlat = Math.round(lat * 100) / 100;
  const rlng = Math.round(lng * 100) / 100;
  return `${rlat}:${rlng}:${date}:${method}:${madhab}`;
}

/** Convert decimal hours to HH:MM format. Wraps times past midnight UTC (e.g. Isha in western zones). */
function hoursToTime(h: number): string {
  if (!isFinite(h) || h < 0) return '--:--';
  h = h % 24; // Wrap e.g. 24.82 → 0.82 for Isha that crosses midnight UTC
  const hours = Math.floor(h);
  const minutes = Math.round((h - hours) * 60);
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/** Calculate Qibla bearing from a given lat/lng. */
function qiblaBearing(lat: number, lng: number): number {
  const kaabaLat = 21.4225;
  const kaabaLng = 39.8262;
  const phi1 = (lat * Math.PI) / 180;
  const phi2 = (kaabaLat * Math.PI) / 180;
  const dLambda = ((kaabaLng - lng) * Math.PI) / 180;
  const y = Math.sin(dLambda);
  const x = Math.cos(phi1) * Math.tan(phi2) - Math.sin(phi1) * Math.cos(dLambda);
  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  if (bearing < 0) bearing += 360;
  return Math.round(bearing * 100) / 100;
}

/** Get approximate Hijri date string. Simple estimate based on epoch. */
function getHijriDate(date: Date): string {
  // Approximate: Hijri epoch is July 16, 622 CE
  const julianDay = Math.floor(date.getTime() / 86400000) + 2440587.5;
  const hijriEpoch = 1948439.5;
  const daysSinceEpoch = julianDay - hijriEpoch;
  const lunarMonth = 29.530588853;
  const lunarYear = lunarMonth * 12;
  const yearFraction = daysSinceEpoch / lunarYear;
  const year = Math.floor(yearFraction) + 1;
  const dayInYear = (yearFraction - Math.floor(yearFraction)) * lunarYear;
  const month = Math.floor(dayInYear / lunarMonth) + 1;
  const day = Math.floor(dayInYear % lunarMonth) + 1;
  const monthNames = [
    'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
    'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Shaban',
    'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah',
  ];
  return `${day} ${monthNames[Math.min(month - 1, 11)]} ${year} AH`;
}

/** Method-specific angle configurations. */
const METHOD_ANGLES: Record<CalcMethod, { fajr: number; isha: number }> = {
  isna: { fajr: 15, isha: 15 },
  mwl: { fajr: 18, isha: 17 },
  egypt: { fajr: 19.5, isha: 17.5 },
  umm_al_qura: { fajr: 18.5, isha: 0 }, // Isha = 90 min after Maghrib
  tehran: { fajr: 17.7, isha: 14 },
  karachi: { fajr: 18, isha: 18 },
};

/** Core prayer time calculation using solar position. */
export function calculatePrayerTimes(
  lat: number,
  lng: number,
  dateStr: string,
  method: CalcMethod = 'isna',
  madhab: Madhab = 'shafii',
): PrayerTimesResponse {
  const key = cacheKey(lat, lng, dateStr, method, madhab);
  const cached = cache.get<PrayerTimesResponse>(key);
  if (cached) return cached;

  // Anchored at UTC noon deliberately, so every field below must be read in UTC. Reading
  // local components off a UTC-noon instant lands a day late at UTC+13 and UTC+14, where
  // noon reads as 01:00 or 02:00 of the following local day — verified: day-of-year came
  // back as 2 instead of 1 for 2026-01-01 under Pacific/Kiritimati, shifting the solar
  // declination by a full day.
  const date = new Date(dateStr + 'T12:00:00Z');
  const dayOfYear = getDayOfYear(date);
  const year = date.getUTCFullYear();

  // Solar calculations (simplified NREL SPA approximation)
  const d = dayOfYear - 1 + 0.5;
  const g = (357.529 + 0.98560028 * (jdFromDate(date) - 2451545.0)) % 360;
  const gRad = (g * Math.PI) / 180;
  const q = (280.459 + 0.98564736 * (jdFromDate(date) - 2451545.0)) % 360;
  const L = q + 1.915 * Math.sin(gRad) + 0.020 * Math.sin(2 * gRad);
  const e = 23.439 - 0.00000036 * (jdFromDate(date) - 2451545.0);
  const eRad = (e * Math.PI) / 180;
  const LRad = (L * Math.PI) / 180;

  const sinDec = Math.sin(eRad) * Math.sin(LRad);
  const dec = Math.asin(sinDec);
  const cosDec = Math.cos(dec);

  const latRad = (lat * Math.PI) / 180;
  const cosLat = Math.cos(latRad);
  const sinLat = Math.sin(latRad);

  // Equation of time (approximate)
  const B = ((360 / 365) * (dayOfYear - 81)) * Math.PI / 180;
  const EoT = 9.87 * Math.sin(2 * B) - 7.53 * Math.cos(B) - 1.5 * Math.sin(B);

  // Solar noon in hours UTC
  const solarNoon = 12 - EoT / 60 - lng / 15;

  // Hour angle for a given altitude
  function hourAngle(altitude: number): number {
    const altRad = (altitude * Math.PI) / 180;
    const cosHA = (Math.sin(altRad) - sinLat * Math.sin(dec)) / (cosLat * cosDec);
    if (cosHA > 1 || cosHA < -1) return NaN;
    return Math.acos(cosHA) * 180 / Math.PI / 15; // hours
  }

  // Sunrise/sunset at -0.833 degrees
  const sunriseHA = hourAngle(-0.833);
  const sunrise = solarNoon - sunriseHA;
  const sunset = solarNoon + sunriseHA;

  // Dhuhr = solar noon + small offset
  const dhuhr = solarNoon + 2 / 60; // +2 min safety

  // Asr: shadow length factor
  const asrFactor = madhab === 'hanafi' ? 2 : 1;
  const asrAlt = Math.atan(1 / (asrFactor + Math.tan(Math.abs(latRad - dec)))) * 180 / Math.PI;
  const asrHA = hourAngle(asrAlt);
  const asr = solarNoon + asrHA;

  // Maghrib = sunset
  const maghrib = sunset;

  // Fajr and Isha based on method angles
  const angles = METHOD_ANGLES[method];
  const fajrHA = hourAngle(-angles.fajr);
  const fajr = solarNoon - fajrHA;

  let isha: number;
  if (method === 'umm_al_qura') {
    isha = maghrib + 1.5; // 90 minutes after Maghrib
  } else {
    const ishaHA = hourAngle(-angles.isha);
    isha = solarNoon + ishaHA;
  }

  const prayers: PrayerTimesResult = {
    fajr: hoursToTime(fajr),
    sunrise: hoursToTime(sunrise),
    dhuhr: hoursToTime(dhuhr),
    asr: hoursToTime(asr),
    maghrib: hoursToTime(maghrib),
    isha: hoursToTime(isha),
  };

  // Determine next prayer
  const now = new Date();
  const currentHours = now.getUTCHours() + now.getUTCMinutes() / 60 + lng / 15;
  const prayerHours = [
    { name: 'Fajr', h: fajr },
    { name: 'Sunrise', h: sunrise },
    { name: 'Dhuhr', h: dhuhr },
    { name: 'Asr', h: asr },
    { name: 'Maghrib', h: maghrib },
    { name: 'Isha', h: isha },
  ];

  let nextPrayer: PrayerTimesResponse['nextPrayer'] = null;
  for (const p of prayerHours) {
    if (isFinite(p.h) && p.h > currentHours) {
      nextPrayer = {
        name: p.name,
        time: hoursToTime(p.h),
        minutesUntil: Math.round((p.h - currentHours) * 60),
      };
      break;
    }
  }

  const result: PrayerTimesResponse = {
    prayers,
    nextPrayer,
    hijriDate: getHijriDate(date),
    qibla: { bearing: qiblaBearing(lat, lng) },
    meta: {
      lat: Math.round(lat * 10000) / 10000,
      lng: Math.round(lng * 10000) / 10000,
      date: dateStr,
      method,
      madhab,
      timezone: 'UTC',
    },
  };

  cache.set(key, result);
  return result;
}

function getDayOfYear(date: Date): number {
  // UTC throughout: `date` is a UTC-noon anchor, so a local year-start would be measured
  // from a different instant than the date itself and drift by a day near the extremes.
  const start = Date.UTC(date.getUTCFullYear(), 0, 0);
  const diff = date.getTime() - start;
  return Math.floor(diff / 86400000);
}

function jdFromDate(date: Date): number {
  return date.getTime() / 86400000 + 2440587.5;
}

/**
 * The calendar day currently in progress at a given longitude, as 'YYYY-MM-DD'.
 *
 * WHY: the voice surfaces answer "what are today's prayer times" for a person standing
 * somewhere. Defaulting to `new Date().toISOString().split('T')[0]` gives the SERVER's UTC
 * day, so a user in Auckland asking at 10am local was answered for the previous day.
 *
 * WHY longitude rather than a timezone database: this package has no tz dependency and the
 * voice payloads carry only coordinates. Solar offset (longitude / 15) picks the right
 * calendar day everywhere except within roughly an hour of local midnight, where political
 * timezone borders and DST can disagree with solar time. That is a large improvement on
 * assuming UTC, which is wrong for up to half the day at high longitudes.
 *
 * Prefer an explicit IANA timezone if one ever becomes available in these payloads.
 *
 * @param lng - Longitude in decimal degrees, east positive
 * @param at  - The instant to resolve at; defaults to now
 * @returns The local calendar day as 'YYYY-MM-DD'
 */
export function localDayAtLongitude(lng: number, at: Date = new Date()): string {
  const offsetHours = Math.round(lng / 15);
  const shifted = new Date(at.getTime() + offsetHours * 3_600_000);
  return shifted.toISOString().split('T')[0] as string;
}
