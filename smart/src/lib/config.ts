// CFG-B2: Centralized smart server configuration.
//
// All tunable constants and environment variable reads live here.
// Import from this module instead of reading process.env directly in route files.
// Add new env vars to .env.example when adding them here.

// ── Hasura ────────────────────────────────────────────────────────────────────

export const HASURA_URL =
  process.env.HASURA_GRAPHQL_URL ?? 'http://hasura:8080/v1/graphql';

export const HASURA_ADMIN_SECRET =
  process.env.HASURA_GRAPHQL_ADMIN_SECRET ?? '';

export const HASURA_JWT_SECRET =
  process.env.HASURA_GRAPHQL_JWT_SECRET ?? '';

// ── JWT ───────────────────────────────────────────────────────────────────────

/** TV device JWT TTL: 30 days in milliseconds. */
export const TV_JWT_TTL_MS = 30 * 24 * 60 * 60 * 1000;

// ── Rate limits ───────────────────────────────────────────────────────────────

/** Maximum activation attempts per IP per minute on POST /activate. */
export const ACTIVATE_RATE_LIMIT = 10;

// ── Heartbeat ─────────────────────────────────────────────────────────────────

/** Mark device offline after this many milliseconds without a heartbeat (3 min). */
export const DEVICE_OFFLINE_THRESHOLD_MS = 3 * 60 * 1000;

// ── Timeouts ──────────────────────────────────────────────────────────────────

/** Timeout for all Hasura fetch calls (BUG-A9). */
export const HASURA_FETCH_TIMEOUT_MS = 10_000;

// ── Input limits ─────────────────────────────────────────────────────────────

/** Maximum length for device_name field. */
export const DEVICE_NAME_MAX_LEN = 100;

/** Maximum length for announcement text. */
export const ANNOUNCEMENT_TEXT_MAX_LEN = 500;

// ── App pairing codes ─────────────────────────────────────────────────────────

/** App-generated 4-digit codes expire after this many minutes. */
export const APP_CODE_TTL_MINUTES = 5;

// ── MinIO / object storage ────────────────────────────────────────────────────

export const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT ?? '';
export const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY ?? '';
export const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY ?? '';
export const MINIO_BUCKET = process.env.MINIO_BUCKET ?? 'praycalc-photos';
export const MINIO_REGION = process.env.MINIO_REGION ?? 'us-east-1';

// ── Environment ───────────────────────────────────────────────────────────────

export const NODE_ENV = process.env.NODE_ENV ?? 'development';
export const IS_PRODUCTION = NODE_ENV === 'production';
export const PORT = parseInt(process.env.PORT ?? '4010', 10);
