import { describe, it, expect } from "vitest";
import {
  organizationSchema,
  webApplicationSchema,
  placeSchema,
  breadcrumbSchema,
  faqPageSchema,
  SITE_URL,
  SITE_NAME,
} from "@/lib/structured-data";

/** Every builder output must be JSON-serializable and well-formed. */
function isWellFormed(obj: unknown): boolean {
  const s = JSON.stringify(obj);
  return typeof s === "string" && JSON.parse(s) !== undefined;
}

describe("structured-data JSON-LD builders", () => {
  it("organizationSchema is a valid schema.org Organization", () => {
    const o = organizationSchema();
    expect(o["@context"]).toBe("https://schema.org");
    expect(o["@type"]).toBe("Organization");
    expect(o.name).toBe(SITE_NAME);
    expect(o.url).toBe(SITE_URL);
    expect(isWellFormed(o)).toBe(true);
  });

  it("webApplicationSchema declares a free UtilitiesApplication with no fabricated rating", () => {
    const w = webApplicationSchema();
    expect(w["@type"]).toBe("WebApplication");
    expect(w.applicationCategory).toBe("UtilitiesApplication");
    expect((w.offers as Record<string, unknown>).price).toBe("0");
    // No aggregateRating/ratingValue — we never invent review data.
    expect(w).not.toHaveProperty("aggregateRating");
    expect(isWellFormed(w)).toBe(true);
  });

  it("placeSchema carries GeoCoordinates for the city", () => {
    const p = placeSchema("New York", 40.7128, -74.006, `${SITE_URL}/us/ny/new-york`);
    expect(p["@type"]).toBe("Place");
    expect(p.name).toBe("New York");
    const geo = p.geo as Record<string, unknown>;
    expect(geo["@type"]).toBe("GeoCoordinates");
    expect(geo.latitude).toBe(40.7128);
    expect(geo.longitude).toBe(-74.006);
    expect(isWellFormed(p)).toBe(true);
  });

  it("breadcrumbSchema numbers items from position 1 in order", () => {
    const b = breadcrumbSchema([
      { name: "PrayCalc", url: SITE_URL },
      { name: "United States", url: `${SITE_URL}/us` },
      { name: "New York", url: `${SITE_URL}/us/ny/new-york` },
    ]);
    expect(b["@type"]).toBe("BreadcrumbList");
    const items = b.itemListElement as { position: number; name: string }[];
    expect(items).toHaveLength(3);
    expect(items.map((i) => i.position)).toEqual([1, 2, 3]);
    expect(items[0]!.name).toBe("PrayCalc");
    expect(isWellFormed(b)).toBe(true);
  });

  it("faqPageSchema wraps each Q&A as a Question with an acceptedAnswer", () => {
    const f = faqPageSchema([
      { question: "What is PrayCalc?", answer: "A prayer time calculator." },
    ]);
    expect(f["@type"]).toBe("FAQPage");
    const entities = f.mainEntity as Record<string, unknown>[];
    expect(entities[0]!["@type"]).toBe("Question");
    expect((entities[0]!.acceptedAnswer as Record<string, unknown>)["@type"]).toBe("Answer");
    expect(isWellFormed(f)).toBe(true);
  });
});
