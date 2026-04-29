/**
 * GET /api/ramadan/times
 * Compute Suhoor (Fajr) and Iftar (Maghrib) times for a given location and date.
 * Used by the Ramadan page as a server-side fallback when the smart server is unavailable.
 *
 * Query params:
 *   lat   — latitude (required)
 *   lng   — longitude (required)
 *   tz    — IANA timezone string, e.g. "America/New_York" (default: "UTC")
 *   date  — YYYY-MM-DD (default: today)
 */
import * as Sentry from '@sentry/nextjs';
import { type NextRequest, NextResponse } from 'next/server';
import { getPrayerTimes } from '@/lib/prayers';
import { getUtcOffset } from '@/lib/geo';

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const lat = parseFloat(p.get('lat') ?? '');
  const lng = parseFloat(p.get('lng') ?? '');
  const tz = p.get('tz') ?? 'UTC';
  const dateParam = p.get('date') ?? new Date().toISOString().slice(0, 10);

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'lat and lng are required and must be valid coordinates' }, { status: 400 });
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
    return NextResponse.json({ error: 'date must be in YYYY-MM-DD format' }, { status: 400 });
  }

  try {
    const date = new Date(dateParam + 'T12:00:00Z');
    const offset = getUtcOffset(tz, date);
    const prayers = getPrayerTimes(date, lat, lng, offset);

    return NextResponse.json(
      {
        fajr: prayers.Fajr,
        maghrib: prayers.Maghrib,
      },
      { headers: { 'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400' } },
    );
  } catch (err) {
    Sentry.captureException(err);
    console.error('[ramadan/times] Calculation error:', err);
    return NextResponse.json({ error: 'Failed to calculate prayer times' }, { status: 500 });
  }
}
