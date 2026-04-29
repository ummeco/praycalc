import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';

const SMART_URL = process.env.SMART_SERVICE_URL ?? 'https://smart.praycalc.com';

/**
 * POST /api/tv/activate
 *
 * Relays the RFC 8628 user_code authorization to the smart service.
 * The smart service marks the device_code as authorized for the signed-in user.
 *
 * Body: { user_code: string }
 * Auth: forwarded via Authorization header or cookie
 */
export async function POST(req: NextRequest) {
  const auth = req.headers.get('Authorization') ?? req.cookies.get('nhost-session')?.value ?? '';
  if (!auth) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  let body: { user_code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { user_code } = body;
  if (!user_code || typeof user_code !== 'string') {
    return NextResponse.json({ error: 'user_code required' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${SMART_URL}/api/v1/tv/auth/authorize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: auth.startsWith('Bearer ') ? auth : `Bearer ${auth}`,
      },
      body: JSON.stringify({ user_code }),
    });

    const data = await upstream.json().catch(() => ({}));

    if (!upstream.ok) {
      return NextResponse.json(
        { error: data.error ?? `Smart service error ${upstream.status}` },
        { status: upstream.status },
      );
    }

    return NextResponse.json({ authorized: true });
  } catch (err) {
    Sentry.captureException(err);
    console.error('[TV activate] Upstream error:', err);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
