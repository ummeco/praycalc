// praycalc/web/app/api/actions/alexa/route.ts — Alexa fulfillment endpoint
// Spec §15.2, S19-G T33
//
// POST /api/actions/alexa
//
// Verifies Alexa request signature (SignatureCertChainUrl + Signature headers)
// then delegates to the Lambda handler or processes locally.
//
// Signature verification per ASK specification:
//   https://developer.amazon.com/en-US/docs/alexa/custom-skills/host-a-custom-skill-as-a-web-service.html
//
// The handler is the compiled Lambda from praycalc/smarthome/alexa/lambda/index.ts.
// For simplicity this route re-implements the handler inline to avoid a separate
// Lambda deployment — the Lambda artifact is also deployable to AWS Lambda if needed.

import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import https from 'https';

// ---------------------------------------------------------------------------
// Alexa signature verification
// ---------------------------------------------------------------------------

/**
 * Fetches the PEM certificate from Alexa's cert chain URL.
 * Caches in memory (process-scoped) to avoid repeated fetches.
 */
const _certCache = new Map<string, string>();

async function fetchCert(certUrl: string): Promise<string> {
  if (_certCache.has(certUrl)) return _certCache.get(certUrl)!;

  return new Promise<string>((resolve, reject) => {
    // Validate that the URL is from Amazon's CDN
    let url: URL;
    try {
      url = new URL(certUrl);
    } catch {
      reject(new Error('Invalid cert URL')); return;
    }

    if (url.hostname.toLowerCase() !== 's3.amazonaws.com'
        && !url.hostname.toLowerCase().endsWith('.s3.amazonaws.com')) {
      reject(new Error('Cert URL not from s3.amazonaws.com')); return;
    }
    if (url.protocol !== 'https:') {
      reject(new Error('Cert URL must be HTTPS')); return;
    }
    if (!url.pathname.startsWith('/echo.api/')) {
      reject(new Error('Cert path must start with /echo.api/')); return;
    }

    https.get(certUrl, (res) => {
      const chunks: Buffer[] = [];
      res.on('data', (c: Buffer) => chunks.push(c));
      res.on('end', () => {
        const pem = Buffer.concat(chunks).toString('utf8');
        _certCache.set(certUrl, pem);
        resolve(pem);
      });
      res.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Verifies the Alexa request timestamp (within 150 seconds of now).
 */
function verifyTimestamp(body: { request?: { timestamp?: string } }): boolean {
  const ts = body.request?.timestamp;
  if (!ts) return false;
  const diff = Math.abs(Date.now() - new Date(ts).getTime());
  return diff <= 150_000; // 150 seconds
}

/**
 * Verifies the Alexa request signature.
 * Returns true if valid, false otherwise.
 */
async function verifyAlexaSignature(
  certChainUrl: string,
  signature: string,
  rawBody: Buffer,
): Promise<boolean> {
  try {
    const pem    = await fetchCert(certChainUrl);
    const verify = crypto.createVerify('SHA1');
    verify.update(rawBody);
    return verify.verify(pem, signature, 'base64');
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export const runtime = 'nodejs'; // Signature verification needs Node crypto

export async function POST(req: NextRequest): Promise<NextResponse> {
  const rawBody = Buffer.from(await req.arrayBuffer());

  // Retrieve Alexa signature headers
  const certChainUrl = req.headers.get('SignatureCertChainUrl') ?? '';
  const signature    = req.headers.get('Signature') ?? '';

  // Verify signature (skip in local dev / test if env var is set)
  const skipVerify = process.env.ALEXA_SKIP_VERIFY === 'true';
  if (!skipVerify) {
    if (!certChainUrl || !signature) {
      return NextResponse.json({ error: 'Missing Alexa signature headers' }, { status: 400 });
    }
    const valid = await verifyAlexaSignature(certChainUrl, signature, rawBody);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid Alexa signature' }, { status: 403 });
    }
  }

  // Parse and verify timestamp
  let body: Record<string, unknown>;
  try {
    body = JSON.parse(rawBody.toString('utf8')) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!verifyTimestamp(body as { request?: { timestamp?: string } })) {
    return NextResponse.json({ error: 'Request timestamp out of range' }, { status: 400 });
  }

  // Validate skill ID
  const appId      = (body as { context?: { System?: { application?: { applicationId?: string } } } })
    .context?.System?.application?.applicationId ?? '';
  const skillId    = process.env.ALEXA_SKILL_ID ?? '';
  if (skillId && appId !== skillId) {
    return NextResponse.json({ error: 'Unauthorized skill ID' }, { status: 403 });
  }

  // Forward to Lambda handler (or process locally)
  // Since we're in Next.js we invoke the Lambda handler directly
  // (no HTTP hop needed when co-deployed on Vercel)
  try {
    const { handler } = await import(
      '../../../../smarthome/alexa/lambda/index'
    ) as { handler: (event: unknown, context: unknown, callback: (err: Error | null, result: unknown) => void) => void };

    const alexaResponse = await new Promise((resolve, reject) => {
      handler(body, {}, (err: Error | null, result: unknown) => {
        if (err) reject(err); else resolve(result);
      });
    });

    return NextResponse.json(alexaResponse);
  } catch (err) {
    console.error('Alexa Lambda error:', err);
    return NextResponse.json(
      {
        version: '1.0',
        response: {
          outputSpeech: {
            type: 'PlainText',
            text: "I'm having trouble right now. Please try again in a moment.",
          },
          shouldEndSession: true,
        },
      },
      { status: 200 }, // Alexa expects 200 even on error
    );
  }
}

// Alexa sends HEAD requests for endpoint validation
export async function HEAD(): Promise<NextResponse> {
  return new NextResponse(null, { status: 200 });
}
