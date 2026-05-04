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
  private _url: string | null = null
  private _adminSecret: string | null = null

  /** Resolve connection config at request time (not module load time). */
  private init(): { url: string; adminSecret: string } {
    if (this._url && this._adminSecret) {
      return { url: this._url, adminSecret: this._adminSecret }
    }
    const isDev = process.env.NODE_ENV === 'development'
    this._url = isDev
      ? 'https://api.dev.ummat.local.nself.org:8543/v1/graphql'
      : 'https://api.ummat.dev/v1/graphql'
    const secret = process.env.HASURA_GRAPHQL_ADMIN_SECRET
    if (!secret) {
      throw new Error('HASURA_GRAPHQL_ADMIN_SECRET environment variable is required')
    }
    this._adminSecret = secret
    return { url: this._url, adminSecret: this._adminSecret }
  }

  async request<T = unknown>(query: string, variables?: Record<string, unknown>): Promise<T> {
    const { url, adminSecret } = this.init()
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-hasura-admin-secret': adminSecret,
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
