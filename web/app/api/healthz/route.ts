import { NextResponse } from 'next/server';

const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || 'unknown';

export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}

export const runtime = 'edge';
