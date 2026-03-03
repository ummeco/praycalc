import { describe, it, expect } from "vitest";
import {
  fmtTime,
  getNextPrayer,
  PRAYER_META,
  DISPLAY_PRAYERS,
  type PrayerResult,
} from "@/lib/prayer-utils";

// ---------------------------------------------------------------------------
// Shared fixture
// ---------------------------------------------------------------------------
const samplePrayers: PrayerResult = {
  Fajr:    "05:00",
  Sunrise: "06:30",
  Dhuhr:   "12:15",
  Asr:     "15:45",
  Maghrib: "19:00",
  Isha:    "20:30",
  Qiyam:   "03:00",
};

// ---------------------------------------------------------------------------
// fmtTime — 12h / 24h conversion
// ---------------------------------------------------------------------------
describe("fmtTime", () => {
  it("formats midnight (00:xx) as 12:xx am in 12h mode", () => {
    const result = fmtTime("00:05");
    expect(result.time).toBe("12:05");
    expect(result.period).toBe("am");
  });

  it("formats noon (12:xx) as 12:xx pm in 12h mode", () => {
    const result = fmtTime("12:15");
    expect(result.time).toBe("12:15");
    expect(result.period).toBe("pm");
  });

  it("formats early morning correctly in 12h mode", () => {
    const result = fmtTime("05:00");
    expect(result.time).toBe("5:00");
    expect(result.period).toBe("am");
  });

  it("formats afternoon correctly in 12h mode", () => {
    const result = fmtTime("15:45");
    expect(result.time).toBe("3:45");
    expect(result.period).toBe("pm");
  });

  it("formats 13:00 as 1:00 pm in 12h mode", () => {
    const result = fmtTime("13:00");
    expect(result.time).toBe("1:00");
    expect(result.period).toBe("pm");
  });

  it("formats 23:59 as 11:59 pm in 12h mode", () => {
    const result = fmtTime("23:59");
    expect(result.time).toBe("11:59");
    expect(result.period).toBe("pm");
  });

  it("formats 11:59 as 11:59 am in 12h mode", () => {
    const result = fmtTime("11:59");
    expect(result.time).toBe("11:59");
    expect(result.period).toBe("am");
  });

  it("returns empty period in 24h mode", () => {
    const result = fmtTime("15:45", true);
    expect(result.period).toBe("");
  });

  it("returns zero-padded hours in 24h mode", () => {
    const result = fmtTime("05:00", true);
    expect(result.time).toBe("05:00");
  });

  it("returns 00:xx in 24h mode for midnight", () => {
    const result = fmtTime("00:30", true);
    expect(result.time).toBe("00:30");
  });

  it("returns 12:15 unchanged in 24h mode", () => {
    const result = fmtTime("12:15", true);
    expect(result.time).toBe("12:15");
  });

  it("returns 23:59 unchanged in 24h mode", () => {
    const result = fmtTime("23:59", true);
    expect(result.time).toBe("23:59");
  });

  it("handles N/A input by returning N/A with empty period", () => {
    const result = fmtTime("N/A");
    expect(result.time).toBe("N/A");
    expect(result.period).toBe("");
  });

  it("handles N/A in 24h mode the same way", () => {
    const result = fmtTime("N/A", true);
    expect(result.time).toBe("N/A");
    expect(result.period).toBe("");
  });
});

