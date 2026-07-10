/// <reference path=".astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  // Server-only — never exposed to the browser bundle.
  readonly SENTRY_DSN_PRAYCALC: string;
  readonly SENTRY_AUTH_TOKEN: string;
  readonly HASURA_ADMIN_URL: string;
  readonly HASURA_GRAPHQL_ADMIN_SECRET: string;
  readonly UMAMI_WEBSITE_ID: string;
  // PUBLIC_-prefixed — inlined into the client bundle by Astro/Vite.
  readonly PUBLIC_SENTRY_DSN_PRAYCALC: string;
  readonly PUBLIC_AUTH_URL: string;
  readonly PUBLIC_HASURA_URL: string;
  readonly PUBLIC_BILLING_URL: string;
  readonly PUBLIC_BILLING_MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
