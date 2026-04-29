import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';

const SMART_BASE = `${process.env.NEXT_PUBLIC_SMART_SERVICE_URL ?? 'https://smart.praycalc.com'}/api/v1/tv`;

/**
 * POST /api/dashboard/tvs/[id]/quran
 * Proxies a Quran playback command to the smart service.
 *
 * Body: { action: 'play'|'pause'|'resume'|'stop', surah?, ayah?, reciterId?, afterSurah? }
 */
export async function POST(
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

  const validActions = ['play', 'pause', 'resume', 'stop'];
  if (!body.action || !validActions.includes(body.action as string)) {
    return NextResponse.json(
      { error: `action must be one of: ${validActions.join(', ')}` },
      { status: 400 },
    );
  }

  try {
    const upstream = await fetch(`${SMART_BASE}/${id}/quran`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '');
      Sentry.captureException(new Error(`[tvs/quran] POST upstream error: ${upstream.status} ${errText}`));
      console.error('[tvs/quran] POST upstream error:', upstream.status, errText);
      return NextResponse.json(
        { error: `Upstream error ${upstream.status}` },
        { status: upstream.status },
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    Sentry.captureException(err);
    console.error('[tvs/quran] POST error:', err);
    return NextResponse.json(
      { error: 'Failed to send Quran command' },
      { status: 500 },
    );
  }
}
