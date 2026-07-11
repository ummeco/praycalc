import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { GET, DELETE } from "@/pages/api/smart-home/links";

// ---------------------------------------------------------------------------
// Minimal Astro APIContext mock — mirrors __tests__/unit/tvs-api.test.ts.
// GET follows /api/billing/status's never-a-non-2xx contract; DELETE follows
// /api/tvs's action-result contract (missing session / bad input / upstream
// failure are all surfaced).
// ---------------------------------------------------------------------------
function makeCookies(accessToken?: string) {
  return {
    get: (name: string) => (name === "pc_access_token" && accessToken ? { value: accessToken } : undefined),
  };
}

function makeContext(opts: { accessToken?: string; url?: string } = {}) {
  return {
    cookies: makeCookies(opts.accessToken),
    request: { url: opts.url ?? "https://praycalc.com/api/smart-home/links" },
  } as unknown as Parameters<typeof GET>[0];
}

function jsonResponse(body: unknown, ok = true, status = ok ? 200 : 400) {
  return { ok, status, json: async () => body } as Response;
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("GET /api/smart-home/links", () => {
  it("returns an empty list without a session cookie (never throws)", async () => {
    const res = await GET(makeContext());
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.links).toEqual([]);
  });

  it("returns the linked providers on success", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ links: [{ provider: "alexa", linked_at: "2026-06-01T00:00:00.000Z" }] }),
    );
    const res = await GET(makeContext({ accessToken: "token-abc" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.links).toHaveLength(1);
    expect(body.links[0].provider).toBe("alexa");
  });

  it("falls back to an empty list on an upstream error (never a non-2xx)", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({}, false, 500));
    const res = await GET(makeContext({ accessToken: "token-abc" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.links).toEqual([]);
  });

  it("falls back to an empty list on a network error (never a non-2xx)", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));
    const res = await GET(makeContext({ accessToken: "token-abc" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.links).toEqual([]);
  });
});

describe("DELETE /api/smart-home/links", () => {
  it("returns 401 without a session cookie", async () => {
    const res = await DELETE(makeContext({ url: "https://praycalc.com/api/smart-home/links?provider=alexa" }));
    expect(res.status).toBe(401);
  });

  it("returns 400 without a provider query param", async () => {
    const res = await DELETE(makeContext({ accessToken: "token-abc" }));
    expect(res.status).toBe(400);
  });

  it("unlinks a provider on success", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({}));
    const res = await DELETE(
      makeContext({ accessToken: "token-abc", url: "https://praycalc.com/api/smart-home/links?provider=alexa" }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(fetch).toHaveBeenCalledWith(
      "https://smart.praycalc.com/api/v1/links/alexa",
      expect.objectContaining({ method: "DELETE" }),
    );
  });

  it("returns 404 when the provider is not linked", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({}, false, 404));
    const res = await DELETE(
      makeContext({ accessToken: "token-abc", url: "https://praycalc.com/api/smart-home/links?provider=google" }),
    );
    expect(res.status).toBe(404);
  });

  it("propagates other upstream errors", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({}, false, 500));
    const res = await DELETE(
      makeContext({ accessToken: "token-abc", url: "https://praycalc.com/api/smart-home/links?provider=google" }),
    );
    expect(res.status).toBe(500);
  });

  it("returns 500 on a network error", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));
    const res = await DELETE(
      makeContext({ accessToken: "token-abc", url: "https://praycalc.com/api/smart-home/links?provider=google" }),
    );
    expect(res.status).toBe(500);
  });
});
