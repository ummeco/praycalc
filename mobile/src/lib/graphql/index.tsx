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

import { API_URL } from '../../constants';

const GRAPHQL_URL = API_URL;
const TOKEN_KEY = 'praycalc_jwt';
const REFRESH_TOKEN_KEY = 'praycalc_refresh_token';

async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function saveToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(TOKEN_KEY, token);
}

async function clearToken(): Promise<void> {
  return SecureStore.deleteItemAsync(TOKEN_KEY);
}

async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

async function saveRefreshToken(token: string): Promise<void> {
  return SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
}

async function clearRefreshToken(): Promise<void> {
  return SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export {
  getToken,
  saveToken,
  clearToken,
  TOKEN_KEY,
  getRefreshToken,
  saveRefreshToken,
  clearRefreshToken,
  REFRESH_TOKEN_KEY,
};

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
                const storedRefreshToken = await getRefreshToken();
                if (!storedRefreshToken) {
                  // Anonymous mode or no session — clear stale token
                  await clearToken();
                  token = null;
                  return;
                }
                try {
                  const { refreshToken: doRefresh } = await import('../auth/authClient');
                  const refreshed = await doRefresh(storedRefreshToken);
                  await saveToken(refreshed.accessToken);
                  token = refreshed.accessToken;
                } catch {
                  await clearToken();
                  await clearRefreshToken();
                  token = null;
                }
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
