import type { PrayerEntry, PrayerName, DisplayMode, NameFormat } from './ipc-types';

export const PRAYER_ABBREVS: Record<PrayerName, string> = {
  Fajr: 'F',
  Sunrise: 'Sr',
  Dhuhr: 'D',
  Asr: 'A',
  Maghrib: 'M',
  Isha: 'I',
};

export const PRAYER_ARABIC: Record<PrayerName, string> = {
  Fajr: 'الفجر',
  Sunrise: 'الشروق',
  Dhuhr: 'الظهر',
  Asr: 'العصر',
  Maghrib: 'المغرب',
  Isha: 'العشاء',
};

export const HIJRI_MONTHS = [
  'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
];

export function getHijriDate(date: Date = new Date()): string {
  // Algorithm: Gregorian → Julian Day Number → Islamic date
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  // Julian Day Number for Gregorian date
  const jd = Math.floor(
    (1461 * (y + 4800 + Math.floor((m - 14) / 12))) / 4 +
    Math.floor((367 * (m - 2 - 12 * Math.floor((m - 14) / 12))) / 12) -
    Math.floor((3 * Math.floor((y + 4900 + Math.floor((m - 14) / 12)) / 100)) / 4) +
    d - 32075
  );

  // Islamic calendar conversion (Meeus algorithm)
  let l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const iYear = 30 * n + j - 30;
  const iMonth = Math.floor((24 * l) / 709);
  const iDay = l - Math.floor((709 * iMonth) / 24);

  return `${iDay} ${HIJRI_MONTHS[iMonth - 1]} ${iYear}h`;
}

export function getPrayerDisplay(name: PrayerName, format: NameFormat, arabic: boolean): string {
  if (arabic) return PRAYER_ARABIC[name];
  if (format === 'abbrev') return PRAYER_ABBREVS[name];
  return name;
}

export function formatTrayLabel(
  next: PrayerEntry | null,
  seconds: number,
  displayMode: DisplayMode,
  nameFormat: NameFormat,
): string {
  if (!next) return 'PrayCalc';
  const label = nameFormat === 'abbrev' ? PRAYER_ABBREVS[next.name] : next.name;
  if (displayMode === 'time') {
    return `${label} ${formatTime12(next.time)}`;
  }
  // countdown mode: "A 2:00" (no hyphen; H:MM when ≥1hr, M:SS when <1hr)
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const rem = Math.floor((seconds % 3600) / 60);
    return `${label} ${h}:${String(rem).padStart(2, '0')}`;
  }
  return `${label} ${m}:${String(s).padStart(2, '0')}`;
}

export function getCurrentPrayer(prayers: PrayerEntry[]): PrayerName | null {
  const now = nowMinutes();
  let current: PrayerName | null = null;
  for (const p of prayers) {
    if (toMinutes(p.time) <= now) current = p.name as PrayerName;
    else break;
  }
  return current;
}

export function getNextPrayer(prayers: PrayerEntry[]): PrayerEntry | null {
  const now = nowMinutes();
  return prayers.find((p) => toMinutes(p.time) > now) ?? null;
}

export function formatTime12(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

// Signed: positive = seconds until, negative = seconds since (prayer already passed)
export function secondsUntil(time24: string): number {
  const nowSec = nowSeconds();
  const target = toMinutes(time24) * 60;
  return target - nowSec;
}

export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function nowMinutes(): number {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

function nowSeconds(): number {
  const d = new Date();
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
}

function toMinutes(time24: string): number {
  const [h, m] = time24.split(':').map(Number);
  return h * 60 + m;
}
