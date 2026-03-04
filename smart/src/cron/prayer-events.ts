import cron from 'node-cron';
import { calculatePrayerTimes } from '../lib/prayer-calculator.js';
import { getAllActiveRegistrations } from '../routes/webhooks.js';

/** Fire webhook callbacks at each prayer time. Runs every minute. */
export function startPrayerCron(): void {
  cron.schedule('* * * * *', async () => {
    const registrations = getAllActiveRegistrations();
    if (registrations.length === 0) return;

    const now = new Date();
    const currentTime = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];

    for (const reg of registrations) {
      try {
        const times = calculatePrayerTimes(reg.lat, reg.lng, dateStr);
        const prayers = times.prayers;
        const prayerEntries = Object.entries(prayers) as [string, string][];

        for (const [name, time] of prayerEntries) {
          if (name === 'sunrise') continue; // Not a prayer
          if (time === currentTime && reg.events.includes('adhan')) {
            // Fire webhook
            await fireWebhook(reg.callbackUrl, {
              event: 'adhan',
              prayer: name,
              time,
              date: dateStr,
              lat: reg.lat,
              lng: reg.lng,
              hijriDate: times.hijriDate,
            });
          }
        }
      } catch (err) {
        console.error(`[CRON] Failed to process webhook ${reg.id}:`, err);
      }
    }
  });

  console.log('[CRON] Prayer event webhook cron started (every minute)');
}

async function fireWebhook(url: string, payload: Record<string, unknown>): Promise<void> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      console.warn(`[WEBHOOK] ${url} returned ${response.status}`);
    }
  } catch (err) {
    console.error(`[WEBHOOK] Failed to deliver to ${url}:`, err);
  }
}
