import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { listLinks, unlinkProvider } from "@/lib/smart-home/client";

// ---------------------------------------------------------------------------
// PURPOSE: Regression coverage for src/lib/smart-home/client.ts — mirrors
//   __tests__/unit/tv-client.test.ts's never-throws-contract style.
// ---------------------------------------------------------------------------
function jsonResponse(body: unknown, ok = true, status = ok ? 200 : 400) {
  return { ok, status, json: async () => body } as Response;
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("listLinks", () => {
  it("returns the linked providers on success", async () => {
    const links = [{ provider: "alexa", linked_at: "2026-06-01T00:00:00.000Z" }];
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({ links }));
    const result = await listLinks();
    expect(result).toEqual(links);
    expect(fetch).toHaveBeenCalledWith("/api/smart-home/links", { credentials: "same-origin" });
  });

  it("returns an empty array when the body is unparseable", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => {
        throw new Error("not json");
      },
    } as unknown as Response);
    const result = await listLinks();
    expect(result).toEqual([]);
  });

  it("never throws on network failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));
    const result = await listLinks();
    expect(result).toEqual([]);
  });
});

describe("unlinkProvider", () => {
  it("sends a DELETE with the provider query param", async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue(jsonResponse({ ok: true }));
    const result = await unlinkProvider("alexa");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/smart-home/links?provider=alexa",
      expect.objectContaining({ method: "DELETE", credentials: "same-origin" }),
    );
    expect(result).toEqual({ ok: true });
  });

  it("returns the server error message on failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ error: "Provider not linked." }, false, 404),
    );
    const result = await unlinkProvider("google");
    expect(result).toEqual({ ok: false, error: "Provider not linked." });
  });

  it("never throws on network failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));
    const result = await unlinkProvider("homeassistant");
    expect(result).toEqual({ ok: false, error: "Network error — could not unlink this provider." });
  });
});
