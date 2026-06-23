/**
 * S-C-S05-T05b — /api/consent for PrayCalc (praycalc.com).
 *
 * Delegates to the shared handler in @ummat/consent. Records ALL consent
 * grants/withdrawals into lg_consent_record (insert-only, GDPR Art 7).
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { handleConsentRequest, type ConsentHandlerInput } from '@ummat/consent'

// Minimal schema: consent body contains at least consentType; shared handler validates deeply.
const ConsentPostSchema = z.object({
  consentType: z.string().min(1),
  granted:     z.boolean(),
}).passthrough()

const DOMAIN = 'praycalc.com'

const HASURA_ENDPOINT =
  process.env.HASURA_ADMIN_URL ??
  process.env.NEXT_PUBLIC_HASURA_URL ??
  'https://api.ummat.dev/v1/graphql'
const HASURA_ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? ''

function userIdFromJwt(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  try {
    const token = authHeader.slice(7)
    const payload = token.split('.')[1]
    if (!payload) return null
    const b64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const decoded = JSON.parse(Buffer.from(b64, 'base64').toString('utf-8')) as {
      sub?: string
      'https://hasura.io/jwt/claims'?: { 'x-hasura-user-id'?: string }
    }
    const hasuraUid = decoded['https://hasura.io/jwt/claims']?.['x-hasura-user-id']
    return hasuraUid ?? decoded.sub ?? null
  } catch {
    return null
  }
}

async function buildInput(
  req: NextRequest,
  method: ConsentHandlerInput['method']
): Promise<ConsentHandlerInput> {
  const userId = userIdFromJwt(req.headers.get('authorization'))
  const countryCode = req.headers.get('cf-ipcountry') ?? null
  let body: unknown = undefined
  if (method === 'POST') {
    const rawBody = await req.json().catch(() => null)
    const parsed = ConsentPostSchema.safeParse(rawBody)
    body = parsed.success ? parsed.data : rawBody  // pass to shared handler either way; it validates further
  }
  return {
    method,
    headers: req.headers,
    body,
    userId,
    countryCode,
    domain: DOMAIN,
    hasura: { endpoint: HASURA_ENDPOINT, adminSecret: HASURA_ADMIN_SECRET },
  }
}

async function dispatch(req: NextRequest, method: ConsentHandlerInput['method']) {
  if (!HASURA_ADMIN_SECRET) {
    return NextResponse.json(
      { error: 'misconfigured: HASURA_GRAPHQL_ADMIN_SECRET missing', code: 'CONFIG' },
      { status: 500 }
    )
  }
  const input = await buildInput(req, method)
  const result = await handleConsentRequest(input)
  return NextResponse.json(result.body, { status: result.status })
}

export async function POST(req: NextRequest) { return dispatch(req, 'POST') }
export async function GET(req: NextRequest) { return dispatch(req, 'GET') }
export async function DELETE(req: NextRequest) { return dispatch(req, 'DELETE') }
