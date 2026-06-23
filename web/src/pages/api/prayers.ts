/**
 * api/prayers.ts — Prayer times computation endpoint.
 *
 * PURPOSE: GET /api/prayers?lat=&lng=&tz=&from=&to=&hanafi= — computes prayer times
 *   for a date range. Used by calendar export and mobile app.
 * INPUTS: lat, lng, tz, from (YYYY-MM-DD), to (YYYY-MM-DD), hanafi
 * OUTPUTS: JSON array of { date, prayers }
 * REF: P2-E3-W02-S02-T03
 */

import type { APIRoute } from 'astro';
import { getPrayerTimes } from '@/lib/prayers.server';
import { getUtcOffset } from '@/lib/geo';

export const GET: APIRoute = ({ url }) => {
  const p = url.searchParams;
  const lat = parseFloat(p.get('lat') ?? '');
  const lng = parseFloat(p.get('lng') ?? '');
  const tz = p.get('tz') ?? 'UTC';
  const from = p.get('from') ?? '';
  const to = p.get('to') ?? '';
  const hanafi = p.get('hanafi') === '1';

  if (isNaN(lat) || isNaN(lng) || !from || !to) {
    return new Response(JSON.stringify({ error: 'Missing or invalid params' }), { status: 400 });
  }

  const fromDate = new Date(`${from}T12:00:00Z`);
  const toDate = new Date(`${to}T12:00:00Z`);
  if (isNaN(fromDate.getTime()) || isNaN(toDate.getTime())) {
    return new Response(JSON.stringify({ error: 'Invalid date format' }), { status: 400 });
  }

  const diffDays = Math.round((toDate.getTime() - fromDate.getTime()) / 86_400_000);
  if (diffDays < 0 || diffDays > 400) {
    return new Response(JSON.stringify({ error: 'Date range out of bounds' }), { status: 400 });
  }

  const tzOffset = getUtcOffset(tz);
  const results: { date: string; prayers: ReturnType<typeof getPrayerTimes> }[] = [];
  const cursor = new Date(fromDate);

  for (let i = 0; i <= diffDays; i++) {
    const prayers = getPrayerTimes(cursor, lat, lng, tzOffset, hanafi);
    results.push({
      date: cursor.toISOString().slice(0, 10),
      prayers,
    });
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return new Response(JSON.stringify(results), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
