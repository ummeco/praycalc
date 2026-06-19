/**
 * app/api/cron/digest/route.ts — Weekly prayer times digest cron.
 *
 * Vercel cron job: runs every Monday at 6am UTC.
 * Sends weekly prayer times digest to all confirmed subscribers.
 * Auth: timing-safe CRON_SECRET verification (P2-E1-W01 Track E).
 */

import * as Sentry from '@sentry/nextjs';
import { NextRequest, NextResponse } from 'next/server';
import { requireCronAuth } from '@/lib/cron-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Auth: timing-safe CRON_SECRET verification (P2-E1-W01 Track E)
  const authError = requireCronAuth(req.headers.get('authorization'));
  if (authError) {
    return new NextResponse(authError.body, {
      status: authError.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // In production: fetch confirmed subscribers and send digest via smart service
  // The smart service handles email via Elastic Email
  try {
    const res = await fetch(`${process.env.SMART_API_URL}/api/v1/digest/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.SMART_API_KEY ?? '',
      },
    });
    const data = await res.json();
    return NextResponse.json({ sent: data.count, status: 'ok' });
  } catch (err) {
    Sentry.captureException(err);
    console.error('Digest cron failed:', err);
    return NextResponse.json({ error: 'Failed to trigger digest' }, { status: 500 });
  }
}
