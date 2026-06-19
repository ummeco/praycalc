/**
 * cron-auth.ts — Cron endpoint authentication helper (PrayCalc).
 *
 * Purpose: Timing-safe verification of CRON_SECRET Bearer token for cron routes.
 * Inputs:  Authorization header value from incoming HTTP request.
 * Outputs: null (pass) or { status, body } error response descriptor.
 * Constraints:
 *   - crypto.timingSafeEqual prevents timing oracle attacks.
 *   - CRON_SECRET missing → 500 (config error, not auth failure).
 *   - Wrong/missing bearer → 401.
 *   - Never accepts 'Bearer undefined' or empty bearer.
 * SPORT: P2-E1-W01 Track E extended (cron-auth).
 */

import { timingSafeEqual } from 'crypto'

/**
 * Verify the Authorization: Bearer header against CRON_SECRET.
 * Returns null on success, or an error descriptor to return as a response.
 */
export function requireCronAuth(
  authorization: string | null | undefined,
): { status: 401 | 500; body: string } | null {
  const expected = process.env.CRON_SECRET
  if (!expected) {
    return { status: 500, body: JSON.stringify({ error: 'CRON_SECRET is not configured' }) }
  }

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return { status: 401, body: JSON.stringify({ error: 'Missing Authorization Bearer token' }) }
  }

  const provided = authorization.slice('Bearer '.length)
  if (!provided || provided === 'undefined') {
    return { status: 401, body: JSON.stringify({ error: 'Invalid Authorization Bearer token' }) }
  }

  const expectedBuf = Buffer.from(expected, 'utf8')
  const providedBuf = Buffer.from(provided, 'utf8')

  if (
    expectedBuf.length !== providedBuf.length ||
    !timingSafeEqual(expectedBuf, providedBuf)
  ) {
    return { status: 401, body: JSON.stringify({ error: 'Invalid Authorization Bearer token' }) }
  }

  return null
}
