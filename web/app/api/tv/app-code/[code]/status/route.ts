import { NextRequest, NextResponse } from 'next/server';

const SMART_URL =
  process.env.SMART_SERVICE_URL ??
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:4010'
    : 'https://smart.praycalc.com');

/**
 * GET /api/tv/app-code/[code]/status
 *
 * Authenticated poll: app checks whether the TV has activated the code.
 * Returns { status: 'pending' | 'activated' | 'expired', deviceId? }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const auth =
    req.headers.get('Authorization') ??
    req.cookies.get('nhost-session')?.value ?? '';

  if (!auth) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  try {
    const upstream = await fetch(
      `${SMART_URL}/api/v1/tv/app-code/${encodeURIComponent(code)}/status`,
      {
        headers: {
          Authorization: auth.startsWith('Bearer ') ? auth : `Bearer ${auth}`,
        },
        cache: 'no-store',
      },
    );

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return NextResponse.json(
        { error: (data as { error?: string }).error ?? `Upstream error ${upstream.status}` },
        { status: upstream.status },
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[TV app-code status] Upstream error:', err);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
