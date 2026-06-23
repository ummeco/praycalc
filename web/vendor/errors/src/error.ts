/**
 * FILE:    @ummat/errors/error.ts
 * PURPOSE: UmmatError interface and ErrorCode enum canonical to all platform errors.
 *          All async operations return Result<T, UmmatError> carrying these fields.
 * INVARIANTS:
 *   - code is always one of the 7 canonical ErrorCode values (never a raw string)
 *   - message is human-readable, safe for client display
 *   - cause holds the original error for logging; never leaks to client
 *   - context is diagnostic metadata; never leaks to client
 * SPEC:    P2 Robustness Framework spec §4.1
 */

/**
 * Canonical error codes for the entire platform.
 * All 7 codes defined in spec; each maps to HTTP status + Sentry severity.
 */
export enum ErrorCode {
  NETWORK_OFFLINE = 'NETWORK_OFFLINE',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMITED = 'RATE_LIMITED',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION',
  INTERNAL = 'INTERNAL',
  THEOLOGY_GATE = 'THEOLOGY_GATE',
}

/**
 * Canonical UmmatError shape returned by Result<T, UmmatError>.
 * Safe to serialize to client; cause and context are diagnostic only.
 */
export interface UmmatError {
  /**
   * Canonical error code (one of the 7 ErrorCode values).
   */
  code: ErrorCode;

  /**
   * Human-readable message safe to display to the user.
   * i18n strings are safe; never includes stack traces or internal detail.
   */
  message: string;

  /**
   * Original error (if caught from another domain).
   * Never serialized to client; for logging/diagnostics only.
   */
  cause?: unknown;

  /**
   * Diagnostic metadata: request_id, user_id, resource_id, attempt_count, etc.
   * Never serialized to client; for Sentry + structured logging.
   */
  context?: Record<string, unknown>;

  /**
   * HTTP status for this error (e.g., 401 for PERMISSION_DENIED, 429 for RATE_LIMITED).
   * Populated by platform services; may be omitted in Result context (clients use code → status).
   */
  status?: number;
}

/**
 * Create a UmmatError from constituent parts.
 */
export function createError(
  code: ErrorCode,
  message: string,
  opts?: { cause?: unknown; context?: Record<string, unknown>; status?: number }
): UmmatError {
  return {
    code,
    message,
    cause: opts?.cause,
    context: opts?.context,
    status: opts?.status,
  };
}

/**
 * Safe coercion: if the input is already a UmmatError, pass through.
 * Otherwise wrap in INTERNAL with the original as cause.
 */
export function toUmmatError(value: unknown): UmmatError {
  if (typeof value === 'object' && value !== null && 'code' in value && 'message' in value) {
    const err = value as Partial<UmmatError>;
    if (Object.values(ErrorCode).includes(err.code as ErrorCode)) {
      return value as UmmatError;
    }
  }
  if (value instanceof Error) {
    return createError(ErrorCode.INTERNAL, 'An unexpected error occurred', { cause: value });
  }
  return createError(ErrorCode.INTERNAL, 'An unexpected error occurred', { cause: value });
}

/**
 * Map ErrorCode to HTTP status (used by route handlers).
 */
export function errorCodeToStatus(code: ErrorCode): number {
  switch (code) {
    case ErrorCode.NETWORK_OFFLINE:
      return 503; // Service Unavailable
    case ErrorCode.PERMISSION_DENIED:
      return 403; // Forbidden
    case ErrorCode.RATE_LIMITED:
      return 429; // Too Many Requests
    case ErrorCode.NOT_FOUND:
      return 404; // Not Found
    case ErrorCode.VALIDATION:
      return 422; // Unprocessable Entity
    case ErrorCode.INTERNAL:
      return 500; // Internal Server Error
    case ErrorCode.THEOLOGY_GATE:
      return 451; // Unavailable For Legal Reasons
    default:
      const _exhaustive: never = code;
      return _exhaustive;
  }
}
