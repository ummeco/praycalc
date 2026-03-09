import { NextRequest, NextResponse } from 'next/server';

const SMART_BASE = 'https://smart.praycalc.com/api/v1/tv';

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

  // Validate audioMode if provided
  const validAudioModes = ['silent', 'live-stream', 'quran'];
  if (body.audioMode !== undefined && !validAudioModes.includes(body.audioMode as string)) {
    return NextResponse.json(
      { error: `audioMode must be one of: ${validAudioModes.join(', ')}` },
      { status: 400 },
    );
  }

  // Validate screensaverInterval if provided
  if (body.screensaverInterval !== undefined) {
    const interval = Number(body.screensaverInterval);
    if (!Number.isInteger(interval) || interval < 15 || interval > 600) {
      return NextResponse.json(
        { error: 'screensaverInterval must be an integer between 15 and 600' },
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
