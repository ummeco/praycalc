"use client";

/**
 * useSession.ts — PrayCalc session hook (P2-E1-W01 Track E: httpOnly cookie migration).
 *
 * Purpose: Manage client-side session state with JWT tokens exclusively in
 *          httpOnly cookies. JS code never reads the JWT directly.
 *          Profile (non-sensitive) stored in localStorage for fast UI reads.
 * Inputs:  Server auth endpoints: /api/auth/signin, /api/auth/refresh, /api/auth/signout.
 * Outputs: Session state + auth actions.
 * Constraints:
 *   - No JWT stored in localStorage or accessible to JS.
 *   - isOwner / isUmmatPlus come from verified server claims, not client-side email match.
 *   - Turnstile token obtained via invisible widget and passed to signin proxy.
 * SPORT: P2-E1-W01 Track E.
 */

// T09 (SEC-HARDENING): Turnstile token is obtained via invisible widget and passed
// to signInEmailPassword / signUpEmailPassword proxy routes for server-side verification.

import { useState, useEffect, useCallback, useRef } from "react";
import type { PrayCalcSession } from "@/lib/session";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""
import {
  getSession,
  buildSession,
  buildSessionFromProfile,
  saveSession,
  clearSession,
} from "@/lib/session";
import {
  requestMagicLink as apiMagicLink,
  requestPasswordReset as apiPasswordReset,
} from "@/lib/auth-client";

/** Refresh buffer: start a refresh 60s before the access token expires. */
const REFRESH_BUFFER_MS = 60_000;

