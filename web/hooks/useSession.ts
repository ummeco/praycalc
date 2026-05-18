"use client";

// T09 (SEC-HARDENING): Turnstile token is obtained via invisible widget and passed
// to signInEmailPassword / signUpEmailPassword proxy routes for server-side verification.

import { useState, useEffect, useCallback, useRef } from "react";
import type { PrayCalcSession } from "@/lib/session";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ""
import {
  getSession,
  buildSession,
  buildSessionFromAuth,
  saveSession,
  clearSession,
} from "@/lib/session";
import {
  refreshSession,
  signInEmailPassword,
  signUpEmailPassword,
  requestMagicLink as apiMagicLink,
  requestPasswordReset as apiPasswordReset,
  signOut,
} from "@/lib/auth-client";

/** Token refresh buffer: refresh 60s before expiry. */
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

    // Create the invisible widget container and append to body.
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

  // Schedule a token refresh before the access token expires.
  const scheduleRefreshRef = useRef<(s: PrayCalcSession) => void>(() => {});

  const scheduleRefresh = useCallback((s: PrayCalcSession) => {
    scheduleRefreshRef.current(s);
  }, []);

  useEffect(() => {
    scheduleRefreshRef.current = (s: PrayCalcSession) => {
      if (refreshTimer.current) clearTimeout(refreshTimer.current);
      if (!s.tokens?.refreshToken || !s.tokens.accessTokenExpiresAt) return;

      const delay = Math.max(
        s.tokens.accessTokenExpiresAt - Date.now() - REFRESH_BUFFER_MS,
        0,
      );
      refreshTimer.current = setTimeout(async () => {
        try {
          const result = await refreshSession(s.tokens!.refreshToken);
          const updated = buildSessionFromAuth(result);
          saveSession(updated);
          setSession(updated);
          scheduleRefreshRef.current(updated);
        } catch {
          // Refresh failed: session expired, clear it.
          clearSession();
          setSession(null);
        }
      }, delay);
    };
  });

  // On mount: check for OAuth callback token, then load session.
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Check URL for refreshToken from OAuth callback.
      const params = new URLSearchParams(window.location.search);
      const callbackToken = params.get("refreshToken");

      if (callbackToken) {
        // Clean URL immediately.
        const url = new URL(window.location.href);
        url.searchParams.delete("refreshToken");
        url.searchParams.delete("type");
        window.history.replaceState({}, "", url.pathname + url.search);

        try {
          const result = await refreshSession(callbackToken);
          if (cancelled) return;
          const s = buildSessionFromAuth(result);
          saveSession(s);
          setSession(s);
          scheduleRefresh(s);
          setHydrated(true);
          return;
        } catch {
          // Token exchange failed. Fall through to load existing session.
        }
      }

      // Load existing session from localStorage.
      const existing = getSession();
      if (cancelled) return;

      if (existing?.tokens?.refreshToken) {
        // Has real tokens: check if access token is still valid.
        if (
          existing.tokens.accessTokenExpiresAt &&
          existing.tokens.accessTokenExpiresAt > Date.now()
        ) {
          setSession(existing);
          scheduleRefresh(existing);
        } else {
          // Access token expired. Try refreshing.
          try {
            const result = await refreshSession(existing.tokens.refreshToken);
            if (cancelled) return;
            const updated = buildSessionFromAuth(result);
            saveSession(updated);
            setSession(updated);
            scheduleRefresh(updated);
          } catch {
            // Refresh failed. Clear stale session.
            clearSession();
          }
        }
      } else if (existing) {
        // Legacy/test session without tokens. Use as-is.
        setSession(existing);
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
      const result = await signInEmailPassword(email, password, turnstileToken.current);
      const s = buildSessionFromAuth(result);
      saveSession(s);
      setSession(s);
      scheduleRefresh(s);
    },
    [scheduleRefresh],
  );

  /** Register with email + password via server-side proxy (T09: Turnstile). */
  const register = useCallback(
    async (email: string, password: string, displayName?: string) => {
      const result = await signUpEmailPassword(email, password, displayName, turnstileToken.current);
      const s = buildSessionFromAuth(result);
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

  /** Legacy login: build session from email only (for E2E tests / stub forms). */
  const login = useCallback((email: string, displayName?: string) => {
    const s = buildSession(email, displayName);
    saveSession(s);
    setSession(s);
  }, []);

  /** Set a full session from an AuthResult (dev bypass, token exchange). */
  const loginWithResult = useCallback(
    (result: import("@/lib/auth-client").AuthResult) => {
      const s = buildSessionFromAuth(result);
      saveSession(s);
      setSession(s);
      scheduleRefresh(s);
    },
    [scheduleRefresh],
  );

  const logout = useCallback(async () => {
    const current = getSession();
    if (current?.tokens?.refreshToken) {
      await signOut(current.tokens.refreshToken);
    }
    if (refreshTimer.current) clearTimeout(refreshTimer.current);
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
