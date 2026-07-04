# ADR — Institutions page home & @astrojs/react version pin

**Status:** Accepted · **Date:** 2026-07-04 · **Scope:** praycalc/web

## Context
1. The `/institutions` accommodation-reference page (Islamic dates + guidance for
   prisons/hospitals/schools/military/employers) existed in the Next.js era and was
   lost in the June Next→Astro migration (`ecc0a7c`). It needed restoring.
2. A deep review found the page's home was a live question (praycalc.com vs the
   praycalc.org docs site), and separately that `@astrojs/react` 6 (a parked
   Dependabot major) broke island SSR.

## Decisions
- **Institutions lives on praycalc.com** (`/institutions`), not praycalc.org.
  Rationale: it is the original URL (SEO), the `info-page` styles + `@umalqura/core`
  Hijri engine already exist on web/, and every CTA drives into the app. praycalc.org
  would only win if .com didn't fit; it fits.
- **Date engine = `@umalqura/core` (Umm al-Qura)**, in `web/src/lib/islamic-dates.ts`,
  reusing the same engine as `lib/hijri.ts` (D-P7-21). Table auto-starts at the
  current Hijri year (+15 forward) so it never goes stale. Sourced/labelled as
  Umm al-Qura with a ±1-day moon-sighting caveat (honest per the content gate),
  not strictly "FCNA".
- **Pin `@astrojs/react` at ^4.4.2.** Version 6 compiles `client:load` island JSX
  with the classic transform → `ReferenceError: React is not defined` at SSR
  (home + /account 500). The 6.x upgrade is deferred until the automatic JSX runtime
  is wired and the BUILT SSR output is verified (`astro build` success and `astro dev`
  both mask the bug; `@astrojs/vercel` blocks `astro preview`).

## Consequences
- `/institutions` is a static SSR content page; sitemap auto-includes it.
- Dependabot must not re-merge `@astrojs/react` majors without the JSX-runtime
  migration + built-SSR verification (tracked as a spawned task).
