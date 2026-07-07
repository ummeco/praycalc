/**
 * api/calendar.ics.ts — ICS calendar export endpoint.
 *
 * PURPOSE: GET /api/calendar.ics?lat=&lng=&tz=&days=30&hanafi=0&events=0
 *   Generates a valid RFC 5545 iCalendar file with one VEVENT per prayer per day.
 *   Each VEVENT spans the prayer time to the next prayer (or +1h for Isha/Qiyam).
 *   With &events=1, appends all-day VEVENTs for the fixed Islamic observances
 *   (Ramadan start, both Eids, Ashura, Islamic New Year, Laylat al-Qadr,
 *   Isra & Mi'raj — Mawlid excluded) that fall within the exported date range.
 * INPUTS: lat, lng, tz (IANA timezone), days (1–365), hanafi (0|1), events (0|1)
 * OUTPUTS: text/calendar; charset=utf-8
 * CONSTRAINTS: Pure server-side, no islands. Uses pray-calc via prayers.server.ts.
 *   Islamic events are opt-in (events=1) so existing subscriptions never change.
 * REF: P2-PRAYCALC-CALENDAR · W1.1 (Islamic events in .ics, gap A13)
 */

import type { APIRoute } from 'astro';
import { getPrayerTimes } from '@/lib/prayers.server';
import { getUtcOffset } from '@/lib/geo';
import { getIslamicEventsForGregorianYear } from '@/lib/islamic-dates';

const PRAYER_NAMES = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
type PrayerName = (typeof PRAYER_NAMES)[number];

/** Format a Date as ICS timestamp: YYYYMMDDTHHmmss */
function icsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
}

/** Format a UTC Date as an ICS all-day DATE value: YYYYMMDD */
function icsAllDay(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '');
}

/** Parse "HH:MM" in a given IANA timezone → UTC Date for the given base date */
function parseLocalTime(dateStr: string, timeStr: string, tz: string): Date | null {
  if (!timeStr || timeStr === 'N/A') return null;
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr ?? '0', 10);
  const m = parseInt(mStr ?? '0', 10);
  if (isNaN(h) || isNaN(m)) return null;

  // Build a UTC date offset-adjusted for the timezone
  const [year, month, day] = dateStr.split('-').map(Number) as [number, number, number];
  // Create as if local time, then adjust by the tz offset to get UTC
  const localMs = Date.UTC(year, month - 1, day, h, m, 0);
  // getUtcOffset returns offset in hours; subtract it to shift local→UTC
  // (e.g. UTC+3 means local 05:00 = UTC 02:00, so subtract 3 hrs)
  // We re-derive the offset per-day to handle DST correctly.
  const dayDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const offsetHours = getUtcOffset(tz, dayDate);
  return new Date(localMs - offsetHours * 3_600_000);
}

/** Fold long lines per RFC 5545 §3.1 (max 75 octets, continuation with CRLF + space) */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const parts: string[] = [];
  parts.push(line.slice(0, 75));
  let i = 75;
  while (i < line.length) {
    parts.push(' ' + line.slice(i, i + 74));
    i += 74;
  }
  return parts.join('\r\n');
}

