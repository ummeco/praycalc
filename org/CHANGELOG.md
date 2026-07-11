# Changelog

All notable changes to the praycalc.org docs site are documented here.
Format loosely follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## 2026-07-10

- PWA manifest, icons, and service worker added.
- Live-verified API docs rewrite; AA contrast fixes including the code-copy button's resting state (now axe-gated, since it's always visible on touch); phone-width table scroll; touch-visible controls.
- Frozen-lockfile installs in CI; dead ReDoc removal.
- Lighthouse + axe quality gate added for praycalc.org (previously web-only).

## 2026-07-08

- Fixed accessibility issues and deprecated API usage; added hreflang alternates for translated locale routes; expanded REST API docs page.

## 2026-07-07

- Reached Lighthouse Accessibility/Best-Practices/SEO 100 and Performance 99 (conditional Sentry loading, image/asset tuning).
- Restored the Tailwind Protocol theme (green-tuned) across the docs site.
- Added DPC (Dynamic Prayer Calculation) hero + JSON-LD structured data and a live Qibla compass.

## 2026-07-06

- Recorded final deep-QA pass findings (charter updates, mistake log).

## 2026-07-03 — 2026-07-04

- Synced `pnpm-lock.yaml` after cumulative Dependabot bumps (`@types/node`, `@astrojs/vercel`, `@astrojs/react`, and grouped minor/patch updates).

## 2026-06-27

- **Migrated the docs site from Next.js to Astro 5** (MDX content, React 19 islands for interactive widgets, static output via the Vercel adapter).

## 2026-06-23 — 2026-06-25

- Landed the P2-E3 Astro 5 migration groundwork and Hijri date helpers; briefly restored the legacy Next.js Vercel config to unblock a production deploy during the cutover.

## 2026-06-13

- Patched transitive `@grpc/grpc-js` and `fast-uri` dependencies (security).

## 2026-05-20

- Moved `SECURITY.md` to `.github/docs/SECURITY.md` (repo hygiene).

## 2026-05-05 — 2026-05-07

- Legacy Next.js era: pinned `next`/`@next/mdx` to 16.1.7 (16.2.4 broke MDX metadata exports), removed `next/link` and `next/dynamic` usage from MDX components to eliminate client-boundary taint, and regenerated the workspace lockfile after a vendor consent sync.

## 2026-04-27 — 2026-04-29

- Patched CVEs; delivered IAP/subscription gating, TV dashboard, and an SSRF guard (shared work across `praycalc/web` and `praycalc/org`).

## 2026-03-22

- Removed the legacy `.eslintrc`, added a flat ESLint config for `org/`, fixed flaky rate-limit tests, resolved Flutter compile errors, and updated lint/contact pages.

## 2026-03-16

- Updated the desktop and TV feature docs pages for the v1.2.0 app release.

## 2026-03-12

- v1.0 release notes: TV display, desktop, mobile, smart home, and web dashboard features documented.

## 2026-03-03 — 2026-03-06

- Initial standalone `praycalc.org` repo split out from the monorepo; early Flutter-era build fixes (tolerant child lookup replacing `Children.only`).
