/**
 * FILE:    @ummat/errors/idempotency.ts
 * PURPOSE: generateIdempotencyKey() utility for idempotent request deduplication.
 *          Returns a UUID v4 string that clients can include in request headers.
 * INVARIANTS:
 *   - Returns a valid UUID v4 string
 *   - Each call returns a new unique key
 *   - Safe for use in HTTP headers and request bodies
 * SPEC:    P2 Robustness Framework spec §4.4
 */

/**
 * Generate a UUID v4 string for idempotency keys.
 * Use this to create Idempotency-Key headers on request-mutation operations.
 */
export function generateIdempotencyKey(): string {
  return crypto.randomUUID();
}
