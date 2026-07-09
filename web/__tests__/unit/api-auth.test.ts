import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST as signinPOST } from "@/pages/api/auth/signin";
import { POST as signupPOST } from "@/pages/api/auth/signup";
import { POST as refreshPOST } from "@/pages/api/auth/refresh";

// ---------------------------------------------------------------------------
// /api/auth/{signin,signup,refresh} — ADR-010 cookie-backed auth proxy routes.
// Mocks the Hasura Auth fetch wrapper + cookie helpers so each route's own
// validation/status-mapping logic is exercised without a live auth server.
// ---------------------------------------------------------------------------
vi.mock("@/lib/auth/hasura.server", () => ({
  signInEmailPassword: vi.fn(),
  signUpEmailPassword: vi.fn(),
  refreshWithToken: vi.fn(),
}));

vi.mock("@/lib/auth/cookies.server", () => ({
  setAuthCookies: vi.fn(),
  clearAuthCookies: vi.fn(),
  readRefreshToken: vi.fn(),
}));

import { signInEmailPassword, signUpEmailPassword, refreshWithToken } from "@/lib/auth/hasura.server";
import { setAuthCookies, clearAuthCookies, readRefreshToken } from "@/lib/auth/cookies.server";

const SESSION = {
  accessToken: "at-1",
  refreshToken: "rt-1",
  accessTokenExpiresIn: 900,
  user: { id: "u1", email: "a@b.com", displayName: "A B" },
};

function makeCookies() {
  return { get: vi.fn(), set: vi.fn(), delete: vi.fn() };
}

function makeContext(body: unknown, cookies = makeCookies()) {
  return {
    request: { json: async () => body },
    cookies,
  } as unknown as Parameters<typeof signinPOST>[0];
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("POST /api/auth/signin", () => {
  it("returns 400 when email or password is missing", async () => {
    const res = await signinPOST(makeContext({ email: "a@b.com" }));
    expect(res.status).toBe(400);
    expect(signInEmailPassword).not.toHaveBeenCalled();
  });

  it("returns 400 on an unparseable body", async () => {
    const ctx = {
      request: { json: async () => { throw new Error("bad json"); } },
      cookies: makeCookies(),
    } as unknown as Parameters<typeof signinPOST>[0];
    const res = await signinPOST(ctx);
    expect(res.status).toBe(400);
  });

  it("propagates the auth server's status + message on failure", async () => {
    (signInEmailPassword as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 401,
      message: "Invalid email or password.",
    });
    const res = await signinPOST(makeContext({ email: "a@b.com", password: "wrong" }));
    expect(res.status).toBe(401);
    const resBody = await res.json();
    expect(resBody.error).toBe("Invalid email or password.");
  });

  it("sets auth cookies and returns the user + expiry on success", async () => {
    (signInEmailPassword as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, session: SESSION });
    const cookies = makeCookies();
    const res = await signinPOST(makeContext({ email: "a@b.com", password: "secret" }, cookies));
    expect(res.status).toBe(200);
    expect(setAuthCookies).toHaveBeenCalledWith(cookies, SESSION);
    const resBody = await res.json();
    expect(resBody.user.email).toBe("a@b.com");
    expect(resBody.user.displayName).toBe("A B");
    expect(resBody.accessTokenExpiresAt).toBeGreaterThan(Date.now());
  });

  it("falls back to the submitted email when Hasura returns no email", async () => {
    (signInEmailPassword as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      session: { ...SESSION, user: { id: "u1", displayName: "" } },
    });
    const res = await signinPOST(makeContext({ email: "fallback@b.com", password: "secret" }));
    const resBody = await res.json();
    expect(resBody.user.email).toBe("fallback@b.com");
    expect(resBody.user.displayName).toBe("");
  });
});

describe("POST /api/auth/signup", () => {
  it("returns 400 when email or password is missing", async () => {
    const res = await signupPOST(makeContext({ password: "pw123456" }));
    expect(res.status).toBe(400);
    expect(signUpEmailPassword).not.toHaveBeenCalled();
  });

  it("propagates a 409 conflict from the auth server", async () => {
    (signUpEmailPassword as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 409,
      message: "Email already registered.",
    });
    const res = await signupPOST(makeContext({ email: "dupe@b.com", password: "pw123456" }));
    expect(res.status).toBe(409);
  });

  it("passes displayName through and sets cookies on success", async () => {
    (signUpEmailPassword as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, session: SESSION });
    const res = await signupPOST(
      makeContext({ email: "a@b.com", password: "pw123456", displayName: "New User" }),
    );
    expect(signUpEmailPassword).toHaveBeenCalledWith("a@b.com", "pw123456", "New User");
    expect(setAuthCookies).toHaveBeenCalled();
    expect(res.status).toBe(200);
  });

  it("falls back to the submitted displayName when Hasura returns none", async () => {
    (signUpEmailPassword as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      session: { ...SESSION, user: { id: "u1", email: "a@b.com", displayName: "" } },
    });
    const res = await signupPOST(
      makeContext({ email: "a@b.com", password: "pw123456", displayName: "Submitted Name" }),
    );
    const resBody = await res.json();
    expect(resBody.user.displayName).toBe("Submitted Name");
  });
});

describe("POST /api/auth/refresh", () => {
  it("returns 401 when there is no refresh token (cookie or body)", async () => {
    (readRefreshToken as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
    const res = await refreshPOST(makeContext({}));
    expect(res.status).toBe(401);
    expect(refreshWithToken).not.toHaveBeenCalled();
  });

  it("reads the refresh token from the cookie when present", async () => {
    (readRefreshToken as ReturnType<typeof vi.fn>).mockReturnValue("rt-cookie");
    (refreshWithToken as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, session: SESSION });
    await refreshPOST(makeContext({}));
    expect(refreshWithToken).toHaveBeenCalledWith("rt-cookie");
  });

  it("falls back to a refresh token in the request body (legacy migration path)", async () => {
    (readRefreshToken as ReturnType<typeof vi.fn>).mockReturnValue(undefined);
    (refreshWithToken as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, session: SESSION });
    await refreshPOST(makeContext({ refreshToken: "rt-legacy" }));
    expect(refreshWithToken).toHaveBeenCalledWith("rt-legacy");
  });

  it("clears cookies and propagates status on a failed refresh", async () => {
    (readRefreshToken as ReturnType<typeof vi.fn>).mockReturnValue("rt-expired");
    (refreshWithToken as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: false,
      status: 401,
      message: "Refresh token expired.",
    });
    const cookies = makeCookies();
    const res = await refreshPOST(makeContext({}, cookies));
    expect(res.status).toBe(401);
    expect(clearAuthCookies).toHaveBeenCalledWith(cookies);
  });

  it("sets new cookies and returns the user on a successful refresh", async () => {
    (readRefreshToken as ReturnType<typeof vi.fn>).mockReturnValue("rt-valid");
    (refreshWithToken as ReturnType<typeof vi.fn>).mockResolvedValue({ ok: true, session: SESSION });
    const cookies = makeCookies();
    const res = await refreshPOST(makeContext({}, cookies));
    expect(res.status).toBe(200);
    expect(setAuthCookies).toHaveBeenCalledWith(cookies, SESSION);
    const resBody = await res.json();
    expect(resBody.user.email).toBe("a@b.com");
  });
});
