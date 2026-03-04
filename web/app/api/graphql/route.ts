/**
 * PrayCalc — Hasura Remote Schema endpoint
 *
 * Hasura calls this route to resolve PrayCalc-specific GraphQL fields federated
 * into the main api.ummat.dev schema. Every Hasura request includes
 * x-remote-schema-secret for authentication.
 *
 * Current: minimal schema with a single Boolean field for Hasura introspection.
 * Extend with prayer-time calculation queries when the backend is deployed.
 *
 * See: backend/docs/architecture.md — Hasura Remote Schemas
 */

import { NextRequest, NextResponse } from 'next/server'

const SECRET = process.env.REMOTE_SCHEMA_SECRET

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

  return NextResponse.json({ data: { _praycalc: null } })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, x-remote-schema-secret',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  })
}
