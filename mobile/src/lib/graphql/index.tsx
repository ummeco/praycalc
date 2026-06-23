/**
 * Purpose: urql v4 GraphQL client provider for praycalc/mobile
 * Inputs: children React nodes, SecureStore JWT token
 * Outputs: GqlClientProvider component wrapping urql Client
 * Constraints: Bearer JWT transport (D-P2-AUTH-TRANSPORT). Endpoint: api.ummat.dev/v1/graphql.
 * SPORT: REGISTRY-ENDPOINTS.md#praycalc-graphql
 */

import React, { useMemo } from 'react';
import {
  Client,
  Provider,
  cacheExchange,
  fetchExchange,
  type Operation,
} from 'urql';
import { authExchange } from '@urql/exchange-auth';
import * as SecureStore from 'expo-secure-store';

const GRAPHQL_URL = 'https://api.ummat.dev/v1/graphql';
const TOKEN_KEY = 'praycalc_jwt';

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function saveToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function clearToken(): Promise<void> {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}

export { getToken, saveToken, clearToken, TOKEN_KEY };

export function GqlClientProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(
    () =>
      new Client({
        url: GRAPHQL_URL,
        exchanges: [
          cacheExchange,
          authExchange(async (utils) => {
            let token = await getToken();
            return {
              addAuthToOperation(operation: Operation) {
                if (!token) return operation;
                return utils.appendHeaders(operation, {
                  Authorization: `Bearer ${token}`,
                });
              },
              async refreshAuth() {
                // Anonymous mode — clear stale token
                await clearToken();
                token = null;
              },
              didAuthError(error) {
                return error.graphQLErrors.some((e) => e.extensions?.code === 'invalid-jwt');
              },
              willAuthError(_operation: Operation) {
                // Auth errors caught via didAuthError; pre-check not needed for anonymous mode
                return false;
              },
            };
          }),
          fetchExchange,
        ],
      }),
    [],
  );

  return <Provider value={client}>{children}</Provider>;
}
