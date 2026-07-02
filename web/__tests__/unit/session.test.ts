import { describe, it, expect, beforeEach } from "vitest";
import {
  buildSession,
  computeInitials,
  getSession,
  saveSession,
  clearSession,
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

const SESSION_KEY = "praycalc-session";

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
  it("builds a session without tokens (legacy shape)", () => {
    const s = buildSession("john.doe@example.com");
    expect(s.email).toBe("john.doe@example.com");
    expect(s.displayName).toBe("john doe");
    expect(s.isOwner).toBe(false);
    expect(s.isUmmatPlus).toBe(false);
    expect(s.accessToken).toBeUndefined();
    expect(s.refreshToken).toBeUndefined();
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

  it("round-trips a full session (with tokens) through localStorage", () => {
    const s: PrayCalcSession = {
      email: "a@b.com",
      displayName: "A B",
      initials: "AB",
      isOwner: false,
      isUmmatPlus: true,
      accessToken: "at-1",
      refreshToken: "rt-1",
      accessTokenExpiresAt: Date.now() + 900_000,
    };
    saveSession(s);
    expect(getSession()).toEqual(s);
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
    expect(loaded?.accessToken).toBeUndefined();
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
});

describe("hasValidToken", () => {
  it("returns false for null session", () => {
    expect(hasValidToken(null)).toBe(false);
  });

  it("returns false for a legacy session with no token fields", () => {
    const s = buildSession("a@b.com");
    expect(hasValidToken(s)).toBe(false);
  });

  it("returns false when accessTokenExpiresAt is in the past", () => {
    const s: PrayCalcSession = {
      ...buildSession("a@b.com"),
      accessToken: "at",
      refreshToken: "rt",
      accessTokenExpiresAt: Date.now() - 1000,
    };
    expect(hasValidToken(s)).toBe(false);
  });

  it("returns true when accessTokenExpiresAt is in the future", () => {
    const s: PrayCalcSession = {
      ...buildSession("a@b.com"),
      accessToken: "at",
      refreshToken: "rt",
      accessTokenExpiresAt: Date.now() + 900_000,
    };
    expect(hasValidToken(s)).toBe(true);
  });

  it("returns false when accessToken is present but expiry is missing", () => {
    const s: PrayCalcSession = {
      ...buildSession("a@b.com"),
      accessToken: "at",
    };
    expect(hasValidToken(s)).toBe(false);
  });
});
