/**
 * FILE:    @ummat/errors/route-wrapper.ts
 * PURPOSE: withErrorBoundary() wrapper for async route handlers (Next.js, Hono, Express).
 *          Catches thrown errors and unknown exceptions; returns Result<T, UmmatError>.
 *          Never re-throws; always returns {ok:false,error:{code:...}} on error.
 * INVARIANTS:
 *   - All errors are caught; none escape the boundary
 *   - Unknown errors are coerced to ErrorCode.INTERNAL
 *   - cause and context are never serialized to the client
 * SPEC:    P2 Robustness Framework spec §4.3
 */

import { Result, err, ok } from './result.js';
import { ErrorCode, UmmatError, toUmmatError } from './error.js';

/**
 * Async route handler signature (works with Next.js, Hono, Express-compatible).
 */
export type AsyncRouteHandler<T = unknown> = (req: Request) => Promise<T>;

/**
 * Options for withErrorBoundary route wrapper.
 */
export interface WithErrorBoundaryOptions {
  /**
   * Called when an error is caught (for Sentry, logging, etc.).
   * Use this to wire Sentry capture from @ummat/observability.
   */
  onError?: (error: UmmatError, request: Request) => void | Promise<void>;
}

/**
 * Wrap an async route handler to catch all errors and return Result<T, UmmatError>.
 * Never throws; always returns a Result that callers can destructure.
 *
 * Usage:
 *   export const POST = withErrorBoundary(async (req: Request) => {
 *     const body = await req.json();
 *     if (!body.email) throw new Error('Missing email'); // caught and wrapped
 *     return { ok: true, value: { id: 123 } }; // return Result or plain value
 *   });
 */
export function withErrorBoundary<T>(
  handler: AsyncRouteHandler<T>,
  opts: WithErrorBoundaryOptions = {}
): AsyncRouteHandler<Result<T, UmmatError>> {
  return async (req: Request): Promise<Result<T, UmmatError>> => {
    try {
      const result = await handler(req);
      // If handler returns a Result, pass through.
      // Otherwise wrap the value.
      if (result && typeof result === 'object' && 'ok' in result) {
        return result as Result<T, UmmatError>;
      }
      return ok(result as T) as Result<T, UmmatError>;
    } catch (raw) {
      const error = toUmmatError(raw);
      if (opts.onError) {
        try {
          await opts.onError(error, req);
        } catch {
          // Never let capture failure escape the boundary.
        }
      }
      return err(error) as Result<T, UmmatError>;
    }
  };
}

/**
 * Coerce any error to a UmmatError for consistent handling.
 * Public re-export for convenience.
 */
export { toUmmatError };
