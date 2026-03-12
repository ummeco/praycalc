import { type NextRequest } from 'next/server';

const SMART_BASE = `${process.env.NEXT_PUBLIC_SMART_SERVICE_URL ?? 'https://smart.praycalc.com'}/api/v1/tv`;

/**
 * GET /api/dashboard/tvs/stream
 * Proxies the smart service SSE stream for real-time TV status updates.
 * The client receives `device` events whenever a TV sends a heartbeat.
 */
export async function GET(req: NextRequest) {
  // EventSource can't set headers, so accept token from query param as fallback.
  const qToken = req.nextUrl.searchParams.get('t');
  const authHeader = req.headers.get('authorization')
    ?? (qToken ? `Bearer ${qToken}` : '');

  let upstream: Response;
  try {
    upstream = await fetch(`${SMART_BASE}/dashboard/stream`, {
      headers: { Authorization: authHeader },
      // @ts-expect-error — Node fetch supports duplex for streaming
      duplex: 'half',
    });
  } catch {
    return new Response('Service unavailable', { status: 503 });
  }

  if (!upstream.ok) {
    return new Response(`Upstream ${upstream.status}`, { status: upstream.status });
  }

  // Stream the SSE response body straight through to the client.
  return new Response(upstream.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
