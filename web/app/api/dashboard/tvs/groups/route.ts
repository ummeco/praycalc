import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';

const SMART_BASE = `${process.env.NEXT_PUBLIC_SMART_SERVICE_URL ?? 'https://smart.praycalc.com'}/api/v1/tv`;

function authHeader(req: NextRequest) {
  return req.headers.get('authorization') ?? '';
}

/** GET /api/dashboard/tvs/groups — list user's TV groups */
export async function GET(req: NextRequest) {
  const auth = authHeader(req);
  if (!auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const upstream = await fetch(`${SMART_BASE}/groups`, {
      headers: { Authorization: auth },
      next: { revalidate: 0 },
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: `Upstream error ${upstream.status}` }, { status: upstream.status });
    }
    return NextResponse.json(await upstream.json());
  } catch (err) {
    Sentry.captureException(err);
    console.error('[groups] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

/** POST /api/dashboard/tvs/groups — create a group */
export async function POST(req: NextRequest) {
  const auth = authHeader(req);
  if (!auth.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
  try {
    const upstream = await fetch(`${SMART_BASE}/groups`, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: `Upstream error ${upstream.status}` }, { status: upstream.status });
    }
    return NextResponse.json(await upstream.json());
  } catch (err) {
    Sentry.captureException(err);
    console.error('[groups] POST error:', err);
    return NextResponse.json({ error: 'Failed to create group' }, { status: 500 });
  }
}
