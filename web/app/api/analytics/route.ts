/**
 * PrayCalc — Privacy-first analytics collector
 *
 * POST /api/analytics
 * Receives page views and events from the client. Stores to Hasura via GraphQL
 * (table: pc_analytics_events). Collects only: page path, event name, locale,
 * timestamp, and anonymous session hash. No PII.
 */

import * as Sentry from '@sentry/nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const HASURA_URL =
  process.env.HASURA_ADMIN_URL ?? process.env.NEXT_PUBLIC_HASURA_URL!
const ADMIN_SECRET = process.env.HASURA_GRAPHQL_ADMIN_SECRET

const INSERT_EVENT_MUTATION = `
  mutation InsertAnalyticsEvent(
    $page_path: String!
    $event_name: String!
    $locale: String
    $session_hash: String
    $timestamp: timestamptz!
    $props: jsonb
  ) {
    insert_pc_analytics_events_one(object: {
      page_path: $page_path
      event_name: $event_name
      locale: $locale
      session_hash: $session_hash
      timestamp: $timestamp
      props: $props
    }) {
      id
    }
  }
`

const AnalyticsSchema = z.object({
  page_path:    z.string().min(1),
  event_name:   z.string().min(1),
  locale:       z.string().optional(),
  session_hash: z.string().optional(),
  timestamp:    z.string().optional(),
  props:        z.record(z.unknown()).optional(),
})

type AnalyticsPayload = z.infer<typeof AnalyticsSchema>

export async function POST(req: NextRequest) {
  const rawBody = await req.json().catch(() => null)
  const parsed = AnalyticsSchema.safeParse(rawBody)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'invalid_input', details: parsed.error.flatten() },
      { status: 400 },
    )
  }
  const body: AnalyticsPayload = parsed.data

  if (!ADMIN_SECRET) {
    // Silently accept in dev when Hasura is not configured
    return NextResponse.json({ ok: true })
  }

  try {
    const res = await fetch(HASURA_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: INSERT_EVENT_MUTATION,
        variables: {
          page_path: body.page_path.slice(0, 500),
          event_name: body.event_name.slice(0, 100),
          locale: body.locale?.slice(0, 10) ?? null,
          session_hash: body.session_hash?.slice(0, 64) ?? null,
          timestamp: body.timestamp ?? new Date().toISOString(),
          props: body.props ?? null,
        },
      }),
    })

    if (!res.ok) {
      Sentry.captureException(new Error(`Analytics Hasura error: ${res.status}`))
      console.error('Analytics Hasura error:', res.status)
      return NextResponse.json({ ok: false }, { status: 502 })
    }

    const data = await res.json()
    if (data.errors) {
      Sentry.captureException(new Error('Analytics GraphQL errors'))
      console.error('Analytics GraphQL errors:', data.errors)
      return NextResponse.json({ ok: false }, { status: 502 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    Sentry.captureException(err)
    console.error('Analytics insert failed:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
