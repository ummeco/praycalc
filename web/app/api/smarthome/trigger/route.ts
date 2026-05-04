/**
 * POST /api/smarthome/trigger
 *
 * Triggered by nSelf cron plugin at prayer time for smart home routines.
 * HMAC-SHA256 signature required (SMART_HOME_WEBHOOK_HMAC_SECRET).
 *
 * Body: { user_id, routine_id, trigger_time }
 * Response: { ok: true }
 */

import { type NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { adminClient } from '@/lib/graphql'

const HMAC_SECRET = process.env.SMART_HOME_WEBHOOK_HMAC_SECRET

const GET_ROUTINE = `
  query GetRoutine($id: uuid!) {
    pc_smart_home_routines_by_pk(id: $id) {
      id
      user_id
      name
      trigger_prayer
      platform
      device_ids
      action
      duration_minutes
      after_action
      enabled
    }
  }
`

function verifyHmac(req: NextRequest, body: string): boolean {
  if (!HMAC_SECRET) return false
  const signature = req.headers.get('x-nself-signature') ?? ''
  const expected = createHmac('sha256', HMAC_SECRET).update(body).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'))
  } catch {
    return false
  }
}

async function dispatchRoutine(routine: {
  platform: string
  device_ids: string[] | null
  action: Record<string, unknown>
  duration_minutes: number | null
  after_action: string
}) {
  // Dispatch to smart home platform
  // Platform-specific execution via nSelf cron plugin webhook chain
  // In v1.1: platform routing logged; actual device control wired in v1.2 Cluster B
  const logPayload = {
    platform: routine.platform,
    deviceCount: routine.device_ids?.length ?? 0,
    action: routine.action,
    durationMinutes: routine.duration_minutes,
    afterAction: routine.after_action,
    dispatchedAt: new Date().toISOString(),
  }
  console.info('[smarthome/trigger] dispatching routine', logPayload)
  // TODO(v1.2-cluster-b): integrate platform SDK calls (Google Home API, Alexa Smart Home API, HomeKit)
  return { dispatched: true, ...logPayload }
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text()

  if (!verifyHmac(req, rawBody)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let body: { user_id?: string; routine_id?: string; trigger_time?: string }
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { user_id, routine_id, trigger_time } = body
  if (!user_id || !routine_id) {
    return NextResponse.json({ error: 'user_id and routine_id required' }, { status: 400 })
  }

  try {
    const result = await adminClient.request<{
      pc_smart_home_routines_by_pk: {
        id: string; user_id: string; enabled: boolean;
        platform: string; device_ids: string[] | null; action: Record<string, unknown>;
        duration_minutes: number | null; after_action: string
      } | null
    }>(GET_ROUTINE, { id: routine_id })

    const routine = result.pc_smart_home_routines_by_pk
    if (!routine || routine.user_id !== user_id || !routine.enabled) {
      return NextResponse.json({ error: 'Routine not found or disabled' }, { status: 404 })
    }

    const dispatch = await dispatchRoutine(routine)
    return NextResponse.json({ ok: true, trigger_time, dispatch })
  } catch (err) {
    console.error('[smarthome/trigger] error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