export function useSession() {
  const [session, setSession] = useState<PrayCalcSession | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // T09: Turnstile invisible widget for bot detection on auth actions.
  const turnstileToken = useRef<string>("");
  const turnstileWidgetRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;

    const container = document.createElement("div");
    document.body.appendChild(container);
    turnstileWidgetRef.current = container;

    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => {
      if (typeof window.turnstile === "undefined") return;
      window.turnstile.render(container, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token: string) => { turnstileToken.current = token; },
        "expired-callback": () => { turnstileToken.current = ""; },
        appearance: "interaction-only",
      });
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
      if (turnstileWidgetRef.current) {
        document.body.removeChild(turnstileWidgetRef.current);
        turnstileWidgetRef.current = null;
      }
    };
  }, []);

  // Schedule a server-side token refresh before the access token expires.
  const scheduleRefreshRef = useRef<(s: PrayCalcSession) => void>(() => {});

  const scheduleRefresh = useCallback((s: PrayCalcSession) => {
    scheduleRefreshRef.current(s);
  }, []);

  useEffect(() => {
    scheduleRefreshRef.current = (s: PrayCalcSession) => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      if (!s.accessTokenExpiresAt) return;

      const delay = Math.max(s.accessTokenExpiresAt - Date.now() - REFRESH_BUFFER_MS, 0);
      refreshTimer.current = setTimeout(async () => {
        try {
          // Server refreshes the pc-jwt cookie using the httpOnly pc-refresh cookie.
          const res = await fetch('/api/auth/refresh', { method: 'POST' });
          if (!res.ok) {
            clearSession();
            setSession(null);
            return;
          }
          const profile = await res.json() as {
            userId: string; email: string; displayName?: string;
            avatarUrl?: string | null; accessTokenExpiresAt: number;
            isOwner?: boolean; isUmmatPlus?: boolean;
          };
          const updated = buildSessionFromProfile(profile);
          saveSession(updated);
          setSession(updated);
          scheduleRefreshRef.current(updated);
        } catch {
          clearSession();
          setSession(null);
        }
      }, delay);
    };
  });

  // On mount: check for OAuth callback, then load session.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // OAuth callback: server exchanges the code via /api/auth/refresh using the
      // callback refreshToken param. Clear the URL first to avoid token leakage in
      // browser history.
      const params = new URLSearchParams(window.location.search);
      const callbackToken = params.get("refreshToken");

      if (callbackToken) {
        const url = new URL(window.location.href);
        url.searchParams.delete("refreshToken");
        url.searchParams.delete("type");
        window.history.replaceState({}, "", url.pathname + url.search);

        // Exchange via server: POST to a callback token endpoint.
        try {
          const res = await fetch('/api/auth/refresh', { method: 'POST' });
          if (cancelled) return;
          if (res.ok) {
            const profile = await res.json() as {
              userId: string; email: string; displayName?: string;
              avatarUrl?: string | null; accessTokenExpiresAt: number;
              isOwner?: boolean; isUmmatPlus?: boolean;
            };
            const s = buildSessionFromProfile(profile);
            saveSession(s);
            setSession(s);
            scheduleRefresh(s);
            setHydrated(true);
            return;
          }
        } catch {
          // Fall through to load existing session.
        }
      }

      // Load existing non-sensitive profile from localStorage.
      const existing = getSession();
      if (cancelled) return;

      if (existing) {
        // Has an existing profile — check if the access token is still valid.
        if (existing.accessTokenExpiresAt && existing.accessTokenExpiresAt > Date.now()) {
          setSession(existing);
          scheduleRefresh(existing);
        } else {
          // Access token may be expired — refresh via server (uses httpOnly cookie).
          try {
            const res = await fetch('/api/auth/refresh', { method: 'POST' });
            if (cancelled) return;
            if (res.ok) {
              const profile = await res.json() as {
                userId: string; email: string; displayName?: string;
                avatarUrl?: string | null; accessTokenExpiresAt: number;
                isOwner?: boolean; isUmmatPlus?: boolean;
              };
              const updated = buildSessionFromProfile(profile);
              saveSession(updated);
              setSession(updated);
              scheduleRefresh(updated);
            } else {
              clearSession();
            }
          } catch {
            clearSession();
          }
        }
      }

      setHydrated(true);
    }

    init();

    return () => {
      cancelled = true;
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
    };
  }, [scheduleRefresh]);

  /** Sign in with email + password via server-side proxy (T09: Turnstile). */
  const loginWithPassword = useCallback(
    async (email: string, password: string) => {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, turnstileToken: turnstileToken.current }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Sign in failed' })) as { error?: string };
        throw new Error(err.error ?? 'Sign in failed');
      }
      const profile = await res.json() as {
        userId: string; email: string; displayName?: string;
        avatarUrl?: string | null; accessTokenExpiresAt: number;
        isOwner?: boolean; isUmmatPlus?: boolean;
      };
      const s = buildSessionFromProfile(profile);
      saveSession(s);
      setSession(s);
      scheduleRefresh(s);
    },
    [scheduleRefresh],
  );

  /** Register with email + password via server-side proxy (T09: Turnstile). */
  const register = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, displayName, turnstileToken: turnstileToken.current }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Sign up failed' })) as { error?: string };
        throw new Error(err.error ?? 'Sign up failed');
      }
      const profile = await res.json() as {
        userId: string; email: string; displayName?: string;
        avatarUrl?: string | null; accessTokenExpiresAt: number;
        isOwner?: boolean; isUmmatPlus?: boolean;
      };
      const s = buildSessionFromProfile(profile);
      saveSession(s);
      setSession(s);
      scheduleRefresh(s);
    },
    [scheduleRefresh],
  );

  /** Request a magic link email via Hasura Auth. */
  const sendMagicLink = useCallback(async (email: string) => {
    await apiMagicLink(email);
  }, []);

  /** Request a password reset email via Hasura Auth. */
  const sendPasswordReset = useCallback(async (email: string) => {
    await apiPasswordReset(email);
  }, []);

  /** @deprecated Legacy login for E2E tests only — does not set httpOnly cookie. */
  const login = useCallback((email: string, displayName?: string) => {
    const s = buildSession(email, displayName);
    saveSession(s);
    setSession(s);
  }, []);

  /**
   * Accept a pre-built AuthResult from an OAuth callback or TV pairing flow.
   * Calls the server to set the httpOnly cookie with the accessToken.
   */
  const loginWithResult = useCallback(
    async (result: { user: { id: string; email: string; displayName?: string; avatarUrl?: string | null }; tokens: { accessToken: string; refreshToken: string; accessTokenExpiresAt: number } }) => {
      // Exchange tokens via server-side cookie-set endpoint.
      const res = await fetch('/api/auth/token-set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          accessTokenExpiresAt: result.tokens.accessTokenExpiresAt,
          user: result.user,
        }),
      });
      if (res.ok) {
        const profile = await res.json() as {
          userId: string; email: string; displayName?: string;
          avatarUrl?: string | null; accessTokenExpiresAt: number;
          isOwner?: boolean; isUmmatPlus?: boolean;
        };
        const s = buildSessionFromProfile(profile);
        saveSession(s);
        setSession(s);
        scheduleRefresh(s);
      }
    },
    [scheduleRefresh],
  );

  const logout = useCallback(async () => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
    // Server clears httpOnly cookies + revokes the refresh token.
    await fetch('/api/auth/signout', { method: 'POST' }).catch(() => null);
    clearSession();
    setSession(null);
  }, []);

  return {
    session,
    hydrated,
    isLoggedIn: !!session,
    isOwner: session?.isOwner ?? false,
    isUmmatPlus: session?.isUmmatPlus ?? false,
    login,
    loginWithPassword,
    loginWithResult,
    register,
    sendMagicLink,
    sendPasswordReset,
    logout,
  };
}
