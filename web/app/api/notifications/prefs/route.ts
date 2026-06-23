/**
 * GET  /api/notifications/prefs?device_id=
 * PUT  /api/notifications/prefs
 *
 * Fetch or update notification preferences per device. Auth optional.
 * device_id always required.
 */

import { type NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminClient } from '@/lib/graphql'
import { verifyJwt } from '@/lib/auth'

const VALID_PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const
const VALID_SOUNDS = ['default', 'adhan_makkah', 'beep', 'silent'] as const

const NotificationPrefsSchema = z.object({
  device_id:            z.string().min(1),
  prayer:               z.enum(VALID_PRAYERS),
  at_adhan:             z.boolean().optional(),
  pre_reminder_minutes: z.array(z.number().int()).optional(),
  sound:                z.enum(VALID_SOUNDS).optional(),
  vibrate:              z.boolean().optional(),
  enabled:              z.boolean().optional(),
})

const GET_PREFS = `
  query GetNotifPrefs($deviceId: String!) {
    pc_notification_prefs(where: { device_id: { _eq: $deviceId } }) {
      id
      prayer
      at_adhan
      pre_reminder_minutes
      sound
      vibrate
      enabled
    }
  }
`

const UPSERT_PREFS = `
  mutation UpsertNotifPrefs(
    $deviceId: String!
    $prayer: String!
    $atAdhan: Boolean!
    $preReminderMinutes: _int4!
    $sound: String!
    $vibrate: Boolean!
    $enabled: Boolean!
    $userId: uuid
  ) {
    insert_pc_notification_prefs_one(
      object: {
        device_id: $deviceId
        prayer: $prayer
        at_adhan: $atAdhan
        pre_reminder_minutes: $preReminderMinutes
        sound: $sound
        vibrate: $vibrate
        enabled: $enabled
        user_id: $userId
      }
      on_conflict: {
        constraint: pc_notification_prefs_device_id_prayer_key
        update_columns: [at_adhan, pre_reminder_minutes, sound, vibrate, enabled, user_id]
      }
    ) {
      id
      prayer
    }
  }
`

async function getUserId(req: NextRequest): Promise<string | null> {
  const authHeader = req.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  const claims = await verifyJwt(authHeader.slice(7))
  return claims?.['x-hasura-user-id'] ?? null
}

export async function GET(req: NextRequest) {
  const deviceId = req.nextUrl.searchParams.get('device_id')
  if (!deviceId) {
    return NextResponse.json({ error: 'device_id required' }, { status: 400 })
  }

  try {
    const result = await adminClient.request<{ pc_notification_prefs: unknown[] }>(
      GET_PREFS, { deviceId }
    )
    return NextResponse.json(result.pc_notification_prefs)
  } catch (err) {
    console.error('[notifications/prefs] GET error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const userId = await getUserId(req)

  const rawBody = await req.json().catch(() => null)
  const parsed = NotificationPrefsSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_input', details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const { device_id, prayer, at_adhan, pre_reminder_minutes, sound, vibrate, enabled } = parsed.data

  try {
    const result = await adminClient.request(UPSERT_PREFS, {
      deviceId: device_id,
      prayer,
      atAdhan: at_adhan ?? true,
      preReminderMinutes: pre_reminder_minutes ?? [],
      sound: sound ?? 'default',
      vibrate: vibrate ?? true,
      enabled: enabled ?? true,
      userId,
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[notifications/prefs] PUT error', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
