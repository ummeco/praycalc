import { NextRequest, NextResponse } from 'next/server';

const SMART_BASE = `${process.env.NEXT_PUBLIC_SMART_SERVICE_URL ?? 'https://smart.praycalc.com'}/api/v1/tv`;

/**
 * GET /api/dashboard/tvs/[id]
 * Returns a single TV device from the smart service list, found by id.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authHeader = req.headers.get('authorization') ?? '';
  try {
    const upstream = await fetch(`${SMART_BASE.replace('/tv', '/tvs')}`, {
      headers: { Authorization: authHeader },
      next: { revalidate: 0 },
    });
    if (!upstream.ok) {
      return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: upstream.status });
    }
    const data = await upstream.json() as { devices?: unknown[] };
    const device = (data.devices ?? []).find((d: unknown) => (d as { id: string }).id === id);
    if (!device) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ device });
  } catch (err) {
    console.error('[GET /api/dashboard/tvs/[id]]', err);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}

/**
 * PATCH /api/dashboard/tvs/[id]
 * Renames a TV device.  Body: { device_name: string }
 */
export async function PATCH(
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
  try {
    const upstream = await fetch(`${SMART_BASE}/${id}`, {
      method: 'PATCH',
      headers: { Authorization: authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return NextResponse.json(
        { error: (data as { error?: string }).error ?? `Upstream ${upstream.status}` },
        { status: upstream.status },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[PATCH /api/dashboard/tvs/[id]]', err);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}

/**
 * DELETE /api/dashboard/tvs/[id]
 * Removes a TV device — clears it from the smart service in-memory registry and Hasura.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authHeader = req.headers.get('authorization') ?? '';

  try {
    const upstream = await fetch(`${SMART_BASE}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: authHeader },
    });
    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return NextResponse.json(
        { error: (data as { error?: string }).error ?? `Upstream ${upstream.status}` },
        { status: upstream.status },
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[DELETE /api/dashboard/tvs/[id]]', err);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 503 });
  }
}
