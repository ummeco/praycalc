import { describe, it, expect } from "vitest";
import {
  qiblaAngle,
  compassDir,
  compassName,
  qiblaGreatCircle,
  distanceKm,
  KAABA_LAT,
  KAABA_LNG,
} from "@/lib/qibla";

// ---------------------------------------------------------------------------
// Known reference values
// ---------------------------------------------------------------------------
// New York City: 40.7128°N, 74.0060°W → Qibla ~58° NE
// London:       51.5074°N, 0.1278°W  → Qibla ~119° SE
// Makkah itself → 0° (or very close)
// Cape Town:    33.9249°S, 18.4241°E → Qibla ~2° N

describe("KAABA constants", () => {
  it("Ka'bah latitude is approximately 21.42°N", () => {
    expect(KAABA_LAT).toBeCloseTo(21.42, 1);
  });

  it("Ka'bah longitude is approximately 39.83°E", () => {
    expect(KAABA_LNG).toBeCloseTo(39.83, 1);
  });
});

describe("qiblaAngle", () => {
  it("returns a number between 0 and 360", () => {
    const angle = qiblaAngle(40.7128, -74.006);
    expect(angle).toBeGreaterThanOrEqual(0);
    expect(angle).toBeLessThan(360);
  });

  it("New York City (~58° NE)", () => {
    const angle = qiblaAngle(40.7128, -74.006);
    expect(angle).toBeGreaterThan(50);
    expect(angle).toBeLessThan(70);
  });

  it("London (~119° SE)", () => {
    const angle = qiblaAngle(51.5074, -0.1278);
    expect(angle).toBeGreaterThan(110);
    expect(angle).toBeLessThan(130);
  });

  it("returns ~0 or ~360 from a point very close to Ka'bah", () => {
    // Same coordinates as Ka'bah — angle is undefined but should be ~0
    const angle = qiblaAngle(KAABA_LAT, KAABA_LNG);
    // Could be any value (degenerate case) — just verify it's a valid number
    expect(Number.isFinite(angle)).toBe(true);
  });

  it("Tokyo (~293° NW)", () => {
    // Tokyo: 35.6762°N, 139.6503°E → Qibla faces NW toward Mecca
    const angle = qiblaAngle(35.6762, 139.6503);
    expect(angle).toBeGreaterThan(280);
    expect(angle).toBeLessThan(310);
  });

  it("Sydney (~277° W)", () => {
    // Sydney: 33.8688°S, 151.2093°E → Qibla faces west
    const angle = qiblaAngle(-33.8688, 151.2093);
    expect(angle).toBeGreaterThan(260);
    expect(angle).toBeLessThan(300);
  });

  it("Islamabad (~268° W / due west)", () => {
    // Islamabad: 33.6844°N, 73.0479°E — relatively close, faces roughly west
    const angle = qiblaAngle(33.6844, 73.0479);
    expect(angle).toBeGreaterThan(250);
    expect(angle).toBeLessThan(290);
  });

  it("result is stable (same input → same output)", () => {
    const a = qiblaAngle(40.7128, -74.006);
    const b = qiblaAngle(40.7128, -74.006);
    expect(a).toBe(b);
  });

  it("equator east of Mecca points West", () => {
    // A point on the equator directly east of Mecca should face ~NW
    const angle = qiblaAngle(0, 80);
    expect(angle).toBeGreaterThan(270);
    expect(angle).toBeLessThan(360);
  });
});

describe("compassDir", () => {
  it("returns N for 0°", () => {
    expect(compassDir(0)).toBe("N");
  });

  it("returns N for 360°", () => {
    expect(compassDir(360)).toBe("N");
  });

  it("returns NE for 45°", () => {
    expect(compassDir(45)).toBe("NE");
  });

  it("returns E for 90°", () => {
    expect(compassDir(90)).toBe("E");
  });

  it("returns SE for 135°", () => {
    expect(compassDir(135)).toBe("SE");
  });

  it("returns S for 180°", () => {
    expect(compassDir(180)).toBe("S");
  });

  it("returns SW for 225°", () => {
    expect(compassDir(225)).toBe("SW");
  });

  it("returns W for 270°", () => {
    expect(compassDir(270)).toBe("W");
  });

  it("returns NW for 315°", () => {
    expect(compassDir(315)).toBe("NW");
  });

  it("returns NE for New York Qibla direction (~58°)", () => {
    const bearing = qiblaAngle(40.7128, -74.006);
    expect(compassDir(bearing)).toBe("NE");
  });
});

