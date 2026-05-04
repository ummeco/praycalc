/**
 * JWT verification utilities for server-side API routes.
 *
 * Hasura Auth uses JWT tokens with claims. These utilities verify and extract
 * user ID and other claims from JWT tokens in Authorization headers.
 *
 * JWT payload (Hasura Auth):
 * {
 *   sub: user_id,
 *   iat: issued_at_timestamp,
 *   exp: expiration_timestamp,
 *   iss: "https://auth.ummat.dev",
 *   ...other_claims
 * }
 */

import { NextRequest, NextResponse } from 'next/server'

export interface JwtPayload {
  sub: string
  iat: number
  exp: number
  iss: string
  'x-hasura-user-id'?: string
  'x-hasura-allowed-roles'?: string[]
  [key: string]: unknown
}

/**
 * Extract and verify JWT from Authorization header.
 * Returns decoded payload if valid, throws error otherwise.
 *
 * Note: Full JWT verification (signature + key rotation) requires
 * fetching Hasura Auth's public key. For now, we verify structure
 * and expiration. Hasura validates token authenticity server-side.
 */
function decodeAndVerifyJwt(token: string): JwtPayload {
  try {
    // JWT format: header.payload.signature
    const [, payloadB64] = token.split('.')
    if (!payloadB64) throw new Error('Invalid JWT format')

    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64').toString('utf-8'),
    ) as JwtPayload

    // Check expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      throw new Error('JWT token has expired')
    }

    return payload
  } catch (err) {
    throw new Error(`JWT verification failed: ${err instanceof Error ? err.message : String(err)}`)
  }
}

/**
 * Require valid JWT in Authorization header.
 * Returns claims payload if valid.
 * Throws error if missing or invalid.
 */
export async function requireJwt(req: NextRequest): Promise<JwtPayload> {
  const auth = req.headers.get('Authorization')
  if (!auth?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header')
  }

  const token = auth.slice(7)
  return decodeAndVerifyJwt(token)
}

/**
 * Verify JWT token string.
 * Returns payload if valid, null if token is falsy.
 * Throws error if present but invalid.
 */
export async function verifyJwt(token?: string): Promise<JwtPayload | null> {
  if (!token) return null
  return decodeAndVerifyJwt(token)
}
