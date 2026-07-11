/** Returns true when `now` falls within [prayerStart, prayerStart + windowMinutes] inclusive. */
export function isPrayerWindowActive(
  prayerTimeStr: string,
  now: Date,
  windowMinutes: number,
): boolean {
  const [h, m] = prayerTimeStr.split(':').map(Number);
  const prayerDate = new Date(now);
  prayerDate.setHours(h, m, 0, 0);
  const windowMs = windowMinutes * 60 * 1000;
  const diffMs = now.getTime() - prayerDate.getTime();
  return diffMs >= 0 && diffMs <= windowMs;
}

export function validateConfig(config: { latitude?: number; longitude?: number }): void {
  if (!config.latitude || !config.longitude) {
    throw new Error('homebridge-praycalc: latitude and longitude are required in config.json');
  }
}
