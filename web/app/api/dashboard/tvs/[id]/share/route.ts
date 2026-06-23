import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Zod schema — T03 AC-01: Priority 2 validation at TV share boundary
const TvShareSchema = z.record(z.unknown());

const SMART_BASE = `${process.env.NEXT_PUBLIC_SMART_SERVICE_URL ?? 'https://smart.praycalc.com'}/api/v1/tv`;

/**
 * POST /api/dashboard/tvs/[id]/share
 * Share a TV with another user by email.
 *
 * Body: { email: string, permissions?: { view?: boolean, control?: boolean, announce?: boolean } }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authHeader = req.headers.get('authorization') ?? '';

  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rawBody = await req.json().catch(() => null);
  const parsedShare = TvShareSchema.safeParse(rawBody);
  if (!parsedShare.success) {
    return NextResponse.json(
      { error: 'invalid_input', details: parsedShare.error.flatten() },
      { status: 400 },
    );
  }
  const body: Record<string, unknown> = parsedShare.data;

  try {
    const upstream = await fetch(`${SMART_BASE}/${id}/share`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    Sentry.captureException(err);
    console.error('[tvs/share] POST error:', err);
    return NextResponse.json({ error: 'Failed to share TV' }, { status: 500 });
  }
}

/**
 * DELETE /api/dashboard/tvs/[id]/share
 * Remove a share for a specific user.
 *
 * Body: { userId: string }
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authHeader = req.headers.get('authorization') ?? '';

  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rawBodyDel = await req.json().catch(() => null);
  const parsedDel = TvShareSchema.safeParse(rawBodyDel);
  if (!parsedDel.success) {
    return NextResponse.json(
      { error: 'invalid_input', details: parsedDel.error.flatten() },
      { status: 400 },
    );
  }
  const body: Record<string, unknown> = parsedDel.data;

  const userId = body.userId as string | undefined;
  if (!userId) {
    return NextResponse.json({ error: 'userId is required' }, { status: 400 });
  }

  try {
    const upstream = await fetch(`${SMART_BASE}/${id}/share/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return NextResponse.json(data, { status: upstream.status });
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    Sentry.captureException(err);
    console.error('[tvs/share] DELETE error:', err);
    return NextResponse.json({ error: 'Failed to remove share' }, { status: 500 });
  }
}
