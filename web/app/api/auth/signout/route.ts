/**
 * app/api/auth/signout/route.ts — P2-E1-W01 Track E
 *
 * Purpose: Clear httpOnly auth cookies and invalidate the refresh token at
 *          Hasura Auth (revokes the server-side session).
 * Inputs:  POST (no body needed — refresh token is read from pc-refresh cookie)
 * Outputs: 200 OK; expires all three auth cookies
 * Constraints:
 *   - Reads pc-refresh from cookie (httpOnly) — client code cannot read this.
 *   - Best-effort revocation: cookie expiry happens even if Hasura call fails.
 * SPORT: P2-E1-W01 Track E (praycalc session httpOnly cookie).
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL ?? 'https://auth.ummat.dev'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('pc-refresh')?.value

  // Best-effort: try to revoke at Hasura Auth.
  if (refreshToken) {
    await fetch(`${AUTH_URL}/signout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    }).catch(() => null) // non-fatal — cookie expiry handles client-side logout
  }

  const res = NextResponse.json({ ok: true }, { status: 200 })

  // Expire all auth cookies immediately.
  const expire = 'Max-Age=0; Path=/; HttpOnly; SameSite=Strict'
  res.headers.append('Set-Cookie', `pc-jwt=; ${expire}`)
  res.headers.append('Set-Cookie', `pc-refresh=; ${expire}`)
  res.headers.append('Set-Cookie', `pc-auth=; Max-Age=0; Path=/; SameSite=Lax`)

  return res
}
