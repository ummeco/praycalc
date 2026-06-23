/**
 * FILE:    @ummat/errors/result.ts
 * PURPOSE: Discriminated union Result<T,E> type for typed error handling.
 *          All async operations return Result<T, UmmatError> instead of throwing.
 * INVARIANTS:
 *   - Never throw across async boundaries
 *   - Result is a tagged union: {ok: true, value: T} | {ok: false, error: E}
 *   - Discriminant is the 'ok' boolean field
 * SPEC:    P2 Robustness Framework spec §4.1
 */

/**
 * Discriminated union for typed async results.
 * Prefer this over throwing or Promise rejection.
 */
export type Result<T, E = unknown> =
  | { ok: true; value: T }
  | { ok: false; error: E };

/**
 * Constructor for a successful result.
 */
export function ok<T, E = never>(value: T): Result<T, E> {
  return { ok: true, value };
}

/**
 * Constructor for a failed result.
 */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

/**
 * Type guard to discriminate at runtime.
 */
export function isOk<T, E>(result: Result<T, E>): result is { ok: true; value: T } {
  return result.ok === true;
}

/**
 * Type guard for error state.
 */
export function isErr<T, E>(result: Result<T, E>): result is { ok: false; error: E } {
  return result.ok === false;
}

/**
 * Extract the value or throw if error. Use sparingly.
 */
export function unwrap<T, E extends Error>(result: Result<T, E>): T {
  if (result.ok) return result.value;
  throw result.error;
}

/**
 * Map over the value, leaving error unchanged.
 */
export function map<T, E, U>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  if (!result.ok) {
    return result as { ok: false; error: E };
  }
  return ok(fn(result.value));
}

/**
 * Fold over a Result: apply one function to success, another to error.
 */
export async function foldAsync<T, E, U>(
  result: Result<T, E>,
  onOk: (value: T) => Promise<U>,
  onErr: (error: E) => Promise<U>
): Promise<U> {
  if (result.ok) {
    return onOk(result.value);
  }
  return onErr(result.error);
}
