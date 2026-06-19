/**
 * app/api/auth/refresh/route.ts — P2-E1-W01 Track E
 *
 * Purpose: Refresh the access token using the httpOnly refresh cookie.
 *          Issues a new httpOnly pc-jwt cookie with the fresh access token.
 * Inputs:  POST (no body — reads pc-refresh cookie server-side)
 * Outputs: JSON profile (no tokens) + updated Set-Cookie: pc-jwt
 * Constraints:
 *   - Refresh token is never exposed to JavaScript.
 *   - Returns 401 if no refresh cookie or if Hasura Auth rejects the token.
 * SPORT: P2-E1-W01 Track E (praycalc session httpOnly cookie).
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.ummat.dev'
const ACCESS_COOKIE_MAX_AGE = 60 * 15

function isProd(): boolean {
  return process.env.NODE_ENV === 'production'
}

export async function POST(_req: NextRequest) {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('pc-refresh')?.value

  if (!refreshToken) {
    return NextResponse.json({ error: 'No session' }, { status: 401 })
  }

  const authRes = await fetch(`${AUTH_URL}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }).catch(() => null)

  if (!authRes?.ok) {
    // Refresh failed — expire cookies so client re-authenticates.
    const res = NextResponse.json({ error: 'Session expired' }, { status: 401 })
    res.headers.append('Set-Cookie', 'pc-jwt=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict')
    res.headers.append('Set-Cookie', 'pc-refresh=; Max-Age=0; Path=/; HttpOnly; SameSite=Strict')
    res.headers.append('Set-Cookie', 'pc-auth=; Max-Age=0; Path=/; SameSite=Lax')
    return res
  }

  const data = (await authRes.json().catch(() => ({}))) as {
    session?: {
      accessToken: string
      refreshToken: string
      accessTokenExpiresIn: number
      user: { id: string; email: string; displayName?: string; avatarUrl?: string | null }
    }
  }

  if (!data.session?.accessToken) {
    return NextResponse.json({ error: 'Auth service returned no token' }, { status: 502 })
  }

  const session = data.session
  const profile = {
    userId: session.user.id,
    email: session.user.email,
    displayName: session.user.displayName ?? session.user.email.split('@')[0],
    avatarUrl: session.user.avatarUrl ?? null,
    accessTokenExpiresAt: Date.now() + (session.accessTokenExpiresIn ?? 900) * 1000,
  }

  const res = NextResponse.json(profile, { status: 200 })
  const prod = isProd()
  res.headers.append(
    'Set-Cookie',
    `pc-jwt=${session.accessToken}; Max-Age=${ACCESS_COOKIE_MAX_AGE}; Path=/; HttpOnly; SameSite=Strict${prod ? '; Secure' : ''}`,
  )
  // Rotate refresh token if Hasura Auth returned a new one.
  if (session.refreshToken !== refreshToken) {
    res.headers.append(
      'Set-Cookie',
      `pc-refresh=${session.refreshToken}; Max-Age=${60 * 60 * 24 * 365}; Path=/; HttpOnly; SameSite=Strict${prod ? '; Secure' : ''}`,
    )
  }

  return res
}
