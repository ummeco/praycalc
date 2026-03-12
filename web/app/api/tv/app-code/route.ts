import { NextRequest, NextResponse } from 'next/server';

const SMART_URL =
  process.env.SMART_SERVICE_URL ??
  (process.env.NODE_ENV === 'development'
    ? 'http://localhost:4010'
    : 'https://smart.praycalc.com');

/**
 * POST /api/tv/app-code
 *
 * App-side pairing: authenticated user requests a 4-digit code.
 * The code is shown to the user, who enters it on their TV.
 * TV calls POST /api/tv/activate to redeem the code.
 */
export async function POST(req: NextRequest) {
  const auth =
    req.headers.get('Authorization') ??
    req.cookies.get('nhost-session')?.value ?? '';

  if (!auth) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  try {
    const upstream = await fetch(`${SMART_URL}/api/v1/tv/app-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth.startsWith('Bearer ') ? auth : `Bearer ${auth}`,
      },
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return NextResponse.json(
        { error: (data as { error?: string }).error ?? `Upstream error ${upstream.status}` },
        { status: upstream.status },
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    console.error('[TV app-code] Upstream error:', err);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
