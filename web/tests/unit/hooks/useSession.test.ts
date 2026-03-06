import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSession } from "@/hooks/useSession";
import { OWNER_EMAIL } from "@/lib/session";

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

// Mock fetch globally (auth-client calls fetch for signOut)
globalThis.fetch = vi.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({}) } as Response),
);

beforeEach(() => {
  _store = {};
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
  (globalThis.fetch as ReturnType<typeof vi.fn>).mockClear();
});

const SESSION_KEY = "praycalc-session";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("useSession", () => {
  describe("initial state — no stored session", () => {
    it("isLoggedIn is false when localStorage is empty", () => {
      const { result } = renderHook(() => useSession());
      expect(result.current.isLoggedIn).toBe(false);
    });

    it("session is null when localStorage is empty", () => {
      const { result } = renderHook(() => useSession());
      expect(result.current.session).toBeNull();
    });

    it("isOwner is false when not logged in", () => {
      const { result } = renderHook(() => useSession());
      expect(result.current.isOwner).toBe(false);
    });

    it("isUmmatPlus is false when not logged in", () => {
      const { result } = renderHook(() => useSession());
      expect(result.current.isUmmatPlus).toBe(false);
    });

    it("hydrated becomes true after mount", () => {
      const { result } = renderHook(() => useSession());
      expect(result.current.hydrated).toBe(true);
    });
  });

  describe("initial state — with persisted session", () => {
    it("reads an existing session on mount", () => {
      _store[SESSION_KEY] = JSON.stringify({
        email: "saved@test.com",
        displayName: "Saved User",
        initials: "SU",
        isOwner: false,
        isUmmatPlus: false,
      });
      const { result } = renderHook(() => useSession());
      expect(result.current.isLoggedIn).toBe(true);
      expect(result.current.session?.email).toBe("saved@test.com");
    });

    it("sets isOwner = true from persisted owner session", () => {
      _store[SESSION_KEY] = JSON.stringify({
        email: OWNER_EMAIL,
        displayName: "Ali Salaah",
        initials: "AS",
        isOwner: true,
        isUmmatPlus: true,
      });
      const { result } = renderHook(() => useSession());
      expect(result.current.isOwner).toBe(true);
      expect(result.current.isUmmatPlus).toBe(true);
    });
  });

  describe("login()", () => {
    it("sets isLoggedIn = true after login", () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.login("user@test.com"));
      expect(result.current.isLoggedIn).toBe(true);
    });

    it("populates session.email after login", () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.login("user@test.com"));
      expect(result.current.session?.email).toBe("user@test.com");
    });

    it("accepts optional displayName", () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.login("user@test.com", "Test User"));
      expect(result.current.session?.displayName).toBe("Test User");
    });

    it("persists the session to localStorage", () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.login("persist@test.com"));
      const stored = JSON.parse(_store[SESSION_KEY] ?? "null");
      expect(stored?.email).toBe("persist@test.com");
    });

    it("sets isOwner = true when logging in as owner", () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.login(OWNER_EMAIL));
      expect(result.current.isOwner).toBe(true);
      expect(result.current.isUmmatPlus).toBe(true);
    });

    it("sets isOwner = false for non-owner login", () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.login("notowner@test.com"));
      expect(result.current.isOwner).toBe(false);
    });

    it("normalises email to lowercase on login", () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.login("Upper@Test.COM"));
      expect(result.current.session?.email).toBe("upper@test.com");
    });

    it("owner email detection works case-insensitively", () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.login(OWNER_EMAIL.toUpperCase()));
      expect(result.current.isOwner).toBe(true);
    });
  });

  describe("logout()", () => {
    it("sets isLoggedIn = false after logout", async () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.login("user@test.com"));
      expect(result.current.isLoggedIn).toBe(true);

      await act(() => result.current.logout());
      expect(result.current.isLoggedIn).toBe(false);
    });

    it("clears session to null after logout", async () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.login("user@test.com"));
      await act(() => result.current.logout());
      expect(result.current.session).toBeNull();
    });

    it("removes session from localStorage on logout", async () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.login("user@test.com"));
      await act(() => result.current.logout());
      expect(_store[SESSION_KEY]).toBeUndefined();
    });

    it("resets isOwner and isUmmatPlus after logout", async () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.login(OWNER_EMAIL));
      expect(result.current.isOwner).toBe(true);

      await act(() => result.current.logout());
      expect(result.current.isOwner).toBe(false);
      expect(result.current.isUmmatPlus).toBe(false);
    });
  });

  describe("localStorage key", () => {
    it("reads from the praycalc-session key", () => {
      renderHook(() => useSession());
      expect(localStorageMock.getItem).toHaveBeenCalledWith(SESSION_KEY);
    });

    it("writes to the praycalc-session key on login", () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.login("keyed@test.com"));
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        SESSION_KEY,
        expect.any(String),
      );
    });

    it("removes the praycalc-session key on logout", () => {
      const { result } = renderHook(() => useSession());
      act(() => result.current.login("keyed@test.com"));
      act(() => result.current.logout());
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(SESSION_KEY);
    });
  });
});
