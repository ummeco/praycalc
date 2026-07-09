import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET } from "@/pages/api/geo";

// ---------------------------------------------------------------------------
// GET /api/geo — mocks the data-lookup layer and (for the ipapi fallback
// branch) global fetch. Exercises: coordinate validation, name lookup,
// Vercel edge-geo headers, and the ipapi.co SSRF-guarded IP fallback.
// ---------------------------------------------------------------------------
vi.mock("@/lib/data-lookup.server", () => ({
  lookupGeoByCoords: vi.fn(),
  lookupGeoByName: vi.fn(),
}));

import { lookupGeoByCoords, lookupGeoByName } from "@/lib/data-lookup.server";

const GEO_RECORD = { n: "London, GB", y: 51.5072, x: -0.1276, t: "Europe/London" };

function makeRequest(headers: Record<string, string> = {}) {
  return { headers: new Headers(headers) } as Request;
}

function makeContext(searchParams: Record<string, string>, headers: Record<string, string> = {}) {
  const url = new URL("http://localhost/api/geo");
  for (const [k, v] of Object.entries(searchParams)) url.searchParams.set(k, v);
  return { url, request: makeRequest(headers) } as unknown as Parameters<typeof GET>[0];
}

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GET /api/geo — missing params", () => {
  it("returns 400 when no lat/lng, q, or ip is provided", async () => {
    const res = await GET(makeContext({}));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });
});

describe("GET /api/geo?lat=&lng=", () => {
  it("returns 400 for non-numeric coordinates", async () => {
    const res = await GET(makeContext({ lat: "abc", lng: "def" }));
    expect(res.status).toBe(400);
  });

  it("returns null when no record is close enough (lookup returns null)", async () => {
    (lookupGeoByCoords as ReturnType<typeof vi.fn>).mockReturnValue(null);
    const res = await GET(makeContext({ lat: "0", lng: "0" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
  });

  it("returns the resolved GeoResult on a successful reverse-geocode", async () => {
    (lookupGeoByCoords as ReturnType<typeof vi.fn>).mockReturnValue(GEO_RECORD);
    const res = await GET(makeContext({ lat: "51.5", lng: "-0.12" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.city).toBe("London");
    expect(lookupGeoByCoords).toHaveBeenCalledWith(51.5, -0.12);
  });
});

describe("GET /api/geo?q=", () => {
  it("returns null when the name has no match", async () => {
    (lookupGeoByName as ReturnType<typeof vi.fn>).mockReturnValue(null);
    const res = await GET(makeContext({ q: "Nowhereville" }));
    expect(await res.json()).toBeNull();
  });

  it("returns the resolved GeoResult on a name match", async () => {
    (lookupGeoByName as ReturnType<typeof vi.fn>).mockReturnValue(GEO_RECORD);
    const res = await GET(makeContext({ q: "London" }));
    const body = await res.json();
    expect(body.displayName).toBe("London, GB");
  });
});

describe("GET /api/geo?ip=1 — Vercel edge headers", () => {
  it("prefers x-vercel-ip-latitude/longitude when present", async () => {
    (lookupGeoByCoords as ReturnType<typeof vi.fn>).mockReturnValue(GEO_RECORD);
    const res = await GET(
      makeContext(
        { ip: "1" },
        { "x-vercel-ip-latitude": "51.5072", "x-vercel-ip-longitude": "-0.1276" },
      ),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.city).toBe("London");
    expect(lookupGeoByCoords).toHaveBeenCalled();
  });

  it("falls back to x-vercel-ip-city when coords are absent", async () => {
    (lookupGeoByName as ReturnType<typeof vi.fn>).mockReturnValue(GEO_RECORD);
    const res = await GET(makeContext({ ip: "1" }, { "x-vercel-ip-city": "London" }));
    const body = await res.json();
    expect(body.city).toBe("London");
  });
});

describe("GET /api/geo?ip=1 — ipapi.co fallback (no Vercel headers)", () => {
  it("returns null when no client IP header is present", async () => {
    const res = await GET(makeContext({ ip: "1" }));
    expect(await res.json()).toBeNull();
  });

  it("rejects a private/loopback x-forwarded-for IP (SSRF guard) and returns null", async () => {
    vi.stubGlobal("fetch", vi.fn());
    const res = await GET(makeContext({ ip: "1" }, { "x-forwarded-for": "127.0.0.1" }));
    expect(await res.json()).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it("calls ipapi.co with a valid public IP and resolves the city", async () => {
    (lookupGeoByName as ReturnType<typeof vi.fn>).mockReturnValue(GEO_RECORD);
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ city: "London", error: false }),
      }),
    );
    const res = await GET(makeContext({ ip: "1" }, { "x-forwarded-for": "8.8.8.8" }));
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("https://ipapi.co/8.8.8.8/json/"),
      expect.anything(),
    );
    const body = await res.json();
    expect(body.city).toBe("London");
  });

  it("returns null gracefully when ipapi.co fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network down")));
    const res = await GET(makeContext({ ip: "1" }, { "x-forwarded-for": "8.8.8.8" }));
    expect(res.status).toBe(200);
    expect(await res.json()).toBeNull();
  });
});
