/**
 * Hasura GraphQL admin client for server-side API routes.
 *
 * All server-side data access goes through Hasura GraphQL with admin secret.
 * This client is used in API route handlers to execute mutations and queries.
 *
 * Endpoints:
 * - Production: https://api.ummat.dev/v1/graphql (admin endpoint)
 * - Local: https://api.dev.ummat.local.nself.org:8543/v1/graphql (admin endpoint)
 */

interface GraphQLRequest {
  query: string
  variables?: Record<string, unknown>
}

interface GraphQLResponse<T = unknown> {
  data?: T
  errors?: Array<{ message: string }>
}

class HasuraAdminClient {
  private url: string
  private adminSecret: string

  constructor() {
    const isDev = process.env.NODE_ENV === 'development'
    this.url = isDev
      ? 'https://api.dev.ummat.local.nself.org:8543/v1/graphql'
      : 'https://api.ummat.dev/v1/graphql'
    this.adminSecret = process.env.HASURA_GRAPHQL_ADMIN_SECRET || ''
    if (!this.adminSecret) {
      throw new Error('HASURA_GRAPHQL_ADMIN_SECRET environment variable is required')
    }
  }

  async request<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const res = await fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': this.adminSecret,
      },
      body: JSON.stringify({ query, variables }),
    })

    if (!res.ok) {
      throw new Error(`Hasura request failed: ${res.status}`)
    }

    const data: GraphQLResponse<T> = await res.json()

    if (data.errors) {
      throw new Error(`GraphQL error: ${data.errors.map(e => e.message).join(', ')}`)
    }

    return data.data as T
  }
}

export const adminClient = new HasuraAdminClient()
