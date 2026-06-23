/**
 * app/api/auth/token-set/route.ts — P2-E1-W01 Track E
 *
 * Purpose: Accept a token pair (from OAuth callback or TV pairing) and set
 *          httpOnly cookies for the JWT + refresh token. Returns the non-sensitive
 *          profile only — tokens never returned to the client.
 * Inputs:  POST { accessToken, refreshToken, accessTokenExpiresAt, user }
 * Outputs: JSON profile (no tokens) + Set-Cookie: pc-jwt + pc-refresh (httpOnly)
 * Constraints:
 *   - Used only by OAuth callback and TV device pairing flows where the client
 *     temporarily holds the token before handing it to the server.
 *   - The JWT is verified server-side (jwtVerify, HS256) before setting the cookie.
 *   - isOwner / isUmmatPlus derived from verified JWT claims, not user input.
 * SPORT: P2-E1-W01 Track E (praycalc session httpOnly cookie).
 */

import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { jwtVerify } from 'jose'

const ACCESS_COOKIE_MAX_AGE = 60 * 15
const REFRESH_COOKIE_MAX_AGE = 60 * 60 * 24 * 365

const TokenSetSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  accessTokenExpiresAt: z.number().optional(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email(),
    displayName: z.string().optional(),
    avatarUrl: z.string().url().nullable().optional(),
  }),
})

function getJwtSecret(): Uint8Array {
  const secret = process.env.HASURA_JWT_SECRET
  if (!secret) throw new Error('HASURA_JWT_SECRET is required')
  return new TextEncoder().encode(secret)
}

function isProd(): boolean {
  return process.env.NODE_ENV === 'production'
}

function cookieOptions(maxAge: number): string {
  const parts = [`Max-Age=${maxAge}`, 'Path=/', 'HttpOnly', 'SameSite=Strict']
  if (isProd()) parts.push('Secure')
  return parts.join('; ')
}

export async function POST(req: NextRequest) {
  const rawBody = await req.json().catch(() => null)
  const parsed = TokenSetSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_input', details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const body = parsed.data

  // Verify the JWT before trusting it — prevents token forgery.
  let payload: Record<string, unknown>
  try {
    const secret = getJwtSecret()
    const { payload: p } = await jwtVerify(body.accessToken, secret, { algorithms: ['HS256'] })
    payload = p as Record<string, unknown>
  } catch {
    return NextResponse.json({ error: 'Invalid access token' }, { status: 401 })
  }

  // Extract claims from verified JWT.
  const claims = (payload['https://hasura.io/jwt/claims'] ?? {}) as Record<string, unknown>
  const allowedRoles = (claims['x-hasura-allowed-roles'] as string[] | undefined) ?? []
  const isOwner = allowedRoles.includes('owner') || claims['x-hasura-default-role'] === 'owner'
  const isUmmatPlus = isOwner || allowedRoles.includes('ummat_plus')

  const profile = {
    userId: body.user.id,
    email: body.user.email,
    displayName: body.user.displayName ?? body.user.email.split('@')[0],
    avatarUrl: body.user.avatarUrl ?? null,
    accessTokenExpiresAt: body.accessTokenExpiresAt ?? Date.now() + 900_000,
    isOwner,
    isUmmatPlus,
  }

  const res = NextResponse.json(profile, { status: 200 })
  res.headers.append('Set-Cookie', `pc-jwt=${body.accessToken}; ${cookieOptions(ACCESS_COOKIE_MAX_AGE)}`)
  res.headers.append('Set-Cookie', `pc-refresh=${body.refreshToken}; ${cookieOptions(REFRESH_COOKIE_MAX_AGE)}`)
  res.headers.append(
    'Set-Cookie',
    `pc-auth=1; Max-Age=${REFRESH_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${isProd() ? '; Secure' : ''}`,
  )

  return res
}
