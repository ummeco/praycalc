import type { PrayerEntry, PrayerName } from './ipc-types';

export function getCurrentPrayer(prayers: PrayerEntry[]): PrayerName | null {
  const now = nowMinutes();
  let current: PrayerName | null = null;
  for (const p of prayers) {
    if (toMinutes(p.time) <= now) current = p.name;
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
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

export function secondsUntil(time24: string): number {
  const nowSec = nowSeconds();
  const target = toMinutes(time24) * 60;
  return target > nowSec ? target - nowSec : 0;
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
