import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { listTvs, updateTv, deleteTv, pairTv } from "@/lib/tv/client";

// ---------------------------------------------------------------------------
// PURPOSE: Regression coverage for src/lib/tv/client.ts — the TV pairing
//   client wrapper used by TvManagerClient/AddTvForm/TvCard. This file had
//   zero test coverage despite being in vitest.config.ts's coverage scope
//   (src/lib/**/*.ts) and backing the whole "My TVs" Ummat+ feature.
// SCOPE: Existing behavior only (fetch call shape + never-throws contract) —
//   no new logic introduced.
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

describe("listTvs", () => {
  it("returns tvs on success", async () => {
    const tvs = [{ id: "1" }, { id: "2" }];
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({ tvs }));
    const result = await listTvs();
    expect(result).toEqual({ ok: true, tvs });
    expect(fetch).toHaveBeenCalledWith("/api/tvs", { credentials: "same-origin" });
  });

  it("returns the server error message on failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ error: "Not authenticated." }, false, 401),
    );
    const result = await listTvs();
    expect(result).toEqual({ ok: false, error: "Not authenticated." });
  });

  it("falls back to a default message when the error body is unparseable", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => {
        throw new Error("not json");
      },
    } as unknown as Response);
    const result = await listTvs();
    expect(result).toEqual({ ok: false, error: "Failed to load TVs." });
  });

  it("never throws on network failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));
    const result = await listTvs();
    expect(result).toEqual({ ok: false, error: "Network error — could not load your TVs." });
  });
});

describe("updateTv", () => {
  it("posts the update action with id + patch", async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    const tv = { id: "1", name: "Lobby" };
    mockFetch.mockResolvedValue(jsonResponse({ tv }));
    const result = await updateTv("1", { name: "Lobby" });
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/tvs",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        body: JSON.stringify({ action: "update", id: "1", patch: { name: "Lobby" } }),
      }),
    );
    expect(result).toEqual({ ok: true, tv });
  });

  it("never throws on network failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));
    const result = await updateTv("1", { name: "x" });
    expect(result).toEqual({ ok: false, error: "Network error — could not save your changes." });
  });
});

describe("deleteTv", () => {
  it("posts the delete action with id", async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue(jsonResponse({}));
    const result = await deleteTv("1");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/tvs",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ action: "delete", id: "1" }),
      }),
    );
    expect(result).toEqual({ ok: true });
  });

  it("never throws on network failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));
    const result = await deleteTv("1");
    expect(result).toEqual({ ok: false, error: "Network error — could not remove this TV." });
  });
});

describe("pairTv", () => {
  it("posts the pair action with code", async () => {
    const mockFetch = fetch as unknown as ReturnType<typeof vi.fn>;
    mockFetch.mockResolvedValue(jsonResponse({}));
    const result = await pairTv("123456");
    expect(mockFetch).toHaveBeenCalledWith(
      "/api/tvs",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ action: "pair", code: "123456" }),
      }),
    );
    expect(result).toEqual({ ok: true });
  });

  it("returns the server error message on failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ error: "Ummat+ is required to add a TV." }, false, 403),
    );
    const result = await pairTv("000000");
    expect(result).toEqual({ ok: false, error: "Ummat+ is required to add a TV." });
  });

  it("never throws on network failure", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockRejectedValue(new Error("offline"));
    const result = await pairTv("123456");
    expect(result).toEqual({ ok: false, error: "Network error — could not add this TV." });
  });
});
