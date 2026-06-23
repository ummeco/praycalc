import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Zod schema — T03 AC-01: Priority 2 validation at TV group announce boundary
const TvAnnounceSchema = z.object({
  text:               z.string().min(1, 'text is required').max(500),
  expires_in_minutes: z.number().int().min(1).max(1440).optional(),
});

const SMART_BASE = `${process.env.NEXT_PUBLIC_SMART_SERVICE_URL ?? 'https://smart.praycalc.com'}/api/v1/tv`;

/**
 * POST /api/dashboard/tvs/groups/[id]/announce
 * Proxies bulk announcement to the smart service.
 * Requires 3+ TVs in the group (enforced by smart service).
 *
 * Body: { text: string, expires_in_minutes?: number }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authHeader = req.headers.get('authorization') ?? '';

  const rawBody = await req.json().catch(() => null);
  const parsedAnnounce = TvAnnounceSchema.safeParse(rawBody);
  if (!parsedAnnounce.success) {
    return NextResponse.json(
      { error: 'invalid_input', details: parsedAnnounce.error.flatten() },
      { status: 400 },
    );
  }
  const body = parsedAnnounce.data;

  try {
    const upstream = await fetch(`${SMART_BASE}/groups/${id}/announce`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!upstream.ok) {
      const errText = await upstream.text().catch(() => '');
      Sentry.captureException(new Error(`[tvs/groups/announce] upstream error: ${upstream.status} ${errText}`));
      console.error('[tvs/groups/announce] upstream error:', upstream.status, errText);
      return NextResponse.json(
        { error: `Upstream error ${upstream.status}` },
        { status: upstream.status },
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    Sentry.captureException(err);
    console.error('[tvs/groups/announce] POST error:', err);
    return NextResponse.json({ error: 'Failed to send announcement' }, { status: 500 });
  }
}
