// Vercel cron job: runs every Monday at 6am UTC
// Sends weekly prayer times digest to all confirmed subscribers
// Vercel cron config in vercel.json

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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
    console.error('Digest cron failed:', err);
    return NextResponse.json({ error: 'Failed to trigger digest' }, { status: 500 });
  }
}
