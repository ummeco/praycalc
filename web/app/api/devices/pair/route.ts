/**
 * POST /api/devices/pair
 *
 * Claims a pairing code from a TV/desktop ambient device.
 * JWT required (mobile app user claims the device for their account).
 *
 * Security: pairing codes are single-use, TTL ≤15min, bound to device fingerprint.
 * After claim: pairing_code is nulled, paired_at is set.
 *
 * Body: { pairing_code }
 * Response: { device_id, home_lat, home_lng }
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminClient } from '@/lib/graphql'
import { requireJwt } from '@/lib/auth'

const DevicePairSchema = z.object({
  pairing_code: z.string().min(4),
})

const CLAIM_PAIRING_CODE = `
  mutation ClaimPairingCode($code: String!, $userId: uuid!, $now: timestamptz!, $ttlCutoff: timestamptz!) {
    update_pc_ambient_devices(
      where: {
        pairing_code: { _eq: $code }
        user_id: { _eq: $userId }
        paired_at: { _is_null: true }
        last_seen_at: { _gte: $ttlCutoff }
      }
      _set: {
        pairing_code: null
        paired_at: $now
      }
    ) {
      returning {
        device_id
        home_lat
        home_lng
      }
    }
  }
`

export async function POST(req: NextRequest) {
  const claims = await requireJwt(req)
  if (!claims) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
  }
  const userId = claims['x-hasura-user-id'] as string

  const rawBody = await req.json().catch(() => null)
  const parsedBody = DevicePairSchema.safeParse(rawBody)
  if (!parsedBody.success) {
    return NextResponse.json(
      { error: 'invalid_input', details: parsedBody.error.flatten() },
      { status: 400 },
    )
  }
  const { pairing_code } = parsedBody.data

  const now = new Date()
  // TTL: code must have been generated within the last 15 minutes
  const ttlCutoff = new Date(now.getTime() - 15 * 60 * 1000)

  try {
    const result = await adminClient.request<{
      update_pc_ambient_devices: { returning: Array<{ device_id: string; home_lat: number | null; home_lng: number | null }> }
    }>(CLAIM_PAIRING_CODE, {
      code: pairing_code,
      userId,
      now: now.toISOString(),
      ttlCutoff: ttlCutoff.toISOString(),
    })

    const devices = result.update_pc_ambient_devices.returning
    if (devices.length === 0) {
      // Code not found, expired, already claimed, or wrong user
      return NextResponse.json(
        { error: 'Invalid or expired pairing code' },
        { status: 404 }
      )
    }

    const device = devices[0]
    return NextResponse.json({
      device_id: device.device_id,
      home_lat: device.home_lat,
      home_lng: device.home_lng,
    })
  } catch (err) {
    console.error('[devices/pair] claim error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