export const GET: APIRoute = ({ url }) => {
  const p = url.searchParams;
  const lat = parseFloat(p.get('lat') ?? '');
  const lng = parseFloat(p.get('lng') ?? '');
  const tz = p.get('tz') ?? 'UTC';
  const days = Math.min(365, Math.max(1, parseInt(p.get('days') ?? '30', 10)));
  const hanafi = p.get('hanafi') === '1';
  // Opt-in: append fixed Islamic observances as all-day events. Off by default so
  // existing calendar subscriptions keep exporting prayers only.
  const includeEvents = p.get('events') === '1';

  if (isNaN(lat) || isNaN(lng)) {
    return new Response('Missing or invalid lat/lng', { status: 400 });
  }

  const now = new Date();
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PrayCalc//praycalc.com//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    foldLine(`X-WR-CALNAME:Prayer Times (${tz})`),
    'X-WR-TIMEZONE:' + tz,
  ];

  const uid_base = `praycalc-${lat.toFixed(4)}-${lng.toFixed(4)}`.replace(/\./g, 'p');

  for (let d = 0; d < days; d++) {
    const dayDate = new Date(now);
    dayDate.setUTCDate(now.getUTCDate() + d);
    const dateStr = dayDate.toISOString().slice(0, 10);

    let tzOffset: number;

    try {

      tzOffset = getUtcOffset(tz);

    } catch (e) {

      return new Response(e instanceof Error ? e.message : 'Invalid tz', { status: 400 });

    }
    const times = getPrayerTimes(dayDate, lat, lng, tzOffset, hanafi);

    for (let pi = 0; pi < PRAYER_NAMES.length; pi++) {
      const name = PRAYER_NAMES[pi] as PrayerName;
      const timeStr = times[name];
      const dtStart = parseLocalTime(dateStr, timeStr, tz);
      if (!dtStart) continue;

      // Duration: time until next prayer, capped at 2h; Isha always 1h
      const nextName = PRAYER_NAMES[pi + 1] as PrayerName | undefined;
      let dtEnd: Date;
      if (nextName) {
        const nextStart = parseLocalTime(dateStr, times[nextName], tz);
        if (nextStart && nextStart > dtStart) {
          const gap = nextStart.getTime() - dtStart.getTime();
          // Cap at 2h so prayers don't overlap into the next
          dtEnd = new Date(dtStart.getTime() + Math.min(gap, 7_200_000));
        } else {
          dtEnd = new Date(dtStart.getTime() + 3_600_000);
        }
      } else {
        dtEnd = new Date(dtStart.getTime() + 3_600_000);
      }

      const uid = `${uid_base}-${dateStr}-${name.toLowerCase()}@praycalc.com`;
      const stamp = icsDate(now);

      lines.push('BEGIN:VEVENT');
      lines.push(foldLine('UID:' + uid));
      lines.push('DTSTAMP:' + stamp);
      lines.push('DTSTART:' + icsDate(dtStart));
      lines.push('DTEND:' + icsDate(dtEnd));
      lines.push(foldLine('SUMMARY:' + name + ' Prayer'));
      lines.push(foldLine('DESCRIPTION:' + name + ' prayer time for ' + tz + (hanafi ? ' (Hanafi)' : '')));
      lines.push('CATEGORIES:Prayer');
      lines.push('END:VEVENT');
    }
  }

  // Opt-in Islamic observances as all-day VEVENTs within the exported window.
  if (includeEvents) {
    // Window covers [today, today + days). Gather events across every Gregorian
    // year the window spans (usually 1, but 2 near a Dec/Jan boundary).
    const windowStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const windowEnd = new Date(windowStart);
    windowEnd.setUTCDate(windowEnd.getUTCDate() + days);

    const years = new Set<number>();
    for (let y = windowStart.getUTCFullYear(); y <= windowEnd.getUTCFullYear(); y++) {
      years.add(y);
    }

    for (const year of years) {
      for (const ev of getIslamicEventsForGregorianYear(year)) {
        // Keep only observances inside the [windowStart, windowEnd) export window.
        if (ev.date < windowStart || ev.date >= windowEnd) continue;

        const dtEnd = new Date(ev.date);
        dtEnd.setUTCDate(dtEnd.getUTCDate() + 1); // all-day DTEND is exclusive (next day)

        lines.push('BEGIN:VEVENT');
        lines.push(foldLine(`UID:${uid_base}-event-${ev.slug}-${icsAllDay(ev.date)}@praycalc.com`));
        lines.push('DTSTAMP:' + icsDate(now));
        lines.push('DTSTART;VALUE=DATE:' + icsAllDay(ev.date));
        lines.push('DTEND;VALUE=DATE:' + icsAllDay(dtEnd));
        lines.push(foldLine('SUMMARY:' + ev.name));
        lines.push(foldLine('DESCRIPTION:' + ev.name + ' — Islamic observance (Umm al-Qura). Local moon sighting may shift the observed date by ±1 day.'));
        lines.push('CATEGORIES:Islamic Holiday');
        lines.push('TRANSP:TRANSPARENT');
        lines.push('END:VEVENT');
      }
    }
  }

  lines.push('END:VCALENDAR');

  const body = lines.join('\r\n') + '\r\n';
  const filename = `prayer-times-${tz.replace(/\//g, '-')}.ics`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
