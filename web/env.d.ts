/// <reference path=".astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SENTRY_DSN_PRAYCALC: string;
  readonly SENTRY_AUTH_TOKEN: string;
  readonly HASURA_GRAPHQL_ADMIN_SECRET: string;
  readonly REMOTE_SCHEMA_SECRET: string;
  readonly UMAMI_WEBSITE_ID: string;
  readonly PUBLIC_API_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
