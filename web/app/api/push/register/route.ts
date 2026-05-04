/**
 * POST /api/push/register
 *
 * Registers or updates a push token for a device. Anonymous devices allowed
 * (no auth required). Bearer JWT optional — links token to a user account
 * when present.
 *
 * Body: { device_id, platform, token, permission_state }
 * Response: { id, created_at }
 */

import { type NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/graphql'
import { verifyJwt } from '@/lib/auth'

const VALID_PLATFORMS = new Set([
  'ios', 'android', 'watch_ios', 'watch_android',
  'macos', 'windows', 'tv_android', 'tv_apple', 'alexa',
])

const VALID_PERMISSION_STATES = new Set([
  'granted', 'denied', 'provisional', 'not_determined',
])

const UPSERT_PUSH_TOKEN = `
  mutation UpsertPushToken(
    $deviceId: String!
    $platform: String!
    $token: String!
    $permissionState: String!
    $userId: uuid
  ) {
    insert_pc_push_tokens_one(
      object: {
        device_id: $deviceId
        platform: $platform
        token: $token
        permission_state: $permissionState
        user_id: $userId
        last_seen_at: "now()"
      }
      on_conflict: {
        constraint: pc_push_tokens_device_platform_unique
        update_columns: [token, permission_state, last_seen_at, user_id]
      }
    ) {
      id
      created_at
    }
  }
`

export async function POST(req: NextRequest) {
  let userId: string | null = null

  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    const claims = await verifyJwt(authHeader.slice(7))
    userId = claims?.['x-hasura-user-id'] ?? null
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { device_id, platform, token, permission_state } = body as {
    device_id?: string
    platform?: string
    token?: string
    permission_state?: string
  }

  if (!device_id || typeof device_id !== 'string') {
    return NextResponse.json({ error: 'device_id required' }, { status: 400 })
  }
  if (!platform || !VALID_PLATFORMS.has(platform)) {
    return NextResponse.json({ error: `platform must be one of: ${[...VALID_PLATFORMS].join(', ')}` }, { status: 400 })
  }
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ error: 'token required' }, { status: 400 })
  }
  if (!permission_state || !VALID_PERMISSION_STATES.has(permission_state)) {
    return NextResponse.json({ error: `permission_state must be one of: ${[...VALID_PERMISSION_STATES].join(', ')}` }, { status: 400 })
  }

  try {
    const result = await adminClient.request<{ insert_pc_push_tokens_one: { id: string; created_at: string } }>(
      UPSERT_PUSH_TOKEN,
      { deviceId: device_id, platform, token, permissionState: permission_state, userId }
    )
    return NextResponse.json(result.insert_pc_push_tokens_one, { status: 200 })
  } catch (err) {
    console.error('[push/register] upsert error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
