import { describe, it, expect, beforeEach } from "vitest";
import {
  buildSession,
  computeInitials,
  getSession,
  saveSession,
  clearSession,
  peekLegacyRefreshToken,
  clearLegacySession,
  hasValidToken,
  type PrayCalcSession,
} from "@/lib/session";

// ---------------------------------------------------------------------------
// localStorage mock (matches settings.test.ts house style)
// ---------------------------------------------------------------------------
let _store: Record<string, string> = {};

Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => _store[key] ?? null,
    setItem: (key: string, value: string) => {
      _store[key] = value;
    },
    removeItem: (key: string) => {
      delete _store[key];
    },
    clear: () => {
      _store = {};
    },
  },
  writable: true,
  configurable: true,
});

const SESSION_KEY = "praycalc-profile";
const LEGACY_SESSION_KEY = "praycalc-session";

beforeEach(() => {
  _store = {};
});

describe("computeInitials", () => {
  it("derives initials from first+last name", () => {
    expect(computeInitials("John Doe")).toBe("JD");
  });

  it("derives initials from a single name (first two letters)", () => {
    expect(computeInitials("Madonna")).toBe("MA");
  });
});

describe("buildSession", () => {
  it("builds a session without a token expiry", () => {
    const s = buildSession("john.doe@example.com");
    expect(s.email).toBe("john.doe@example.com");
    expect(s.displayName).toBe("john doe");
    expect(s.isOwner).toBe(false);
    expect(s.isUmmatPlus).toBe(false);
    expect(s.accessTokenExpiresAt).toBeUndefined();
  });

  it("accepts an explicit display name", () => {
    const s = buildSession("a@b.com", "A B");
    expect(s.displayName).toBe("A B");
    expect(s.initials).toBe("AB");
  });
});

describe("getSession / saveSession / clearSession", () => {
  it("returns null when nothing is stored", () => {
    expect(getSession()).toBeNull();
  });

  it("round-trips a profile session (with expiry) through localStorage", () => {
    const s: PrayCalcSession = {
      email: "a@b.com",
      displayName: "A B",
      initials: "AB",
      isOwner: false,
      isUmmatPlus: true,
      accessTokenExpiresAt: Date.now() + 900_000,
    };
    saveSession(s);
    expect(getSession()).toEqual(s);
    // Never written under the pre-2026-07 (token-bearing) key.
    expect(_store[LEGACY_SESSION_KEY]).toBeUndefined();
  });

  it("round-trips a legacy session (no token fields) — backward compatible", () => {
    // account.spec.ts seeds sessions with exactly this shape.
    const legacy = {
      email: "returning@example.com",
      displayName: "Returning User",
      initials: "RU",
      isOwner: false,
      isUmmatPlus: false,
    };
    _store[SESSION_KEY] = JSON.stringify(legacy);
    const loaded = getSession();
    expect(loaded).toEqual(legacy);
  });

  it("clearSession removes the stored session", () => {
    saveSession(buildSession("x@y.com"));
    clearSession();
    expect(getSession()).toBeNull();
  });

  it("getSession returns null on malformed JSON", () => {
    _store[SESSION_KEY] = "not-json{{";
    expect(getSession()).toBeNull();
  });

  it("falls back to the pre-2026-07 legacy key and strips its token fields", () => {
    _store[LEGACY_SESSION_KEY] = JSON.stringify({
      email: "legacy@example.com",
      displayName: "Legacy User",
      initials: "LU",
      isOwner: false,
      isUmmatPlus: false,
      accessToken: "leaked-at",
      refreshToken: "leaked-rt",
      accessTokenExpiresAt: Date.now() + 900_000,
    });
    const loaded = getSession();
    expect(loaded?.email).toBe("legacy@example.com");
    expect((loaded as unknown as { accessToken?: string }).accessToken).toBeUndefined();
    expect((loaded as unknown as { refreshToken?: string }).refreshToken).toBeUndefined();
  });

  it("clearSession removes both the current and legacy keys", () => {
    _store[SESSION_KEY] = JSON.stringify(buildSession("a@b.com"));
    _store[LEGACY_SESSION_KEY] = JSON.stringify({ ...buildSession("a@b.com"), refreshToken: "rt" });
    clearSession();
    expect(_store[SESSION_KEY]).toBeUndefined();
    expect(_store[LEGACY_SESSION_KEY]).toBeUndefined();
  });
});

describe("peekLegacyRefreshToken / clearLegacySession", () => {
  it("returns null when there is no legacy record", () => {
    expect(peekLegacyRefreshToken()).toBeNull();
  });

  it("returns null when the legacy record has no refresh token", () => {
    _store[LEGACY_SESSION_KEY] = JSON.stringify(buildSession("a@b.com"));
    expect(peekLegacyRefreshToken()).toBeNull();
  });

  it("returns the refresh token from a legacy record", () => {
    _store[LEGACY_SESSION_KEY] = JSON.stringify({
      ...buildSession("a@b.com"),
      accessToken: "at",
      refreshToken: "rt-legacy",
      accessTokenExpiresAt: Date.now() + 900_000,
    });
    expect(peekLegacyRefreshToken()).toBe("rt-legacy");
  });

  it("returns null on malformed legacy JSON", () => {
    _store[LEGACY_SESSION_KEY] = "not-json{{";
    expect(peekLegacyRefreshToken()).toBeNull();
  });

  it("clearLegacySession removes only the legacy key", () => {
    _store[SESSION_KEY] = JSON.stringify(buildSession("a@b.com"));
    _store[LEGACY_SESSION_KEY] = JSON.stringify({ ...buildSession("a@b.com"), refreshToken: "rt" });
    clearLegacySession();
    expect(_store[LEGACY_SESSION_KEY]).toBeUndefined();
    expect(_store[SESSION_KEY]).toBeDefined();
  });
});

describe("hasValidToken", () => {
  it("returns false for null session", () => {
    expect(hasValidToken(null)).toBe(false);
  });

  it("returns false for a session with no expiry field", () => {
    const s = buildSession("a@b.com");
    expect(hasValidToken(s)).toBe(false);
  });

  it("returns false when accessTokenExpiresAt is in the past", () => {
    const s: PrayCalcSession = {
      ...buildSession("a@b.com"),
      accessTokenExpiresAt: Date.now() - 1000,
    };
    expect(hasValidToken(s)).toBe(false);
  });

  it("returns true when accessTokenExpiresAt is in the future", () => {
    const s: PrayCalcSession = {
      ...buildSession("a@b.com"),
      accessTokenExpiresAt: Date.now() + 900_000,
    };
    expect(hasValidToken(s)).toBe(true);
  });
});
