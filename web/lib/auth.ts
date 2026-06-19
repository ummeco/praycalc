/**
 * JWT verification utilities for server-side API routes.
 *
 * Purpose: Cryptographically verify Hasura Auth JWTs using HASURA_JWT_SECRET (HS256).
 *          Signature verification is mandatory — no decode-only paths.
 * Inputs:  Bearer token from Authorization header, HASURA_JWT_SECRET env var.
 * Outputs: Verified JwtPayload or throws error (never returns unverified claims).
 * Constraints: Algorithms locked to HS256 only. Missing secret → startup-time fatal.
 * SPORT: P2-E1-W01 Track A security fix.
 */

import { jwtVerify, type JWTPayload } from 'jose'
import { NextRequest } from 'next/server'

export interface JwtPayload extends JWTPayload {
  sub: string
  'x-hasura-user-id'?: string
  'x-hasura-allowed-roles'?: string[]
  'https://hasura.io/jwt/claims'?: {
    'x-hasura-user-id'?: string
    'x-hasura-default-role'?: string
    'x-hasura-allowed-roles'?: string[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.HASURA_JWT_SECRET
  if (!secret) {
    throw new Error('[auth] HASURA_JWT_SECRET is required but not set')
  }
  return new TextEncoder().encode(secret)
}

/**
 * Verify a JWT token with HS256 signature verification.
 * Throws on invalid signature, expired token, wrong algorithm, or missing secret.
 * Never returns claims from an unverified token.
 */
async function verifyAndDecodeJwt(token: string): Promise<JwtPayload> {
  const secret = getJwtSecret()
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    })
    return payload as JwtPayload
  } catch (err) {
    throw new Error(
      `JWT verification failed: ${err instanceof Error ? err.message : String(err)}`,
    )
  }
}

/**
 * Require valid JWT in Authorization header.
 * Returns cryptographically verified claims payload.
 * Throws error if missing, invalid signature, expired, or wrong algorithm.
 */
export async function requireJwt(req: NextRequest): Promise<JwtPayload> {
  const auth = req.headers.get('Authorization') ?? req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) {
    throw new Error('Missing or invalid Authorization header')
  }
  const token = auth.slice(7)
  return verifyAndDecodeJwt(token)
}

/**
 * Verify JWT token string.
 * Returns verified payload if valid, null if token is falsy.
 * Throws error if present but invalid.
 */
export async function verifyJwt(token?: string): Promise<JwtPayload | null> {
  if (!token) return null
  return verifyAndDecodeJwt(token)
}

/**
 * Extract verified userId from Bearer token in Authorization header.
 * Returns null if header is absent; throws if token is present but invalid.
 */
export async function extractVerifiedUserId(req: NextRequest): Promise<string | null> {
  const auth = req.headers.get('Authorization') ?? req.headers.get('authorization')
  if (!auth?.startsWith('Bearer ')) return null
  const token = auth.slice(7)
  const payload = await verifyAndDecodeJwt(token)
  const hasuraClaims = payload['https://hasura.io/jwt/claims']
  return (
    (hasuraClaims?.['x-hasura-user-id'] as string | undefined) ??
    payload['x-hasura-user-id'] ??
    payload.sub ??
    null
  )
}
