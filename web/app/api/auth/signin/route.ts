/**
 * app/api/auth/signin/route.ts — T09 (SEC-HARDENING) + P2-E1-W01 Track E
 *
 * Purpose: Server-side proxy for Hasura Auth sign-in with Cloudflare Turnstile.
 *          Sets the JWT access token in an httpOnly cookie (never exposed to JS).
 * Inputs:  POST { email, password, turnstileToken }
 * Outputs: JSON session profile (no tokens) + Set-Cookie: pc-jwt (httpOnly)
 * Constraints:
 *   - pc-jwt cookie: HttpOnly, Secure, SameSite=Strict — not readable by JS.
 *   - JWT token is NOT returned in the response body — only the non-sensitive profile.
 *   - Refresh token stored separately in pc-refresh (httpOnly, SameSite=Strict).
 *   - Turnstile verified server-side, fail-closed in production.
 * SPORT: P2-E1-W01 Track E (praycalc session httpOnly cookie).
 *
 * Note: Hasura Auth (nhost) uses /signin/email-password (no /v1/auth/ prefix).
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyTurnstileToken } from '@/lib/turnstile'

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.ummat.dev'

/** One year in seconds — matches the refresh token lifetime. */
const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 365
/** 15 minutes — matches Hasura Auth default access token lifetime. */
const ACCESS_COOKIE_MAX_AGE = 60 * 15

const SigninSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  turnstileToken: z.string().optional(),
})

function cookieOptions(maxAge: number, isProd: boolean): string {
  const parts = [
    `Max-Age=${maxAge}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
  ]
  if (isProd) parts.push('Secure')
  return parts.join('; ')
}

export async function POST(req: NextRequest) {
  const rawBody = await req.json().catch(() => null)
  const parsed = SigninSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_input', details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const body = parsed.data

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

  const data = (await authRes.json().catch(() => ({}))) as {
    session?: {
      accessToken: string
      refreshToken: string
      accessTokenExpiresIn: number
      user: {
        id: string
        email: string
        displayName?: string
        avatarUrl?: string | null
      }
    }
    error?: string
  }

  if (!authRes.ok) {
    return NextResponse.json(
      { error: data.error ?? 'Invalid email or password.' },
      { status: authRes.status },
    )
  }

  const session = data.session
  if (!session?.accessToken) {
    return NextResponse.json({ error: 'Auth service returned no token' }, { status: 502 })
  }

  // Return non-sensitive profile only — tokens go into httpOnly cookies.
  const profile = {
    userId: session.user.id,
    email: session.user.email,
    displayName: session.user.displayName ?? session.user.email.split('@')[0],
    avatarUrl: session.user.avatarUrl ?? null,
    accessTokenExpiresAt: Date.now() + (session.accessTokenExpiresIn ?? 900) * 1000,
  }

  const res = NextResponse.json(profile, { status: 200 })

  // httpOnly JWT cookie — not readable by JavaScript.
  res.headers.append(
    'Set-Cookie',
    `pc-jwt=${session.accessToken}; ${cookieOptions(ACCESS_COOKIE_MAX_AGE, isProd)}`,
  )
  // httpOnly refresh token cookie — not readable by JavaScript.
  res.headers.append(
    'Set-Cookie',
    `pc-refresh=${session.refreshToken}; ${cookieOptions(REFRESH_COOKIE_MAX_AGE, isProd)}`,
  )
  // Middleware signal cookie — readable by JS, carries no sensitive data.
  res.headers.append(
    'Set-Cookie',
    `pc-auth=1; Max-Age=${REFRESH_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${isProd ? '; Secure' : ''}`,
  )

  return res
}
