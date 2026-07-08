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

export function getCurrentPrayer(prayers: PrayerEntry[], tz: string): PrayerName | null {
  const now = nowMinutesInTz(tz);
  let current: PrayerName | null = null;
  for (const p of prayers) {
    if (toMinutes(p.time) <= now) current = p.name as PrayerName;
    else break;
  }
  return current;
}

export function getNextPrayer(prayers: PrayerEntry[], tz: string): PrayerEntry | null {
  const now = nowMinutesInTz(tz);
  return prayers.find((p) => toMinutes(p.time) > now) ?? null;
}

export function formatTime12(time24: string): string {
  const [h, m] = time24.split(':').map(Number);
  const ampm = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

// Signed: positive = seconds until, negative = seconds since (prayer already passed).
// Day-aware: after Isha the next target is tomorrow's Fajr, whose HH:MM lies far in
// "today's" past. Prayers are never >6h apart, so beyond -6h means "tomorrow" —
// shift by 24h so the countdown rolls over midnight. Mirrors Rust seconds_until.
// `tz` is the *configured location's* IANA timezone — required so the countdown
// is anchored to that clock, not the device's own timezone (see nowSecondsInTz).
export function secondsUntil(time24: string, tz: string): number {
  const nowSec = nowSecondsInTz(tz);
  const target = toMinutes(time24) * 60;
  const secs = target - nowSec;
  return secs < -21_600 ? secs + 86_400 : secs;
}

export function formatCountdown(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m ${s}s`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/**
 * Current wall-clock time in `tz` (an IANA zone, e.g. "Asia/Dubai"), as seconds
 * since local midnight. Uses `Intl.DateTimeFormat` (no extra dependency) so the
 * countdown is anchored to the *configured location's* clock rather than the
 * device's own timezone — fixes the cross-timezone countdown bug (mirrors
 * Rust's `now_naive_in_tz` in src-tauri/src/timer.rs). Falls back to the
 * device's local clock if `tz` is empty/invalid, matching the pre-fix behavior
 * rather than throwing.
 */
function nowSecondsInTz(tz: string): number {
  if (!tz) return nowSecondsLocal();
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hourCycle: 'h23',
    }).formatToParts(new Date());
    const get = (type: string) => Number(parts.find((p) => p.type === type)?.value ?? 0);
    const hours = get('hour') % 24; // some engines emit "24" for midnight under h23
    return hours * 3600 + get('minute') * 60 + get('second');
  } catch {
    // Invalid/unknown IANA tz string (e.g. stale settings) — degrade to device-local
    // time instead of throwing, so a bad tz value never crashes the countdown.
    return nowSecondsLocal();
  }
}

function nowMinutesInTz(tz: string): number {
  return Math.floor(nowSecondsInTz(tz) / 60);
}

function nowSecondsLocal(): number {
  const d = new Date();
  return d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds();
}

function toMinutes(time24: string): number {
  const [h, m] = time24.split(':').map(Number);
  return h * 60 + m;
}
