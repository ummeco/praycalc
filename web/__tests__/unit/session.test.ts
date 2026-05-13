import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  buildSession,
  getSession,
  saveSession,
  clearSession,
  OWNER_EMAIL,
} from "@/lib/session";

// ---------------------------------------------------------------------------
// localStorage mock — same pattern as useSettings.test.ts
// ---------------------------------------------------------------------------
let _store: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => _store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    _store[key] = value;
  }),
  removeItem: vi.fn((key: string) => {
    delete _store[key];
  }),
  clear: vi.fn(() => {
    _store = {};
  }),
};

Object.defineProperty(globalThis, "localStorage", {
  value: localStorageMock,
  writable: true,
});

beforeEach(() => {
  _store = {};
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});

const SESSION_KEY = "praycalc-session";

// ---------------------------------------------------------------------------
// buildSession — pure function tests
// ---------------------------------------------------------------------------
describe("buildSession", () => {
  describe("email normalisation", () => {
    it("lowercases the email", () => {
      const s = buildSession("Ali@Example.COM");
      expect(s.email).toBe("ali@example.com");
    });

    it("trims whitespace from email", () => {
      const s = buildSession("  user@test.com  ");
      expect(s.email).toBe("user@test.com");
    });
  });

  describe("display name derivation from email", () => {
    it("converts dots to spaces", () => {
      const s = buildSession("john.doe@example.com");
      expect(s.displayName).toBe("john doe");
    });

    it("converts underscores to spaces", () => {
      const s = buildSession("john_doe@example.com");
      expect(s.displayName).toBe("john doe");
    });

    it("converts hyphens to spaces", () => {
      const s = buildSession("john-doe@example.com");
      expect(s.displayName).toBe("john doe");
    });

    it("uses the local part before @ as the base name", () => {
      const s = buildSession("ali@ummat.dev");
      expect(s.displayName).toBe("ali");
    });
  });

  describe("explicit displayName", () => {
    it("uses provided displayName", () => {
      const s = buildSession("ali@test.com", "Ali Salaah");
      expect(s.displayName).toBe("Ali Salaah");
    });

    it("trims whitespace from displayName", () => {
      const s = buildSession("ali@test.com", "  Ali Salaah  ");
      expect(s.displayName).toBe("Ali Salaah");
    });

    it("falls back to email-derived name if displayName is empty string", () => {
      const s = buildSession("john.doe@test.com", "");
      expect(s.displayName).toBe("john doe");
    });
  });

  describe("initials — two words", () => {
    it("takes first letter of first and last word", () => {
      const s = buildSession("ali@test.com", "Ali Salaah");
      expect(s.initials).toBe("AS");
    });

    it("uppercases initials", () => {
      const s = buildSession("ali@test.com", "john doe");
      expect(s.initials).toBe("JD");
    });

    it("uses first and last parts for three-word name", () => {
      const s = buildSession("ali@test.com", "Ali Hassan Salaah");
      expect(s.initials).toBe("AS");
    });
  });

  describe("initials — single word", () => {
    it("takes first two letters of single-word name", () => {
      const s = buildSession("ali@test.com", "Ahmad");
      expect(s.initials).toBe("AH");
    });

    it("takes first two letters from single-word email local part", () => {
      const s = buildSession("ahmad@test.com");
      expect(s.initials).toBe("AH");
    });
  });

  describe("owner detection", () => {
    it("sets isOwner = true for the owner email", () => {
      const s = buildSession(OWNER_EMAIL);
      expect(s.isOwner).toBe(true);
    });

    it("sets isOwner = true regardless of case", () => {
      const s = buildSession(OWNER_EMAIL.toUpperCase());
      expect(s.isOwner).toBe(true);
    });

    it("sets isOwner = false for any other email", () => {
      const s = buildSession("other@example.com");
      expect(s.isOwner).toBe(false);
    });

    it("owner always gets isUmmatPlus = true", () => {
      const s = buildSession(OWNER_EMAIL);
      expect(s.isUmmatPlus).toBe(true);
    });

    it("non-owner gets isUmmatPlus = false", () => {
      const s = buildSession("user@test.com");
      expect(s.isUmmatPlus).toBe(false);
    });
  });

  describe("OWNER_EMAIL constant", () => {
    it("is alisalaah@gmail.com", () => {
      expect(OWNER_EMAIL).toBe("alisalaah@gmail.com");
    });
  });
});

// ---------------------------------------------------------------------------
// getSession — reads from localStorage
// ---------------------------------------------------------------------------
describe("getSession", () => {
  it("returns null when localStorage is empty", () => {
    expect(getSession()).toBeNull();
  });

  it("returns null for malformed JSON", () => {
    _store[SESSION_KEY] = "not-json";
    expect(getSession()).toBeNull();
  });

  it("returns the stored session object", () => {
    const session = buildSession("test@example.com", "Test User");
    _store[SESSION_KEY] = JSON.stringify(session);
    const result = getSession();
    expect(result).not.toBeNull();
    expect(result?.email).toBe("test@example.com");
    expect(result?.displayName).toBe("Test User");
  });

  it("reads from the correct localStorage key", () => {
    getSession();
    expect(localStorageMock.getItem).toHaveBeenCalledWith(SESSION_KEY);
  });
});

// ---------------------------------------------------------------------------
// saveSession — writes to localStorage
// ---------------------------------------------------------------------------
describe("saveSession", () => {
  it("writes the session as JSON to the correct key", () => {
    const session = buildSession("save@test.com", "Save User");
    saveSession(session);
    const stored = JSON.parse(_store[SESSION_KEY] ?? "null");
    expect(stored.email).toBe("save@test.com");
    expect(stored.displayName).toBe("Save User");
  });

  it("overwrites an existing session", () => {
    saveSession(buildSession("first@test.com"));
    saveSession(buildSession("second@test.com"));
    const stored = JSON.parse(_store[SESSION_KEY] ?? "null");
    expect(stored.email).toBe("second@test.com");
  });
});

// ---------------------------------------------------------------------------
// clearSession — removes from localStorage
// ---------------------------------------------------------------------------
describe("clearSession", () => {
  it("removes the session key from localStorage", () => {
    saveSession(buildSession("clear@test.com"));
    expect(getSession()).not.toBeNull();

    clearSession();
    expect(_store[SESSION_KEY]).toBeUndefined();
    expect(getSession()).toBeNull();
  });

  it("does not throw when there is no existing session", () => {
    expect(() => clearSession()).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Round-trip: save then get
// ---------------------------------------------------------------------------
describe("save/get round-trip", () => {
  it("persists and retrieves a full owner session", () => {
    const session = buildSession(OWNER_EMAIL, "Ali Salaah");
    saveSession(session);
    const loaded = getSession();
    expect(loaded?.email).toBe(OWNER_EMAIL);
    expect(loaded?.displayName).toBe("Ali Salaah");
    expect(loaded?.isOwner).toBe(true);
    expect(loaded?.isUmmatPlus).toBe(true);
    expect(loaded?.initials).toBe("AS");
  });
});
