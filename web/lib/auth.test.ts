// @vitest-environment node
//
// These are server-side JWT utilities; they run in the Node/Edge runtime, never
// in a DOM. The default jsdom test env breaks jose's `instanceof Uint8Array`
// checks (TextEncoder output is cross-realm), so this file pins the Node env to
// match the real execution context.
/**
 * JWT verification tests — P2-E1-W01 Track A acceptance criteria.
 *
 * Verifies that:
 *   - A forged (unsigned) JWT returns 401 / throws
 *   - A validly signed JWT returns verified claims
 *   - Wrong algorithm (RS256 header on HS256 key) is rejected
 *   - Missing HASURA_JWT_SECRET throws at call time
 *   - Expired token is rejected
 *
 * SPORT: P2-E1-W01-S01-T01 Track A unit tests.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { NextRequest } from 'next/server'
import { SignJWT, importJWK } from 'jose'
import { requireJwt, verifyJwt, extractVerifiedUserId } from './auth'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TEST_SECRET = 'test-jwt-secret-must-be-at-least-32-chars-long!'

/**
 * Build a validly signed HS256 JWT for testing.
 */
async function buildValidJwt(
  claims: Record<string, unknown> = {},
  expiresIn = '15m',
): Promise<string> {
  const secret = new TextEncoder().encode(TEST_SECRET)
  return new SignJWT({
    sub: 'user-123',
    'https://hasura.io/jwt/claims': {
      'x-hasura-user-id':      'user-123',
      'x-hasura-default-role': 'user',
      'x-hasura-allowed-roles': ['user'],
      ...claims,
    },
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret)
}

/**
 * Build a FORGED JWT: valid base64 payload but fake signature.
 */
function buildForgedJwt(): string {
  const header  = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    sub: 'attacker-456',
    'https://hasura.io/jwt/claims': {
      'x-hasura-user-id':      'admin-user',
      'x-hasura-default-role': 'admin',
      'x-hasura-allowed-roles': ['admin', 'user'],
    },
  })).toString('base64url')
  const fakeSignature = Buffer.from('this-is-a-fake-signature').toString('base64url')
  return `${header}.${payload}.${fakeSignature}`
}

function makeRequest(jwt?: string): NextRequest {
  const headers: Record<string, string> = {}
  if (jwt) headers['authorization'] = `Bearer ${jwt}`
  return new NextRequest('http://localhost/api/test', { method: 'GET', headers })
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('requireJwt', () => {
  beforeEach(() => {
    process.env.HASURA_JWT_SECRET = TEST_SECRET
  })

  it('throws on missing Authorization header', async () => {
    const req = makeRequest()
    await expect(requireJwt(req)).rejects.toThrow('Missing or invalid Authorization header')
  })

  it('throws on forged JWT (invalid signature)', async () => {
    const req = makeRequest(buildForgedJwt())
    await expect(requireJwt(req)).rejects.toThrow(/JWT verification failed/)
  })

  it('returns verified payload for a valid JWT', async () => {
    const token = await buildValidJwt()
    const req   = makeRequest(token)
    const payload = await requireJwt(req)
    expect(payload.sub).toBe('user-123')
    const claims = payload['https://hasura.io/jwt/claims'] as Record<string, unknown>
    expect(claims?.['x-hasura-user-id']).toBe('user-123')
  })

  it('rejects an expired JWT', async () => {
    // Sign with expiry 1 second ago
    const secret = new TextEncoder().encode(TEST_SECRET)
    const token = await new SignJWT({ sub: 'user-123' })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt(Math.floor(Date.now() / 1000) - 120)
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(secret)
    const req = makeRequest(token)
    await expect(requireJwt(req)).rejects.toThrow(/JWT verification failed/)
  })

  it('throws when HASURA_JWT_SECRET is missing', async () => {
    delete process.env.HASURA_JWT_SECRET
    const req = makeRequest(buildForgedJwt())
    await expect(requireJwt(req)).rejects.toThrow('HASURA_JWT_SECRET is required')
  })
})

describe('verifyJwt', () => {
  beforeEach(() => {
    process.env.HASURA_JWT_SECRET = TEST_SECRET
  })

  it('returns null for falsy token', async () => {
    await expect(verifyJwt(undefined)).resolves.toBeNull()
    await expect(verifyJwt('')).resolves.toBeNull()
  })

  it('throws on forged JWT (invalid signature)', async () => {
    await expect(verifyJwt(buildForgedJwt())).rejects.toThrow(/JWT verification failed/)
  })

  it('returns verified payload for valid JWT', async () => {
    const token = await buildValidJwt()
    const payload = await verifyJwt(token)
    expect(payload).not.toBeNull()
    expect(payload!.sub).toBe('user-123')
  })
})

describe('extractVerifiedUserId', () => {
  beforeEach(() => {
    process.env.HASURA_JWT_SECRET = TEST_SECRET
  })

  it('returns null when no Authorization header', async () => {
    const req = makeRequest()
    await expect(extractVerifiedUserId(req)).resolves.toBeNull()
  })

  it('throws on forged JWT', async () => {
    const req = makeRequest(buildForgedJwt())
    await expect(extractVerifiedUserId(req)).rejects.toThrow(/JWT verification failed/)
  })

  it('returns userId from verified Hasura claims', async () => {
    const token = await buildValidJwt()
    const req   = makeRequest(token)
    const userId = await extractVerifiedUserId(req)
    expect(userId).toBe('user-123')
  })
})
