import { invoke } from '@tauri-apps/api/core';
import type { PrayerTimesResponse } from './ipc-types';

export async function fetchPrayerTimes(
  lat: number,
  lng: number,
  tz: string,
  method: string,
  hanafi: boolean,
): Promise<PrayerTimesResponse> {
  return invoke<PrayerTimesResponse>('fetch_prayer_times', { lat, lng, tz, method, hanafi });
}

export async function updateTrayTooltip(label: string): Promise<void> {
  return invoke('update_tray_tooltip', { label });
}

export async function getTodayDate(): Promise<string> {
  return invoke<string>('get_today_date');
}

export async function sendPrayerNotification(name: string): Promise<void> {
  return invoke('notify_prayer', { name });
}
