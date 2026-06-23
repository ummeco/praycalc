import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const TvActivateSchema = z.object({
  user_code: z.string().min(1),
});

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

  const rawBody = await req.json().catch(() => null);
  const parsedBody = TvActivateSchema.safeParse(rawBody);
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: 'invalid_input', details: parsedBody.error.flatten() },
      { status: 400 },
    );
  }
  const { user_code } = parsedBody.data;

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
