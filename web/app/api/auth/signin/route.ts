// app/api/auth/signin/route.ts — T09 (SEC-HARDENING)
// Server-side proxy for Hasura Auth sign-in with Cloudflare Turnstile verification.
// Replaces the direct client→Hasura Auth call in auth-client.ts.
//
// Accepts:  POST { email, password, turnstileToken }
// Returns:  proxied Hasura Auth session response | { error }
//
// Note: Hasura Auth (nhost) uses /signin/email-password (no /v1/auth/ prefix).

import { NextRequest, NextResponse } from 'next/server'
import { verifyTurnstileToken } from '@/lib/turnstile'

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.ummat.dev'

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null) as {
    email?: string
    password?: string
    turnstileToken?: string
  } | null

  if (!body?.email || !body?.password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  // T09: Turnstile — fail closed in production
  const isProd = process.env.NODE_ENV === 'production'
  const turnstileOk = await verifyTurnstileToken(body.turnstileToken ?? '')
  if (!turnstileOk && isProd) {
    return NextResponse.json({ error: 'Bot check failed. Please try again.' }, { status: 400 })
  }

  const authRes = await fetch(`${AUTH_URL}/signin/email-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: body.email, password: body.password }),
  }).catch(() => null)

  if (!authRes) {
    return NextResponse.json({ error: 'Auth service unavailable' }, { status: 503 })
  }

  const data = (await authRes.json().catch(() => ({}))) as Record<string, unknown>

  if (!authRes.ok) {
    return NextResponse.json(
      { error: (data.message as string) ?? 'Invalid email or password.' },
      { status: authRes.status },
    )
  }

  return NextResponse.json(data, { status: 200 })
}
