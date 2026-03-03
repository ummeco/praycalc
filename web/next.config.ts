import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";
import withBundleAnalyzer from "@next/bundle-analyzer";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

// Security headers applied to all routes.
//
// CSP notes:
//   - script-src: 'self' + 'unsafe-inline' for Next.js App Router inline scripts
//     (nonce-based strict-dynamic is not yet broadly compatible with App Router
//     without a custom middleware nonce provider; 'unsafe-inline' is the safe
//     fallback for Next.js 15/16 until nonce support is added).
//   - style-src: 'unsafe-inline' required — Tailwind and Next.js inject inline styles.
//   - font-src: fonts.gstatic.com for Google Fonts.
//   - img-src: tile CDNs for Leaflet maps + jsdelivr CDN for moon-cycle images.
//   - media-src: 'self' for adhan audio playback from /public.
//   - connect-src: Vercel analytics + Speed Insights endpoints.
//   - frame-ancestors: 'none' (equivalent to X-Frame-Options: DENY for CSP-aware browsers).
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      [
        "img-src 'self' data: blob:",
        "https://cdn.jsdelivr.net",
        "https://*.tile.openstreetmap.org",
        "https://*.basemaps.cartocdn.com",
        "https://*.tile.openstreetmap.fr",
        "https://unpkg.com",
      ].join(" "),
      "media-src 'self'",
      [
        "connect-src 'self'",
        "https://vitals.vercel-insights.com",
        "https://va.vercel-scripts.com",
        // Sentry error and performance event ingestion.
        "https://*.sentry.io",
        "https://*.ingest.sentry.io",
      ].join(" "),
      "frame-src 'none'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(self), geolocation=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // pray-calc → nrel-spa uses node:module (native addon via createRequire).
  // Mark as server-external so Turbopack never attempts to bundle them.
  serverExternalPackages: ["pray-calc", "nrel-spa"],
  // Empty turbopack config — required in Next.js 16 to acknowledge Turbopack
  // is intentional when a webpack plugin (Serwist) is also present.
  // Serwist's webpack plugin handles SW file injection; this suppresses the
  // "webpack config with no turbopack config" build error.
  turbopack: {},
  // Enable gzip/brotli compression for responses (improves transfer size on Vercel).
  compress: true,
  // Catch accidental side-effects in dev — safe to enable.
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.jsdelivr.net",
        pathname: "/gh/acamarata/moon-cycle/**",
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply security headers to all routes.
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

// Serwist wraps the Next.js config to inject service worker generation.
// Disabled in development so hot-reload is not affected.
// sw.ts lives in public/ and is compiled by Serwist into public/sw.js.
const withSerwist = withSerwistInit({
  swSrc: "public/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  // Exclude audio files from precaching — they are large and loaded on demand.
  exclude: [/adhan\//],
});

// Bundle analyzer — enabled via ANALYZE=true environment variable.
// Run: ANALYZE=true pnpm build
const analyzeBundles = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

// withSentryConfig is the outermost wrapper — it observes the final webpack
// config produced by all inner wrappers (Serwist + bundle analyzer) and injects
// Sentry's build-time plugin for source maps and auto-instrumentation.
export default withNextIntl(withSentryConfig(analyzeBundles(withSerwist(nextConfig)), {
  // Suppress Sentry plugin output during builds.
  silent: true,
  // Disable Sentry's build telemetry.
  telemetry: false,
  // Disable source map upload until SENTRY_ORG + SENTRY_PROJECT are configured.
  // Remove this block and set SENTRY_AUTH_TOKEN / SENTRY_ORG / SENTRY_PROJECT
  // in the Vercel project settings to enable source map uploads.
  sourcemaps: {
    disable: true,
  },
  // Only upload client files actually referenced — keeps build time lean.
  widenClientFileUpload: false,
}));
