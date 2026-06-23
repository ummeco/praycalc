/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly SENTRY_DSN_PRAYCALC: string;
  readonly SENTRY_AUTH_TOKEN: string;
  readonly UMAMI_WEBSITE_ID: string;
  readonly UMAMI_SRC: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
