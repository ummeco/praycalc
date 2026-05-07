import type { NextConfig } from "next";
import path from "path";
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
      // challenges.cloudflare.com — Cloudflare Turnstile bot protection (D-P3-20, S6-04)
      "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
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
        // GlitchTip (self-hosted) error and performance event ingestion.
        "https://errors.ummat.dev",
      ].join(" "),
      // challenges.cloudflare.com — Cloudflare Turnstile widget runs inside an iframe
      "frame-src https://challenges.cloudflare.com",
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
  // Allow Next.js to trace and bundle files from the praycalc repo root
  // (one level above web/). Required for smarthome/alexa and smarthome/google
  // fulfillment handlers that live outside the web/ app root.
  outputFileTracingRoot: path.join(__dirname, ".."),
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
      {
        // LINK-C1: iOS Universal Links — AASA must be served as application/json
        // without redirect. Next.js public/ files serve correctly but we add an
        // explicit Content-Type so Apple's CDN caches the right MIME type.
        source: "/.well-known/apple-app-site-association",
        headers: [
          { key: "Content-Type", value: "application/json" },
          { key: "Cache-Control", value: "public, max-age=3600" },
        ],
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

// withSentryConfig wraps Next.js build to upload source maps to GlitchTip.
// T25.07: Set SENTRY_AUTH_TOKEN (=GLITCHTIP_AUTH_TOKEN), SENTRY_ORG, SENTRY_PROJECT in Vercel env vars.
// url points to self-hosted GlitchTip at errors.ummat.dev (not Sentry SaaS).
// Cast intermediate results to NextConfig to prevent pnpm multi-version type conflicts.
// @serwist/next ships source TS (no dist/), causing TypeScript to resolve 'next' from
// the pnpm store where the workspace's other next version (org's 16.1.7) may be hoisted.
// The runtime behavior is correct — casts only eliminate the spurious type mismatch.
const serwistWrapped = withSerwist(nextConfig) as NextConfig;
const sentryWrapped = withSentryConfig(analyzeBundles(serwistWrapped), {
  org: process.env.SENTRY_ORG ?? 'ummeco',
  project: process.env.SENTRY_PROJECT ?? 'praycalc-web',
  url: 'https://errors.ummat.dev', // GlitchTip self-hosted — valid at runtime, absent from v10 types
  silent: true,
  telemetry: false,
  hideSourceMaps: true,
  // Enable source map upload when SENTRY_AUTH_TOKEN is set (Vercel/CI only).
  sourcemaps: process.env.SENTRY_AUTH_TOKEN
    ? { disable: false, deleteSourcemapsAfterUpload: true }
    : { disable: true },
  widenClientFileUpload: false,
} as Parameters<typeof withSentryConfig>[1]) as NextConfig;
export default withNextIntl(sentryWrapped);
