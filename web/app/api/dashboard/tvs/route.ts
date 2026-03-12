import { NextRequest, NextResponse } from 'next/server';

const SMART_BASE = `${process.env.NEXT_PUBLIC_SMART_SERVICE_URL ?? 'https://smart.praycalc.com'}/api/v1/tv`;

/**
 * GET /api/dashboard/tvs
 * Proxies to smart service to list the authenticated user's TV devices.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') ?? '';

  if (!authHeader.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const upstream = await fetch(`${SMART_BASE}/`, {
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 0 },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: `Upstream error ${upstream.status}` },
        { status: upstream.status },
      );
    }

    const data = await upstream.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    console.error('[dashboard/tvs] GET error:', err);
    return NextResponse.json({ error: 'Failed to fetch TV devices' }, { status: 500 });
  }
}
