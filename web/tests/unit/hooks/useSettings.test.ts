import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useSettings } from "@/hooks/useSettings";

// ---------------------------------------------------------------------------
// localStorage mock backed by a mutable external store
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

// ---------------------------------------------------------------------------
// Reset between tests: clear the external store + call history.
// Do NOT call mockReset/mockRestore — that removes the fn implementations.
// ---------------------------------------------------------------------------
beforeEach(() => {
  _store = {};
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});

const STORAGE_KEY = "praycalc-settings";

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("useSettings", () => {
  describe("defaults when localStorage is empty", () => {
    it("starts with hanafi = false", () => {
      const { result } = renderHook(() => useSettings());
      expect(result.current.hanafi).toBe(false);
    });

    it("starts with use24h = false", () => {
      const { result } = renderHook(() => useSettings());
      expect(result.current.use24h).toBe(false);
    });

    it("starts with lightMode = false", () => {
      const { result } = renderHook(() => useSettings());
      expect(result.current.lightMode).toBe(false);
    });

    it("starts with soundMode = none", () => {
      const { result } = renderHook(() => useSettings());
      expect(result.current.soundMode).toBe("none");
    });

    it("starts with adhanVoice = makkah", () => {
      const { result } = renderHook(() => useSettings());
      expect(result.current.adhanVoice).toBe("makkah");
    });

    it("starts with countdown = false", () => {
      const { result } = renderHook(() => useSettings());
      expect(result.current.countdown).toBe(false);
    });

    it("starts with showQiyam = false", () => {
      const { result } = renderHook(() => useSettings());
      expect(result.current.showQiyam).toBe(false);
    });

    it("starts with homeMode = none", () => {
      const { result } = renderHook(() => useSettings());
      expect(result.current.homeMode).toBe("none");
    });

    it("starts with homeCity = null", () => {
      const { result } = renderHook(() => useSettings());
      expect(result.current.homeCity).toBeNull();
    });
  });

  describe("loads persisted settings from localStorage on mount", () => {
    it("reads hanafi = true from localStorage", () => {
      _store[STORAGE_KEY] = JSON.stringify({ hanafi: true });
      const { result } = renderHook(() => useSettings());
      expect(result.current.hanafi).toBe(true);
    });

    it("reads use24h = true from localStorage", () => {
      _store[STORAGE_KEY] = JSON.stringify({ use24h: true });
      const { result } = renderHook(() => useSettings());
      expect(result.current.use24h).toBe(true);
    });

    it("reads soundMode = adhan from localStorage", () => {
      _store[STORAGE_KEY] = JSON.stringify({ soundMode: "adhan" });
      const { result } = renderHook(() => useSettings());
      expect(result.current.soundMode).toBe("adhan");
    });

    it("reads homeCity from localStorage", () => {
      const city = { slug: "new-york", name: "New York" };
      _store[STORAGE_KEY] = JSON.stringify({ homeCity: city, homeMode: "city" });
      const { result } = renderHook(() => useSettings());
      expect(result.current.homeCity).toEqual(city);
      expect(result.current.homeMode).toBe("city");
    });

    it("merges persisted values with defaults (partial store)", () => {
      _store[STORAGE_KEY] = JSON.stringify({ hanafi: true });
      const { result } = renderHook(() => useSettings());
      expect(result.current.hanafi).toBe(true);
      expect(result.current.use24h).toBe(false);
      expect(result.current.soundMode).toBe("none");
    });
  });

  describe("toggleHanafi", () => {
    it("toggles hanafi from false to true", () => {
      const { result } = renderHook(() => useSettings());
      act(() => result.current.toggleHanafi());
      expect(result.current.hanafi).toBe(true);
    });

    it("toggles hanafi back to false", () => {
      const { result } = renderHook(() => useSettings());
      act(() => result.current.toggleHanafi());
      act(() => result.current.toggleHanafi());
      expect(result.current.hanafi).toBe(false);
    });

    it("writes hanafi = true to localStorage", () => {
      const { result } = renderHook(() => useSettings());
      act(() => result.current.toggleHanafi());
      const stored = JSON.parse(_store[STORAGE_KEY] ?? "{}");
      expect(stored.hanafi).toBe(true);
    });
  });

  describe("toggleUse24h", () => {
    it("toggles use24h from false to true", () => {
      const { result } = renderHook(() => useSettings());
      act(() => result.current.toggleUse24h());
      expect(result.current.use24h).toBe(true);
    });

    it("persists use24h to localStorage", () => {
      const { result } = renderHook(() => useSettings());
      act(() => result.current.toggleUse24h());
      const stored = JSON.parse(_store[STORAGE_KEY] ?? "{}");
      expect(stored.use24h).toBe(true);
    });
  });

  describe("toggleCountdown", () => {
    it("toggles countdown from false to true", () => {
      const { result } = renderHook(() => useSettings());
      act(() => result.current.toggleCountdown());
      expect(result.current.countdown).toBe(true);
    });
  });

  describe("toggleShowQiyam", () => {
    it("toggles showQiyam from false to true", () => {
      const { result } = renderHook(() => useSettings());
      act(() => result.current.toggleShowQiyam());
      expect(result.current.showQiyam).toBe(true);
    });
  });

  describe("setSoundModeAndSave", () => {
    it("sets sound mode to beep", () => {
      const { result } = renderHook(() => useSettings());
      act(() => result.current.setSoundModeAndSave("beep"));
      expect(result.current.soundMode).toBe("beep");
    });

    it("sets sound mode to adhan", () => {
      const { result } = renderHook(() => useSettings());
      act(() => result.current.setSoundModeAndSave("adhan"));
      expect(result.current.soundMode).toBe("adhan");
    });

    it("persists soundMode to localStorage", () => {
      const { result } = renderHook(() => useSettings());
      act(() => result.current.setSoundModeAndSave("adhan"));
      const stored = JSON.parse(_store[STORAGE_KEY] ?? "{}");
      expect(stored.soundMode).toBe("adhan");
    });
  });

  describe("setAdhanVoiceAndSave", () => {
    it("sets adhan voice to mishari", () => {
      const { result } = renderHook(() => useSettings());
      act(() => result.current.setAdhanVoiceAndSave("mishari"));
      expect(result.current.adhanVoice).toBe("mishari");
    });

    it("persists adhanVoice to localStorage", () => {
      const { result } = renderHook(() => useSettings());
      act(() => result.current.setAdhanVoiceAndSave("pashaii"));
      const stored = JSON.parse(_store[STORAGE_KEY] ?? "{}");
      expect(stored.adhanVoice).toBe("pashaii");
    });
  });

  describe("setHomeModeAndSave", () => {
    it("sets homeMode to city", () => {
      const { result } = renderHook(() => useSettings());
      act(() => result.current.setHomeModeAndSave("city"));
      expect(result.current.homeMode).toBe("city");
    });

    it("sets homeMode to location", () => {
      const { result } = renderHook(() => useSettings());
      act(() => result.current.setHomeModeAndSave("location"));
      expect(result.current.homeMode).toBe("location");
    });
  });

  describe("clearHome", () => {
    it("resets homeMode to none and clears homeCity", () => {
      _store[STORAGE_KEY] = JSON.stringify({
        homeMode: "city",
        homeCity: { slug: "london", name: "London" },
      });
      const { result } = renderHook(() => useSettings());
      act(() => result.current.clearHome());
      expect(result.current.homeMode).toBe("none");
      expect(result.current.homeCity).toBeNull();
    });
  });

  describe("setHomeCityAndSave", () => {
    it("sets homeCity to the provided city", () => {
      const { result } = renderHook(() => useSettings());
      const city = { slug: "makkah", name: "Makkah" };
      act(() => result.current.setHomeCityAndSave(city));
      expect(result.current.homeCity).toEqual(city);
    });

    it("persists homeCity to localStorage", () => {
      const { result } = renderHook(() => useSettings());
      const city = { slug: "makkah", name: "Makkah" };
      act(() => result.current.setHomeCityAndSave(city));
      const stored = JSON.parse(_store[STORAGE_KEY] ?? "{}");
      expect(stored.homeCity).toEqual(city);
    });
  });

  describe("localStorage key", () => {
    it("reads from the correct storage key", () => {
      renderHook(() => useSettings());
      expect(localStorageMock.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it("writes to the correct storage key when toggling", () => {
      const { result } = renderHook(() => useSettings());
      act(() => result.current.toggleHanafi());
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        expect.any(String),
      );
    });
  });
});
