import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { GET, POST } from "@/pages/api/tvs/index";

// ---------------------------------------------------------------------------
// Minimal Astro APIContext mock — just enough surface (cookies.get, request)
// for the /api/tvs route handlers, which only read those two things. No
// Astro container/dev-server is spun up; the exported GET/POST are plain
// functions taking a context object, so this is sufficient to exercise the
// auth-required (401) behavior and the request/response contract.
// ---------------------------------------------------------------------------
function makeCookies(accessToken?: string) {
  return {
    get: (name: string) => (name === "pc_access_token" && accessToken ? { value: accessToken } : undefined),
  };
}

function makeContext(opts: { accessToken?: string; body?: unknown } = {}) {
  return {
    cookies: makeCookies(opts.accessToken),
    request: {
      json: async () => opts.body ?? {},
    },
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

describe("GET /api/tvs", () => {
  it("returns 401 without a session cookie", async () => {
    const res = await GET(makeContext());
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error).toBeTruthy();
  });

  it("returns the TV list on success with a session", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({
        data: {
          pc_tv_settings: [
            {
              id: "tv-1",
              user_id: "u1",
              device_id: "dev-1",
              name: "Living Room",
              accent_color: "#79C24C",
              stream_source: "makkah-tv",
              rotate_minutes: 5,
              show_weather: true,
              latitude: null,
              longitude: null,
              city: null,
              timezone: null,
            },
          ],
        },
      }),
    );
    const res = await GET(makeContext({ accessToken: "token-abc" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.tvs).toHaveLength(1);
    expect(body.tvs[0].name).toBe("Living Room");
  });

  it("propagates upstream Hasura errors", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(jsonResponse({}, false, 500));
    const res = await GET(makeContext({ accessToken: "token-abc" }));
    expect(res.status).toBe(500);
  });
});

describe("POST /api/tvs", () => {
  it("returns 401 without a session cookie", async () => {
    const res = await POST(makeContext({ body: { action: "update", id: "tv-1", patch: {} } }));
    expect(res.status).toBe(401);
  });

  it("returns 400 when no id is provided", async () => {
    const res = await POST(makeContext({ accessToken: "token-abc", body: { action: "update", patch: {} } }));
    expect(res.status).toBe(400);
  });

  it("returns 400 on an invalid patch (bad stream source)", async () => {
    const res = await POST(
      makeContext({
        accessToken: "token-abc",
        body: { action: "update", id: "tv-1", patch: { stream_source: "nope" } },
      }),
    );
    expect(res.status).toBe(400);
  });

  it("returns 400 on an invalid patch (rotation out of range)", async () => {
    const res = await POST(
      makeContext({
        accessToken: "token-abc",
        body: { action: "update", id: "tv-1", patch: { rotate_minutes: 99 } },
      }),
    );
    expect(res.status).toBe(400);
  });

  it("updates a TV on success", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({
        data: {
          update_pc_tv_settings_by_pk: {
            id: "tv-1",
            user_id: "u1",
            device_id: "dev-1",
            name: "Kitchen",
            accent_color: "#79C24C",
            stream_source: "medina",
            rotate_minutes: 10,
            show_weather: false,
            latitude: null,
            longitude: null,
            city: null,
            timezone: null,
          },
        },
      }),
    );
    const res = await POST(
      makeContext({
        accessToken: "token-abc",
        body: { action: "update", id: "tv-1", patch: { name: "Kitchen", stream_source: "medina" } },
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.tv.name).toBe("Kitchen");
  });

  it("returns 404 when updating a TV that does not exist / isn't owned by the caller", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ data: { update_pc_tv_settings_by_pk: null } }),
    );
    const res = await POST(
      makeContext({
        accessToken: "token-abc",
        body: { action: "update", id: "tv-missing", patch: { name: "X" } },
      }),
    );
    expect(res.status).toBe(404);
  });

  it("deletes a TV on success", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ data: { delete_pc_tv_settings_by_pk: { id: "tv-1" } } }),
    );
    const res = await POST(makeContext({ accessToken: "token-abc", body: { action: "delete", id: "tv-1" } }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.id).toBe("tv-1");
  });

  it("returns 404 when deleting a TV that does not exist / isn't owned by the caller", async () => {
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue(
      jsonResponse({ data: { delete_pc_tv_settings_by_pk: null } }),
    );
    const res = await POST(
      makeContext({ accessToken: "token-abc", body: { action: "delete", id: "tv-missing" } }),
    );
    expect(res.status).toBe(404);
  });

  it("returns 400 for an unknown action", async () => {
    const res = await POST(makeContext({ accessToken: "token-abc", body: { action: "nope", id: "tv-1" } }));
    expect(res.status).toBe(400);
  });
});
