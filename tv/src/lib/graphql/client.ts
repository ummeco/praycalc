/**
 * Purpose: urql GraphQL client setup for PrayCalc TV
 * Inputs: Bearer JWT token from pairing/settings
 * Outputs: Configured urql client for Hasura (api.praycalc.com — per-app CORS endpoint)
 * Constraints: urql ^4; Bearer JWT transport per D-P2-AUTH-TRANSPORT; PRI mandates the
 *   per-app CORS endpoint (api.{app-domain}) for client apps, never the admin api.ummat.dev
 * SPORT: praycalc/tv graphql
 */

import { createClient, fetchExchange, cacheExchange } from 'urql';

const API_URL = 'https://api.praycalc.com/v1/graphql';

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export const graphqlClient = createClient({
  url: API_URL,
  exchanges: [cacheExchange, fetchExchange],
  fetchOptions: () => ({
    headers: {
      'Content-Type': 'application/json',
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
    },
  }),
});
