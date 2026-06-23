/**
 * Purpose: Zustand v5 auth store — anonymous mode (local-only) + optional account (JWT via Hasura)
 * Inputs: JWT token on login, anonymous flag on skip
 * Outputs: Auth state: mode, JWT token, user ID
 * Constraints: Anonymous mode makes ZERO API calls (acceptance criterion).
 *   JWT stored in SecureStore via saveToken(). D-P2-AUTH-TRANSPORT bearer pattern.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-auth-store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { TOKEN_KEY } from '../../../lib/graphql';

type AuthMode = 'anonymous' | 'account';

interface AuthState {
  mode: AuthMode;
  userId: string | null;
  isAuthenticated: boolean;

  // Actions
  setAnonymous: () => void;
  setAccount: (userId: string, jwt: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      mode: 'anonymous',
      userId: null,
      isAuthenticated: false,

      /** Set anonymous mode — no API calls, local-only flag */
      setAnonymous: () =>
        set({ mode: 'anonymous', userId: null, isAuthenticated: false }),

      /** Set account mode — store JWT in SecureStore */
      setAccount: async (userId: string, jwt: string) => {
        await SecureStore.setItemAsync(TOKEN_KEY, jwt);
        set({ mode: 'account', userId, isAuthenticated: true });
      },

      /** Logout — clear JWT and revert to anonymous */
      logout: async () => {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
        set({ mode: 'anonymous', userId: null, isAuthenticated: false });
      },
    }),
    {
      name: 'praycalc-auth',
      storage: createJSONStorage(() => AsyncStorage),
      // Never persist JWT — it's in SecureStore only
      partialize: (state) => ({ mode: state.mode, userId: state.userId }),
    },
  ),
);
