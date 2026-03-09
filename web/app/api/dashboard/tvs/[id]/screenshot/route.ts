import { NextRequest, NextResponse } from 'next/server';

const SMART_BASE = 'https://smart.praycalc.com/api/v1/tv';

/**
 * GET /api/dashboard/tvs/[id]/screenshot
 * Fetches the latest screenshot URL for a TV from the smart service.
 *
 * Returns: { imageUrl: string | null, capturedAt: string | null }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const authHeader = req.headers.get('authorization') ?? '';

  try {
    const upstream = await fetch(`${SMART_BASE}/${id}/screenshot`, {
      headers: {
        Authorization: authHeader,
      },
      next: { revalidate: 0 },
    });

    if (!upstream.ok) {
      if (upstream.status === 404) {
        // TV exists but no screenshot available yet
        return NextResponse.json({ imageUrl: null, capturedAt: null });
      }
      return NextResponse.json(
        { error: `Upstream error ${upstream.status}` },
        { status: upstream.status },
      );
    }

    const data = await upstream.json() as { imageUrl?: string | null; capturedAt?: string | null };
    return NextResponse.json({
      imageUrl: data.imageUrl ?? null,
      capturedAt: data.capturedAt ?? null,
    });
  } catch (err: unknown) {
    console.error('[tvs/screenshot] GET error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch screenshot' },
      { status: 500 },
    );
  }
}
