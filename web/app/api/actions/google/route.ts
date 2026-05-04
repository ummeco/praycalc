// praycalc/web/app/api/actions/google/route.ts — Google Actions fulfillment endpoint
// Spec §15.3, S19-G T34
//
// POST /api/actions/google
//
// Receives Google Actions webhook requests, validates them, and delegates
// to the fulfillment app defined in praycalc/smarthome/google/fulfillment/index.ts.
// Account linking: OAuth via Ummat Auth (auth.ummat.dev).

import { NextRequest, NextResponse } from 'next/server';
import { app } from '../../../../../smarthome/google/fulfillment/index';

export const runtime = 'nodejs';

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const body = await req.json() as Record<string, unknown>;

    // Basic request validation: Google Actions sends a handler name
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    // The @assistant/conversation SDK's handler converts the request body and returns
    // the response. We adapt it to the Next.js request/response model here.
    const result = await new Promise<Record<string, unknown>>((resolve, reject) => {
      // Simulate an Express-style request / response for the SDK
      const fakeReq = {
        method: 'POST',
        body,
        headers: Object.fromEntries(req.headers.entries()),
        get: (h: string) => req.headers.get(h),
      };

      const chunks: Buffer[] = [];
      const fakeRes = {
        statusCode: 200,
        _headers: {} as Record<string, string>,
        status(code: number) { this.statusCode = code; return this; },
        set(key: string, val: string) { this._headers[key] = val; return this; },
        send(data: unknown) {
          try {
            resolve(typeof data === 'string' ? JSON.parse(data) as Record<string, unknown> : data as Record<string, unknown>);
          } catch {
            resolve({ raw: data });
          }
        },
        json(data: unknown) {
          resolve(data as Record<string, unknown>);
        },
        end(data?: unknown) {
          if (data) {
            try {
              resolve(typeof data === 'string' ? JSON.parse(data) as Record<string, unknown> : data as Record<string, unknown>);
            } catch {
              resolve({});
            }
          } else {
            resolve({});
          }
        },
      };

      try {
        // @assistant/conversation SDK's Express middleware
        (app as unknown as {
          handler: (
            req: typeof fakeReq,
            res: typeof fakeRes,
            next: (err?: Error) => void
          ) => void
        }).handler(fakeReq, fakeRes, (err?: Error) => {
          if (err) reject(err); else resolve({});
        });
      } catch (err) {
        reject(err);
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Google Actions fulfillment error:', error);
    return NextResponse.json(
      {
        session: { id: 'error-session', languageCode: 'en' },
        prompt: {
          override: true,
          firstSimple: {
            speech: "I'm having trouble right now. Please try again.",
            text:   "I'm having trouble right now. Please try again.",
          },
        },
      },
      { status: 200 }, // Google Actions expects 200 even on error
    );
  }
}

// Google sends GET for health-check / verification
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: 'ok', service: 'praycalc-google-actions' });
}
