import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const CreateGroupSchema = z.object({
  name:        z.string().min(1),
  description: z.string().optional(),
}).passthrough();

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
  const rawBody = await req.json().catch(() => null);
  const parsed = CreateGroupSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_input', details: parsed.error.flatten() },
      { status: 400 },
    );
  }
  try {
    const upstream = await fetch(`${SMART_BASE}/groups`, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed.data),
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
