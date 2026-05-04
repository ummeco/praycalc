/**
 * PrayCalc — Hasura Remote Schema endpoint
 *
 * Hasura calls this route to resolve PrayCalc-specific GraphQL fields federated
 * into the main api.ummat.dev schema. Every Hasura request includes
 * x-remote-schema-secret for authentication.
 *
 * v1.1 mutations: upsertPushToken, updateNotificationPrefs, upsertUserPrefs,
 * registerAmbientDevice, upsertSmartHomeRoutine
 *
 * See: backend/docs/architecture.md — Hasura Remote Schemas
 */

import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/graphql'

const SECRET = process.env.REMOTE_SCHEMA_SECRET

// --- GraphQL input types (spec §3.5) ---

interface PushTokenInput {
  deviceId: string
  platform: string
  token: string
  permissionState: string
  userId?: string
}

interface NotifPrefsInput {
  deviceId: string
  prayer: string
  atAdhan: boolean
  preReminderMinutes: number[]
  sound: string
  vibrate: boolean
  enabled: boolean
  userId?: string
}

interface UserPrefsInput {
  calcMethod?: string
  hanafiAsr?: boolean
  timeFormat?: string
  hijriOffset?: number
  showMoonPhase?: boolean
  homeLat?: number
  homeLng?: number
  homeLabel?: string
  locale?: string
}

interface AmbientDeviceInput {
  deviceId: string
  platform: string
  pairingCode?: string
  homeLat?: number
  homeLng?: number
  homeLabel?: string
}

interface RoutineInput {
  id?: string
  name: string
  triggerPrayer: string
  triggerOffsetMinutes?: number
  triggerDays?: number[]
  platform: string
  deviceIds?: string[]
  action: Record<string, unknown>
  durationMinutes?: number
  afterAction?: string
  enabled?: boolean
}

// --- Mutation handlers ---

async function handleUpsertPushToken(input: PushTokenInput, userId?: string) {
  const MUTATION = `
    mutation UpsertPushToken($deviceId: String!, $platform: String!, $token: String!, $permissionState: String!, $userId: uuid) {
      insert_pc_push_tokens_one(
        object: { device_id: $deviceId, platform: $platform, token: $token, permission_state: $permissionState, user_id: $userId }
        on_conflict: { constraint: pc_push_tokens_device_platform_unique, update_columns: [token, permission_state, last_seen_at] }
      ) { id created_at }
    }
  `
  return adminClient.request(MUTATION, { ...input, userId })
}

async function handleUpdateNotificationPrefs(input: NotifPrefsInput, userId?: string) {
  const MUTATION = `
    mutation UpdateNotifPrefs(
      $deviceId: String!, $prayer: String!, $atAdhan: Boolean!, $preReminderMinutes: _int4!,
      $sound: String!, $vibrate: Boolean!, $enabled: Boolean!, $userId: uuid
    ) {
      insert_pc_notification_prefs_one(
        object: {
          device_id: $deviceId, prayer: $prayer, at_adhan: $atAdhan,
          pre_reminder_minutes: $preReminderMinutes, sound: $sound,
          vibrate: $vibrate, enabled: $enabled, user_id: $userId
        }
        on_conflict: { constraint: pc_notification_prefs_pkey, update_columns: [at_adhan, pre_reminder_minutes, sound, vibrate, enabled] }
      ) { id }
    }
  `
  return adminClient.request(MUTATION, { ...input, userId })
}

async function handleUpsertUserPrefs(input: UserPrefsInput, userId: string) {
  const MUTATION = `
    mutation UpsertUserPrefs(
      $userId: uuid!, $calcMethod: String, $hanafiAsr: Boolean, $timeFormat: String,
      $hijriOffset: Int, $showMoonPhase: Boolean, $homeLat: float8, $homeLng: float8,
      $homeLabel: String, $locale: String
    ) {
      insert_pc_user_prefs_one(
        object: {
          user_id: $userId, calc_method: $calcMethod, hanafi_asr: $hanafiAsr,
          time_format: $timeFormat, hijri_offset: $hijriOffset, show_moon_phase: $showMoonPhase,
          home_lat: $homeLat, home_lng: $homeLng, home_label: $homeLabel, locale: $locale
        }
        on_conflict: {
          constraint: pc_user_prefs_user_id_key,
          update_columns: [calc_method, hanafi_asr, time_format, hijri_offset, show_moon_phase, home_lat, home_lng, home_label, locale, updated_at]
        }
      ) { id updated_at }
    }
  `
  return adminClient.request(MUTATION, { userId, ...input })
}

async function handleRegisterAmbientDevice(input: AmbientDeviceInput, userId: string) {
  const MUTATION = `
    mutation RegisterAmbientDevice(
      $userId: uuid!, $deviceId: String!, $platform: String!,
      $pairingCode: String, $homeLat: float8, $homeLng: float8, $homeLabel: String
    ) {
      insert_pc_ambient_devices_one(
        object: { user_id: $userId, device_id: $deviceId, platform: $platform, pairing_code: $pairingCode, home_lat: $homeLat, home_lng: $homeLng, home_label: $homeLabel }
      ) { id }
    }
  `
  return adminClient.request(MUTATION, { userId, ...input })
}

