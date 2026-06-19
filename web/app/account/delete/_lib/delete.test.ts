import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mintDeleteConfirmToken, verifyDeleteConfirmToken } from "./delete";

/**
 * Tests the HMAC confirmation-token gate on the public account-deletion flow.
 * Turnstile alone is replayable; the destructive action requires a valid,
 * email-bound, time-limited HMAC token (P2-E1-W01 Track E extended / QA-C).
 */
describe("delete confirmation token (HMAC)", () => {
  const SECRET = "test-delete-confirm-secret-0123456789";
  const EMAIL = "User@Example.com";
  let prev: string | undefined;

  beforeEach(() => {
    prev = process.env.DELETE_CONFIRM_SECRET;
    process.env.DELETE_CONFIRM_SECRET = SECRET;
  });
  afterEach(() => {
    if (prev === undefined) delete process.env.DELETE_CONFIRM_SECRET;
    else process.env.DELETE_CONFIRM_SECRET = prev;
  });

  it("verifies a freshly minted token for the same email", () => {
    const token = mintDeleteConfirmToken(EMAIL);
    expect(verifyDeleteConfirmToken(EMAIL, token)).toBe(true);
  });

  it("is email-bound: token for one email does not verify for another", () => {
    const token = mintDeleteConfirmToken(EMAIL);
    expect(verifyDeleteConfirmToken("attacker@example.com", token)).toBe(false);
  });

  it("normalizes email case/whitespace when binding", () => {
    const token = mintDeleteConfirmToken("  user@example.com  ");
    expect(verifyDeleteConfirmToken("USER@EXAMPLE.COM", token)).toBe(true);
  });

  it("rejects a tampered signature", () => {
    const token = mintDeleteConfirmToken(EMAIL);
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const tampered = Buffer.from(decoded.slice(0, -1) + "0").toString("base64url");
    expect(verifyDeleteConfirmToken(EMAIL, tampered)).toBe(false);
  });

  it("rejects an expired token", () => {
    const past = Date.now() - 60 * 60 * 1000; // minted an hour ago
    const token = mintDeleteConfirmToken(EMAIL, past);
    expect(verifyDeleteConfirmToken(EMAIL, token)).toBe(false);
  });

  it("rejects missing/garbled tokens (fail-closed)", () => {
    expect(verifyDeleteConfirmToken(EMAIL, undefined)).toBe(false);
    expect(verifyDeleteConfirmToken(EMAIL, "")).toBe(false);
    expect(verifyDeleteConfirmToken(EMAIL, "not-a-real-token")).toBe(false);
  });

  it("fails closed when DELETE_CONFIRM_SECRET is unset", () => {
    const token = mintDeleteConfirmToken(EMAIL); // mint while secret present
    delete process.env.DELETE_CONFIRM_SECRET;
    expect(verifyDeleteConfirmToken(EMAIL, token)).toBe(false);
    expect(() => mintDeleteConfirmToken(EMAIL)).toThrow(/DELETE_CONFIRM_SECRET/);
  });
});
