import { describe, it, expect, beforeEach } from "vitest";
import { getSettings, saveSetting } from "@/lib/settings";

// ---------------------------------------------------------------------------
// localStorage mock for settings.ts direct tests
// ---------------------------------------------------------------------------
let _settingsStore: Record<string, string> = {};

Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => _settingsStore[key] ?? null,
    setItem: (key: string, value: string) => {
      _settingsStore[key] = value;
    },
    removeItem: (key: string) => {
      delete _settingsStore[key];
    },
    clear: () => {
      _settingsStore = {};
    },
  },
  writable: true,
  configurable: true,
});

const STORAGE_KEY = "praycalc-settings";

beforeEach(() => {
  _settingsStore = {};
});

describe("getSettings", () => {
  it("returns all defaults when localStorage is empty", () => {
    const s = getSettings();
    expect(s.hanafi).toBe(false);
    expect(s.use24h).toBe(false);
    expect(s.lightMode).toBe(false);
    expect(s.soundMode).toBe("none");
    expect(s.adhanVoice).toBe("makkah");
    expect(s.countdown).toBe(false);
    expect(s.showQiyam).toBe(false);
    expect(s.homeMode).toBe("none");
    expect(s.homeCity).toBeNull();
  });

  it("returns defaults merged with stored values", () => {
    _settingsStore[STORAGE_KEY] = JSON.stringify({ hanafi: true });
    const s = getSettings();
    expect(s.hanafi).toBe(true);
    expect(s.use24h).toBe(false); // still default
  });

  it("returns all stored values when fully populated", () => {
    const full = {
      hanafi: true,
      use24h: true,
      lightMode: true,
      soundMode: "adhan",
      adhanVoice: "mishari",
      countdown: true,
      showQiyam: true,
      homeMode: "city",
      homeCity: { slug: "london", name: "London" },
    };
    _settingsStore[STORAGE_KEY] = JSON.stringify(full);
    const s = getSettings();
    expect(s.hanafi).toBe(true);
    expect(s.use24h).toBe(true);
    expect(s.soundMode).toBe("adhan");
    expect(s.adhanVoice).toBe("mishari");
    expect(s.homeCity).toEqual({ slug: "london", name: "London" });
  });

  it("returns defaults when stored JSON is malformed", () => {
    _settingsStore[STORAGE_KEY] = "not-valid-json{{";
    const s = getSettings();
    expect(s.hanafi).toBe(false);
    expect(s.soundMode).toBe("none");
  });

  it("returns a new object each call (not a shared reference)", () => {
    const a = getSettings();
    const b = getSettings();
    expect(a).not.toBe(b);
  });
});

describe("saveSetting", () => {
  it("writes a single key to localStorage", () => {
    saveSetting("hanafi", true);
    const stored = JSON.parse(_settingsStore[STORAGE_KEY] ?? "{}");
    expect(stored.hanafi).toBe(true);
  });

  it("preserves existing keys when saving a new key", () => {
    _settingsStore[STORAGE_KEY] = JSON.stringify({ use24h: true });
    saveSetting("hanafi", true);
    const stored = JSON.parse(_settingsStore[STORAGE_KEY] ?? "{}");
    expect(stored.hanafi).toBe(true);
    expect(stored.use24h).toBe(true);
  });

  it("overwrites an existing key", () => {
    _settingsStore[STORAGE_KEY] = JSON.stringify({ soundMode: "beep" });
    saveSetting("soundMode", "adhan");
    const stored = JSON.parse(_settingsStore[STORAGE_KEY] ?? "{}");
    expect(stored.soundMode).toBe("adhan");
  });

  it("saves homeCity as an object", () => {
    const city = { slug: "makkah", name: "Makkah" };
    saveSetting("homeCity", city);
    const stored = JSON.parse(_settingsStore[STORAGE_KEY] ?? "{}");
    expect(stored.homeCity).toEqual(city);
  });

  it("saves null for homeCity", () => {
    saveSetting("homeCity", null);
    const stored = JSON.parse(_settingsStore[STORAGE_KEY] ?? "{}");
    expect(stored.homeCity).toBeNull();
  });

  it("saves adhanVoice correctly", () => {
    saveSetting("adhanVoice", "pashaii");
    const stored = JSON.parse(_settingsStore[STORAGE_KEY] ?? "{}");
    expect(stored.adhanVoice).toBe("pashaii");
  });

  it("saves homeMode correctly", () => {
    saveSetting("homeMode", "location");
    const stored = JSON.parse(_settingsStore[STORAGE_KEY] ?? "{}");
    expect(stored.homeMode).toBe("location");
  });
});
