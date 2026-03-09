import { NextRequest, NextResponse } from 'next/server';

const SMART_BASE = 'https://smart.praycalc.com/api/v1/tv';

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

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!body.text || typeof body.text !== 'string' || !body.text.trim()) {
    return NextResponse.json({ error: 'text is required' }, { status: 400 });
  }
  if (body.text.length > 500) {
    return NextResponse.json(
      { error: 'text must be 500 characters or fewer' },
      { status: 400 },
    );
  }

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
      console.error('[tvs/groups/announce] upstream error:', upstream.status, errText);
      return NextResponse.json(
        { error: `Upstream error ${upstream.status}` },
        { status: upstream.status },
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('[tvs/groups/announce] POST error:', err);
    return NextResponse.json({ error: 'Failed to send announcement' }, { status: 500 });
  }
}
