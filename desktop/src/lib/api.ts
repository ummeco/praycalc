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

export async function quitApp(): Promise<void> {
  return invoke('quit_app');
}
