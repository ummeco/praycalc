import cron from 'node-cron';
import { calculatePrayerTimes } from '../lib/prayer-calculator.js';
import { getAllActiveRegistrations } from '../routes/webhooks.js';

/**
 * Convert current UTC time to a user's local timezone and return HH:MM + local date string.
 */
function getLocalTime(timezone: string): { time: string; dateStr: string } {
  const now = new Date();
  try {
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(now);
    const get = (type: string) => parts.find(p => p.type === type)?.value || '00';
    const dateStr = `${get('year')}-${get('month')}-${get('day')}`;
    const time = `${get('hour')}:${get('minute')}`;
    return { time, dateStr };
  } catch {
    // Fallback to UTC if timezone is invalid
    const time = `${now.getUTCHours().toString().padStart(2, '0')}:${now.getUTCMinutes().toString().padStart(2, '0')}`;
    const dateStr = now.toISOString().split('T')[0];
    return { time, dateStr };
  }
}

/** Fire webhook callbacks at each prayer time. Runs every minute. */
export function startPrayerCron(): void {
  cron.schedule('* * * * *', async () => {
    const registrations = await getAllActiveRegistrations();
    if (registrations.length === 0) return;

    for (const reg of registrations) {
      try {
        // Use the user's timezone from their webhook registration
        const { time: currentTime, dateStr } = getLocalTime(reg.timezone || 'UTC');
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
              timezone: reg.timezone,
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
