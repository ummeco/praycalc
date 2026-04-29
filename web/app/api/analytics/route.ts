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

interface AnalyticsPayload {
  page_path: string
  event_name: string
  locale?: string
  session_hash?: string
  timestamp?: string
  props?: Record<string, unknown>
}

function isValid(body: unknown): body is AnalyticsPayload {
  if (typeof body !== 'object' || body === null) return false
  const b = body as Record<string, unknown>
  return typeof b.page_path === 'string' && typeof b.event_name === 'string'
}

export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!isValid(body)) {
    return NextResponse.json(
      { error: 'Missing required fields: page_path, event_name' },
      { status: 400 }
    )
  }

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
