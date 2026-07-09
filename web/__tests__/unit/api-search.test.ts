import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/pages/api/search";

// ---------------------------------------------------------------------------
// GET /api/search — mocks the data-lookup layer (real fs-backed JSON files
// are 20MB+ and not the concern of this route; the route's own logic is
// query validation + stitching autocomplete hits to full geo records).
// ---------------------------------------------------------------------------
vi.mock("@/lib/data-lookup.server", () => ({
  searchAutoComplete: vi.fn(),
  lookupGeoByName: vi.fn(),
}));

import { searchAutoComplete, lookupGeoByName } from "@/lib/data-lookup.server";

function makeContext(q: string | null) {
  const url = new URL("http://localhost/api/search");
  if (q !== null) url.searchParams.set("q", q);
  return { url } as unknown as Parameters<typeof GET>[0];
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/search", () => {
  it("returns an empty array when q is missing", async () => {
    const res = await GET(makeContext(null));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
    expect(searchAutoComplete).not.toHaveBeenCalled();
  });

  it("returns an empty array when q is shorter than 2 chars", async () => {
    const res = await GET(makeContext("l"));
    expect(await res.json()).toEqual([]);
    expect(searchAutoComplete).not.toHaveBeenCalled();
  });

  it("returns an empty array when q is only whitespace", async () => {
    const res = await GET(makeContext("  "));
    expect(await res.json()).toEqual([]);
  });

  it("resolves autocomplete hits to full geo results and drops unresolved names", async () => {
    (searchAutoComplete as ReturnType<typeof vi.fn>).mockReturnValue([
      { n: "London, GB" },
      { n: "Ghost City, XX" },
    ]);
    (lookupGeoByName as ReturnType<typeof vi.fn>).mockImplementation((n: string) =>
      n === "London, GB"
        ? { n: "London, GB", y: 51.5072, x: -0.1276, t: "Europe/London" }
        : null,
    );

    const res = await GET(makeContext("lon"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(1);
    expect(body[0].displayName).toBe("London, GB");
    expect(body[0].lat).toBe(51.5072);
  });

  it("sets a 1-hour cache header on successful results", async () => {
    (searchAutoComplete as ReturnType<typeof vi.fn>).mockReturnValue([]);
    const res = await GET(makeContext("xyz"));
    expect(res.headers.get("Cache-Control")).toBe("public, max-age=3600");
  });

  it("trims the query before passing it to searchAutoComplete", async () => {
    (searchAutoComplete as ReturnType<typeof vi.fn>).mockReturnValue([]);
    await GET(makeContext("  lon  "));
    expect(searchAutoComplete).toHaveBeenCalledWith("lon");
  });
});