describe("compassName", () => {
  it("returns 'North' for 0°", () => {
    expect(compassName(0)).toBe("North");
  });

  it("returns 'Northeast' for 45°", () => {
    expect(compassName(45)).toBe("Northeast");
  });

  it("returns 'East' for 90°", () => {
    expect(compassName(90)).toBe("East");
  });

  it("returns 'Southeast' for 135°", () => {
    expect(compassName(135)).toBe("Southeast");
  });

  it("returns 'South' for 180°", () => {
    expect(compassName(180)).toBe("South");
  });

  it("returns 'Southwest' for 225°", () => {
    expect(compassName(225)).toBe("Southwest");
  });

  it("returns 'West' for 270°", () => {
    expect(compassName(270)).toBe("West");
  });

  it("returns 'Northwest' for 315°", () => {
    expect(compassName(315)).toBe("Northwest");
  });

  it("returns 'North' for 360°", () => {
    expect(compassName(360)).toBe("North");
  });
});

describe("qiblaGreatCircle", () => {
  it("returns an array of [lat, lng] pairs", () => {
    const points = qiblaGreatCircle(40.7128, -74.006);
    expect(Array.isArray(points)).toBe(true);
    expect(points.length).toBeGreaterThan(0);
    expect(points[0]).toHaveLength(2);
  });

  it("returns steps + 1 points by default (120 + 1 = 121)", () => {
    const points = qiblaGreatCircle(40.7128, -74.006);
    expect(points).toHaveLength(121);
  });

  it("respects custom steps parameter", () => {
    const points = qiblaGreatCircle(40.7128, -74.006, 60);
    expect(points).toHaveLength(61);
  });

  it("first point is close to the origin coordinates", () => {
    const [lat, lng] = qiblaGreatCircle(40.7128, -74.006)[0];
    expect(lat).toBeCloseTo(40.7128, 2);
    expect(lng).toBeCloseTo(-74.006, 2);
  });

  it("last point is close to the Ka'bah coordinates", () => {
    const points = qiblaGreatCircle(40.7128, -74.006);
    const [lat, lng] = points[points.length - 1];
    expect(lat).toBeCloseTo(KAABA_LAT, 2);
    expect(lng).toBeCloseTo(KAABA_LNG, 2);
  });

  it("all points have valid lat/lng numbers", () => {
    const points = qiblaGreatCircle(51.5074, -0.1278, 10);
    for (const [lat, lng] of points) {
      expect(Number.isFinite(lat)).toBe(true);
      expect(Number.isFinite(lng)).toBe(true);
      expect(lat).toBeGreaterThanOrEqual(-90);
      expect(lat).toBeLessThanOrEqual(90);
      expect(lng).toBeGreaterThanOrEqual(-180);
      expect(lng).toBeLessThanOrEqual(180);
    }
  });

  it("returns a single point when origin equals Ka'bah", () => {
    const points = qiblaGreatCircle(KAABA_LAT, KAABA_LNG);
    expect(points).toHaveLength(1);
    expect(points[0][0]).toBeCloseTo(KAABA_LAT, 4);
    expect(points[0][1]).toBeCloseTo(KAABA_LNG, 4);
  });
});

describe("distanceKm", () => {
  it("returns 0 for the same point", () => {
    expect(distanceKm(40.7128, -74.006, 40.7128, -74.006)).toBeCloseTo(0, 5);
  });

  it("New York to Ka'bah is approximately 9600 km", () => {
    const km = distanceKm(40.7128, -74.006, KAABA_LAT, KAABA_LNG);
    expect(km).toBeGreaterThan(9000);
    expect(km).toBeLessThan(10500);
  });

  it("London to Ka'bah is approximately 4950 km", () => {
    const km = distanceKm(51.5074, -0.1278, KAABA_LAT, KAABA_LNG);
    expect(km).toBeGreaterThan(4500);
    expect(km).toBeLessThan(5500);
  });

  it("distance is symmetric (A→B = B→A)", () => {
    const d1 = distanceKm(40.7128, -74.006, KAABA_LAT, KAABA_LNG);
    const d2 = distanceKm(KAABA_LAT, KAABA_LNG, 40.7128, -74.006);
    expect(d1).toBeCloseTo(d2, 5);
  });

  it("Earth circumference is approximately 40,075 km (equator full circle)", () => {
    // Quarter of equator: 0°,0° to 0°,90° ≈ 10,018 km
    const d = distanceKm(0, 0, 0, 90);
    expect(d).toBeGreaterThan(9800);
    expect(d).toBeLessThan(10200);
  });

  it("North to South Pole is approximately 20,000 km", () => {
    const d = distanceKm(90, 0, -90, 0);
    expect(d).toBeGreaterThan(19000);
    expect(d).toBeLessThan(21000);
  });

  it("returns a positive number for distinct points", () => {
    const d = distanceKm(0, 0, 10, 10);
    expect(d).toBeGreaterThan(0);
  });
});