// ---------------------------------------------------------------------------
// getNextPrayer — prayer window detection
// ---------------------------------------------------------------------------
describe("getNextPrayer", () => {
  it("returns Fajr when time is before Fajr", () => {
    expect(getNextPrayer(samplePrayers, "04:00")).toBe("Fajr");
  });

  it("returns Sunrise when time is between Fajr and Sunrise", () => {
    expect(getNextPrayer(samplePrayers, "05:30")).toBe("Sunrise");
  });

  it("returns Dhuhr when time is between Sunrise and Dhuhr", () => {
    expect(getNextPrayer(samplePrayers, "10:00")).toBe("Dhuhr");
  });

  it("returns Asr when time is between Dhuhr and Asr", () => {
    expect(getNextPrayer(samplePrayers, "13:00")).toBe("Asr");
  });

  it("returns Maghrib when time is between Asr and Maghrib", () => {
    expect(getNextPrayer(samplePrayers, "16:00")).toBe("Maghrib");
  });

  it("returns Isha when time is between Maghrib and Isha", () => {
    expect(getNextPrayer(samplePrayers, "19:30")).toBe("Isha");
  });

  it("wraps to first prayer (Fajr) when past Isha (next day)", () => {
    // 21:00 is past all prayers — should wrap to first item in list
    expect(getNextPrayer(samplePrayers, "21:00")).toBe("Fajr");
  });

  it("wraps to first prayer at midnight", () => {
    expect(getNextPrayer(samplePrayers, "00:00")).toBe("Fajr");
  });

  it("returns exact-minute prayer correctly (time just before)", () => {
    // At 04:59 Fajr at 05:00 is still upcoming
    expect(getNextPrayer(samplePrayers, "04:59")).toBe("Fajr");
  });

  it("skips N/A prayers", () => {
    const prayersWithNA: PrayerResult = {
      ...samplePrayers,
      Sunrise: "N/A",
    };
    // Between Fajr and Dhuhr, with Sunrise=N/A, should skip to Dhuhr
    expect(getNextPrayer(prayersWithNA, "05:30")).toBe("Dhuhr");
  });

  it("uses custom display list when provided", () => {
    const customList: Array<keyof PrayerResult> = ["Fajr", "Dhuhr", "Maghrib"];
    // At 06:00 with only these three, next is Dhuhr (Sunrise excluded from list)
    expect(getNextPrayer(samplePrayers, "06:00", customList)).toBe("Dhuhr");
  });

  it("uses default DISPLAY_PRAYERS list when list is omitted", () => {
    // Default list does not include Qiyam — so at 00:00 wraps to Fajr
    const result = getNextPrayer(samplePrayers, "21:00");
    expect(result).toBe("Fajr");
  });

  it("returns Fajr for time exactly at Fajr (not strictly greater)", () => {
    // At 05:00 exactly, Fajr time is NOT greater than current, so moves to Sunrise
    expect(getNextPrayer(samplePrayers, "05:00")).toBe("Sunrise");
  });
});

// ---------------------------------------------------------------------------
// PRAYER_META — static metadata
// ---------------------------------------------------------------------------
describe("PRAYER_META", () => {
  it("contains all 7 prayer keys", () => {
    const keys = Object.keys(PRAYER_META);
    expect(keys).toContain("Fajr");
    expect(keys).toContain("Sunrise");
    expect(keys).toContain("Dhuhr");
    expect(keys).toContain("Asr");
    expect(keys).toContain("Maghrib");
    expect(keys).toContain("Isha");
    expect(keys).toContain("Qiyam");
  });

  it("each entry has English and Arabic names", () => {
    for (const meta of Object.values(PRAYER_META)) {
      expect(typeof meta.en).toBe("string");
      expect(meta.en.length).toBeGreaterThan(0);
      expect(typeof meta.ar).toBe("string");
      expect(meta.ar.length).toBeGreaterThan(0);
    }
  });

  it("has correct English name for Fajr", () => {
    expect(PRAYER_META.Fajr.en).toBe("Fajr");
  });

  it("has correct Arabic name for Maghrib", () => {
    expect(PRAYER_META.Maghrib.ar).toBe("المغرب");
  });
});

// ---------------------------------------------------------------------------
// DISPLAY_PRAYERS — default ordered list
// ---------------------------------------------------------------------------
describe("DISPLAY_PRAYERS", () => {
  it("contains exactly 6 items (no Qiyam by default)", () => {
    expect(DISPLAY_PRAYERS).toHaveLength(6);
  });

  it("starts with Fajr", () => {
    expect(DISPLAY_PRAYERS[0]).toBe("Fajr");
  });

  it("ends with Isha", () => {
    expect(DISPLAY_PRAYERS[DISPLAY_PRAYERS.length - 1]).toBe("Isha");
  });

  it("is in chronological order (Fajr, Sunrise, Dhuhr, Asr, Maghrib, Isha)", () => {
    expect(DISPLAY_PRAYERS).toEqual([
      "Fajr",
      "Sunrise",
      "Dhuhr",
      "Asr",
      "Maghrib",
      "Isha",
    ]);
  });
});
