"use client";

import { useState, useEffect, useCallback } from "react";
import type { PrayCalcSession } from "@/lib/session";
import { getSession, buildSession, saveSession, clearSession } from "@/lib/session";

export function useSession() {
  const [session, setSession] = useState<PrayCalcSession | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setSession(getSession());
    setHydrated(true);
  }, []);

  const login = useCallback((email: string, displayName?: string) => {
    const s = buildSession(email, displayName);
    saveSession(s);
    setSession(s);
  }, []);

  const logout = useCallback(() => {
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
    logout,
  };
}
