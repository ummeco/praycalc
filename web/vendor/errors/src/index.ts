/**
 * FILE:    @ummat/errors
 * PURPOSE: Typed error infrastructure for the Ummat platform.
 *          - Result<T, E>: discriminated union for async operations
 *          - UmmatError + ErrorCode: canonical error interface and enum
 *          - withErrorBoundary: route handler wrapper for async operations
 *          - generateIdempotencyKey: UUID generator for idempotent requests
 * SPEC:    P2 Robustness Framework spec §4 (typed error handling)
 * NOTE:    React ErrorBoundary component is exported from @ummat/errors/boundary
 */

import type { Result } from './result.js';

// Result<T, E> discriminated union
export type { Result };
export { ok, err, isOk, isErr, unwrap, map, foldAsync } from './result.js';

// UmmatError interface and ErrorCode enum
export type { UmmatError } from './error.js';
export { ErrorCode, createError, toUmmatError, errorCodeToStatus } from './error.js';

// Route handler wrapper
export { withErrorBoundary as withErrorBoundaryRoute } from './route-wrapper.js';
export type { AsyncRouteHandler, WithErrorBoundaryOptions } from './route-wrapper.js';

// Idempotency helper
export { generateIdempotencyKey } from './idempotency.js';