async function handleUpsertSmartHomeRoutine(input: RoutineInput, userId: string) {
  const MUTATION = `
    mutation UpsertSmartHomeRoutine(
      $userId: uuid!, $name: String!, $triggerPrayer: String!, $triggerOffsetMinutes: Int,
      $triggerDays: _int4, $platform: String!, $deviceIds: _text, $action: jsonb!,
      $durationMinutes: Int, $afterAction: String, $enabled: Boolean
    ) {
      insert_pc_smart_home_routines_one(
        object: {
          user_id: $userId, name: $name, trigger_prayer: $triggerPrayer,
          trigger_offset_minutes: $triggerOffsetMinutes, trigger_days: $triggerDays,
          platform: $platform, device_ids: $deviceIds, action: $action,
          duration_minutes: $durationMinutes, after_action: $afterAction, enabled: $enabled
        }
        on_conflict: { constraint: pc_smart_home_routines_pkey, update_columns: [name, trigger_prayer, trigger_offset_minutes, trigger_days, platform, device_ids, action, duration_minutes, after_action, enabled] }
      ) { id }
    }
  `
  return adminClient.request(MUTATION, { userId, ...input })
}

const INTROSPECTION_RESPONSE = {
  data: {
    __schema: {
      queryType: { name: 'Query' },
      mutationType: null,
      subscriptionType: null,
      types: [
        {
          kind: 'OBJECT',
          name: 'Query',
          description: 'PrayCalc Remote Schema',
          fields: [
            {
              name: '_praycalc',
              description: 'Schema anchor field. Expand with prayer queries when backend is deployed.',
              args: [],
              type: { kind: 'SCALAR', name: 'Boolean', ofType: null },
              isDeprecated: false,
              deprecationReason: null,
            },
          ],
          inputFields: null,
          interfaces: [],
          enumValues: null,
          possibleTypes: null,
        },
        { kind: 'SCALAR', name: 'Boolean', description: 'Built-in Boolean scalar', fields: null, inputFields: null, interfaces: null, enumValues: null, possibleTypes: null },
        { kind: 'SCALAR', name: 'String', description: 'Built-in String scalar', fields: null, inputFields: null, interfaces: null, enumValues: null, possibleTypes: null },
        { kind: 'SCALAR', name: 'Int', description: 'Built-in Int scalar', fields: null, inputFields: null, interfaces: null, enumValues: null, possibleTypes: null },
        { kind: 'SCALAR', name: 'Float', description: 'Built-in Float scalar', fields: null, inputFields: null, interfaces: null, enumValues: null, possibleTypes: null },
        { kind: 'SCALAR', name: 'ID', description: 'Built-in ID scalar', fields: null, inputFields: null, interfaces: null, enumValues: null, possibleTypes: null },
      ],
      directives: [],
    },
  },
}

function unauthorized() {
  return NextResponse.json({ errors: [{ message: 'Unauthorized' }] }, { status: 401 })
}

export async function POST(req: NextRequest) {
  if (!SECRET || req.headers.get('x-remote-schema-secret') !== SECRET) {
    return unauthorized()
  }

  const body = await req.json()

  if (
    typeof body.query === 'string' &&
    (body.query.includes('__schema') || body.query.includes('IntrospectionQuery'))
  ) {
    return NextResponse.json(INTROSPECTION_RESPONSE)
  }

  // Extract session variables injected by Hasura
  const sessionVars = body.session_variables ?? {}
  const userId: string | undefined = sessionVars['x-hasura-user-id']

  const mutation = body.query ?? ''
  const vars = body.variables ?? {}

  try {
    if (mutation.includes('upsertPushToken')) {
      const result = await handleUpsertPushToken(vars.input, userId)
      return NextResponse.json({ data: { upsertPushToken: result } })
    }

    if (mutation.includes('updateNotificationPrefs')) {
      const result = await handleUpdateNotificationPrefs(vars.input, userId)
      return NextResponse.json({ data: { updateNotificationPrefs: result } })
    }

    if (mutation.includes('upsertUserPrefs')) {
      if (!userId) return NextResponse.json({ errors: [{ message: 'Authentication required' }] }, { status: 401 })
      const result = await handleUpsertUserPrefs(vars.input, userId)
      return NextResponse.json({ data: { upsertUserPrefs: result } })
    }

    if (mutation.includes('registerAmbientDevice')) {
      if (!userId) return NextResponse.json({ errors: [{ message: 'Authentication required' }] }, { status: 401 })
      const result = await handleRegisterAmbientDevice(vars.input, userId)
      return NextResponse.json({ data: { registerAmbientDevice: result } })
    }

    if (mutation.includes('upsertSmartHomeRoutine')) {
      if (!userId) return NextResponse.json({ errors: [{ message: 'Authentication required' }] }, { status: 401 })
      const result = await handleUpsertSmartHomeRoutine(vars.input, userId)
      return NextResponse.json({ data: { upsertSmartHomeRoutine: result } })
    }
  } catch (err) {
    console.error('[RemoteSchema] mutation error', err)
    return NextResponse.json({ errors: [{ message: 'Internal error' }] }, { status: 500 })
  }

  return NextResponse.json({ data: { _praycalc: null } })
}

// Only Hasura (api.ummat.dev) and local dev call this Remote Schema endpoint.
// Wildcard is replaced with an explicit allowlist — never open to all origins.
const REMOTE_SCHEMA_ORIGINS = [
  'https://api.ummat.dev',
  'https://api.praycalc.local.nself.org:8543',
]

export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('Origin') ?? ''
  const corsOrigin = REMOTE_SCHEMA_ORIGINS.includes(origin) ? origin : null

  return new NextResponse(null, {
    status: 204,
    headers: {
      ...(corsOrigin ? { 'Access-Control-Allow-Origin': corsOrigin } : {}),
      'Access-Control-Allow-Headers': 'Content-Type, x-remote-schema-secret',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  })
}
