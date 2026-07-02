/**
 * Purpose: Shared types for Ummat account authentication (hasura-auth REST client).
 * Inputs: n/a (type-only module).
 * Outputs: AuthSession, AuthUser, EntitlementStatus types + hasura-auth response shapes.
 * Constraints: no `any`; mirrors the subset of hasura-auth's email-password response
 *   fields that PrayCalc desktop actually consumes.
 * SPORT: praycalc desktop — account sign-in (auth-types).
 */

/** Persisted session shape written to the `auth.json` tauri-plugin-store file. */
export interface AuthSession {
  accessToken: string;
  refreshToken: string;
  /** Epoch ms when accessToken expires. */
  expiresAt: number;
  email: string;
  displayName: string;
}

export interface EntitlementStatus {
  isPlus: boolean;
}

/** Minimal shape of hasura-auth's `/v1/auth/signin/email-password` and
 * `/v1/auth/signup/email-password` success responses. */
export interface HasuraAuthSuccess {
  session: {
    accessToken: string;
    accessTokenExpiresIn: number; // seconds
    refreshToken: string;
    user?: {
      email?: string | null;
      displayName?: string | null;
    };
  } | null;
}

/** Shape of hasura-auth's `/v1/auth/token` (refresh) success response. */
export interface HasuraAuthRefreshSuccess {
  accessToken: string;
  accessTokenExpiresIn: number;
  refreshToken: string;
}
