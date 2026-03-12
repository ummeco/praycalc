import { NextRequest, NextResponse } from 'next/server';
import { TOP_CITIES } from '@/lib/top-cities';

const SMART_BASE = `${process.env.NEXT_PUBLIC_SMART_SERVICE_URL ?? 'https://smart.praycalc.com'}/api/v1/tv`;

/**
 * GET /api/dashboard/tvs/[id]/settings
 * Returns current settings for a TV from the smart service.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authHeader = req.headers.get('authorization') ?? '';

  try {
    const upstream = await fetch(`${SMART_BASE}/${id}/settings`, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream error ${upstream.status}` },
        { status: upstream.status },
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('[tvs/settings] GET error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch TV settings' },
      { status: 500 },
    );
  }
}

/**
 * PATCH /api/dashboard/tvs/[id]/settings
 * Validates and proxies settings update to the smart service.
 *
 * Body: {
 *   layout?: string,
 *   audioMode?: 'silent' | 'live-stream' | 'quran',
 *   screensaverSource?: 'praycalc' | 'my-photos' | 'mix',
 *   screensaverInterval?: number,
 *   citySlugOverride?: string | null,
 * }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authHeader = req.headers.get('authorization') ?? '';

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // Validate tvAudioMode if provided
  const validAudioModes = ['silent', 'live-stream', 'quran'];
  if (body.tvAudioMode !== undefined && !validAudioModes.includes(body.tvAudioMode as string)) {
    return NextResponse.json(
      { error: `tvAudioMode must be one of: ${validAudioModes.join(', ')}` },
      { status: 400 },
    );
  }

  // Resolve city slug override → inject snake_case location fields for Flutter polling handler.
  // Accepts both 'citySlugOverride' (TvSettingsPanel) and 'cityOverride' (account page).
  const citySlug = (body.citySlugOverride ?? body.cityOverride) as string | null | undefined;
  if (citySlug) {
    const city = TOP_CITIES.find(c => c.slug === citySlug);
    if (city) {
      body.location_lat = city.lat;
      body.location_lng = city.lng;
      body.location_city = city.name;
      body.location_country = city.country;
      body.location_timezone = city.timezone;
    }
    // Normalize to single field name for storage
    body.cityOverride = citySlug;
    delete body.citySlugOverride;
  } else if (citySlug === null || citySlug === '') {
    // Explicit clear — remove the override
    body.cityOverride = null;
    delete body.citySlugOverride;
  }

  // Remap camelCase location fields to snake_case for smart backend
  if (body.locationLat !== undefined) { body.location_lat = body.locationLat; delete body.locationLat; }
  if (body.locationLng !== undefined) { body.location_lng = body.locationLng; delete body.locationLng; }
  if (body.locationCity !== undefined) { body.location_city = body.locationCity; delete body.locationCity; }
  if (body.locationCountry !== undefined) { body.location_country = body.locationCountry; delete body.locationCountry; }
  if (body.locationState !== undefined) { body.location_state = body.locationState; delete body.locationState; }
  if (body.locationTimezone !== undefined) { body.location_timezone = body.locationTimezone; delete body.locationTimezone; }

  // Validate slideshowDurationSeconds if provided
  if (body.slideshowDurationSeconds !== undefined && body.slideshowDurationSeconds !== null) {
    const duration = Number(body.slideshowDurationSeconds);
    if (!Number.isInteger(duration) || duration < 10 || duration > 600) {
      return NextResponse.json(
        { error: 'slideshowDurationSeconds must be an integer between 10 and 600' },
        { status: 400 },
      );
    }
  }

  try {
    const upstream = await fetch(`${SMART_BASE}/${id}/settings`, {
      method: 'PATCH',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '');
      console.error('[tvs/settings] PATCH upstream error:', upstream.status, errText);
      return NextResponse.json(
        { error: `Upstream error ${upstream.status}` },
        { status: upstream.status },
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('[tvs/settings] PATCH error:', err);
    return NextResponse.json(
      { error: 'Failed to update TV settings' },
      { status: 500 },
    );
  }
}
