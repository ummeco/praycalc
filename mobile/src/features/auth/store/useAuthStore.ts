/**
 * Purpose: Zustand v5 auth store — anonymous mode (local-only) + optional account (JWT via Hasura)
 *   + Ummat+ entitlement state.
 * Inputs: JWT token on login, anonymous flag on skip, billing status from entitlement fetch
 * Outputs: Auth state: mode, JWT token, user ID, isPlus
 * Constraints: Anonymous mode makes ZERO API calls (acceptance criterion).
 *   JWT stored in SecureStore via saveToken(). D-P2-AUTH-TRANSPORT bearer pattern.
 *   fetchEntitlement() only ever called for account-mode users (never anonymous).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-auth-store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY, saveRefreshToken, clearRefreshToken } from '../../../lib/graphql';
import { BILLING_URL } from '../../../constants';

type AuthMode = 'anonymous' | 'account';

interface EntitlementStatus {
  plan: string;
  isActive: boolean;
}

interface AuthState {
  mode: AuthMode;
  userId: string | null;
  isAuthenticated: boolean;
  isPlus: boolean;

  // Actions
  setAnonymous: () => void;
  setAccount: (userId: string, jwt: string, refreshTokenValue?: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchEntitlement: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      mode: 'anonymous',
      userId: null,
      isAuthenticated: false,
      isPlus: false,

      /** Set anonymous mode — no API calls, local-only flag */
      setAnonymous: () =>
        set({ mode: 'anonymous', userId: null, isAuthenticated: false, isPlus: false }),

      /** Set account mode — store JWT (+ optional refresh token) in SecureStore */
      setAccount: async (userId: string, jwt: string, refreshTokenValue?: string) => {
        await SecureStore.setItemAsync(TOKEN_KEY, jwt);
        if (refreshTokenValue) {
          await saveRefreshToken(refreshTokenValue);
        }
        set({ mode: 'account', userId, isAuthenticated: true });
      },

      /** Logout — clear JWT and revert to anonymous */
      logout: async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        await clearRefreshToken();
        set({ mode: 'anonymous', userId: null, isAuthenticated: false, isPlus: false });
      },

      /** Fetch Ummat+ entitlement status. Account mode only — never called anonymously. */
      fetchEntitlement: async () => {
        const { mode } = get();
        if (mode !== 'account') return;
        try {
          const jwt = await SecureStore.getItemAsync(TOKEN_KEY);
          if (!jwt) return;
          const response = await fetch(`${BILLING_URL}/status`, {
            headers: { Authorization: `Bearer ${jwt}` },
          });
          if (!response.ok) return;
          const status = (await response.json()) as EntitlementStatus;
          set({ isPlus: status.isActive === true });
        } catch {
          // Non-fatal — entitlement fetch failure keeps prior isPlus value
        }
      },
    }),
    {
      name: 'praycalc-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // Never persist JWT/refresh token — those live in SecureStore only
      partialize: (state) => ({ mode: state.mode, userId: state.userId, isPlus: state.isPlus }),
    },
  ),
);
