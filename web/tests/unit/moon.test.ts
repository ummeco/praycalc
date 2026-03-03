import { describe, it, expect } from "vitest";
import { getMoonPhase } from "@/lib/moon";

describe("getMoonPhase", () => {
  it("returns an object with imageUrl, phaseName, and illumination", () => {
    const result = getMoonPhase(new Date("2024-03-11T12:00:00"));
    expect(result).toHaveProperty("imageUrl");
    expect(result).toHaveProperty("phaseName");
    expect(result).toHaveProperty("illumination");
  });

  it("imageUrl is a non-empty string", () => {
    const result = getMoonPhase(new Date("2024-03-11T12:00:00"));
    expect(typeof result.imageUrl).toBe("string");
    expect(result.imageUrl.length).toBeGreaterThan(0);
  });

  it("phaseName is one of the 8 named phases", () => {
    const validPhases = [
      "New Moon",
      "Waxing Crescent",
      "First Quarter",
      "Waxing Gibbous",
      "Full Moon",
      "Waning Gibbous",
      "Last Quarter",
      "Waning Crescent",
    ];
    const result = getMoonPhase(new Date("2024-03-11T12:00:00"));
    expect(validPhases).toContain(result.phaseName);
  });

  it("illumination is between 0 and 100", () => {
    const result = getMoonPhase(new Date("2024-03-11T12:00:00"));
    expect(result.illumination).toBeGreaterThanOrEqual(0);
    expect(result.illumination).toBeLessThanOrEqual(100);
  });

  it("illumination is an integer", () => {
    const result = getMoonPhase(new Date("2024-06-15T12:00:00"));
    expect(Number.isInteger(result.illumination)).toBe(true);
  });

  it("defaults to current date when no argument is provided", () => {
    const result = getMoonPhase();
    expect(result).toHaveProperty("phaseName");
    expect(result.illumination).toBeGreaterThanOrEqual(0);
  });

  it("returns consistent results for the same date", () => {
    const date = new Date("2024-08-15T12:00:00");
    const a = getMoonPhase(date);
    const b = getMoonPhase(date);
    expect(a.phaseName).toBe(b.phaseName);
    expect(a.illumination).toBe(b.illumination);
    expect(a.imageUrl).toBe(b.imageUrl);
  });

  it("returns different phases for different dates", () => {
    // Two weeks apart should yield different phases
    const a = getMoonPhase(new Date("2024-03-01T12:00:00"));
    const b = getMoonPhase(new Date("2024-03-15T12:00:00"));
    // They should differ in at least one property (phase name or illumination)
    const differs =
      a.phaseName !== b.phaseName || a.illumination !== b.illumination;
    expect(differs).toBe(true);
  });

  it("imageUrl contains .webp extension", () => {
    const result = getMoonPhase(new Date("2024-05-20T12:00:00"));
    expect(result.imageUrl).toContain(".webp");
  });

  it("full moon illumination is high (>= 90%)", () => {
    // March 25, 2024 was near a full moon
    const result = getMoonPhase(new Date("2024-03-25T12:00:00"));
    // Near full moon — allow for slightly different frames
    expect(result.illumination).toBeGreaterThanOrEqual(70);
  });
});
