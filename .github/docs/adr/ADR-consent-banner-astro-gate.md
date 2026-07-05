# ADR — Consent banner regression from Next→Astro migration, and the gate that missed it

**Status:** Accepted · **Date:** 2026-07-05 · **Scope:** praycalc/web

## Context

`.github/workflows/consent-banner-gate.yml` (ticket S05-12) was written for the
Next.js `web/app/layout.tsx` root layout. It fails CI if that file is missing
`ConsentProvider`, or loads an Umami script without `ConsentGatedScript`.

The June 2026 Next→Astro migration (D-P2-STACK-CANON, commit range ending
`ecc0a7c`) replaced `web/app/layout.tsx` with `web/src/layouts/RootLayout.astro`.
The gate's path filter (`web/app/layout.tsx`) stopped matching anything, so it
silently stopped running — last recorded run 2026-06-24, a failure, and no run
since. Meanwhile `RootLayout.astro` loaded the Umami script unconditionally
with a comment claiming "cookieless, GDPR-safe (D-P3-21)," and had no
`ConsentProvider`/`ConsentGatedScript` equivalent anywhere in the codebase.

This needed a decision: was consent-gating deliberately dropped (Umami judged
cookieless-therefore-exempt), or was it an unintentional regression?

**Evidence for "unintentional regression":**
- `.claude/docs/compliance/cookie-consent-audit-2026-04-27.md` (C-08a, GDPR
  Art. 7 + ePrivacy audit across 8 Ummeco apps) explicitly flagged PrayCalc as
  NON-COMPLIANT and required consent-gating Umami — Umami being cookie-free
  does not exempt it; the audit's conclusion was it "may qualify under
  legitimate interest" but still needs a documented LIA, and the org's chosen
  standard was explicit opt-in via `@ummat/consent`, not an LIA carve-out.
- Commit `a4993c5` (S05/S05-08) actually built and wired this for the Next.js
  app: `<ConsentProvider>` wrapping the layout, `<CookieBanner>`, a
  `/preferences` management page, and a `/legal/california` CCPA page.
- `web/vendor/consent/` (the `@ummat/consent` package: `ConsentProvider`,
  `CookieBanner`, `PreferencesModal`, `ConsentGatedScript`, a Hasura-backed
  `/api/consent` handler) still exists on disk in this repo, fully built —
  but was not referenced from `web/package.json` and not imported anywhere
  in `web/src/`. It was carried into the Astro tree but never wired in.
- None of `/preferences`, `/legal/california`, or a cookie policy page exist
  under `web/src/pages/` today. Nothing suggests these were consciously
  retired — they simply weren't ported.
- This repo has one prior confirmed precedent for the same failure mode:
  `ADR-web-institutions-and-astro-react-pin.md` documents the `/institutions`
  page being silently dropped in the same migration and later restored.

Conclusion: **unintentional regression**, not a considered decision. D-P3-21
("Umami over Vercel Analytics") was never a decision to skip consent — the
audit and `a4993c5` predate D-P3-21 and already required gating.

## Decisions

- **Restore consent-gating in the Astro app**, reusing the existing
  `@ummat/consent` package rather than rebuilding it:
  - `web/package.json` now depends on `@ummat/consent` (`file:./vendor/consent`).
  - `web/src/islands/ConsentGate.tsx` is a new single React island wrapping
    `ConsentProvider` + `CookieBanner` + `PreferencesModal` + a
    `ConsentGatedScript` for Umami (category `analytics`). It has to be one
    island (not split across `<head>` script + `<body>` banner) because Astro
    does not share React context across separate `client:*` boundaries.
  - `web/src/layouts/RootLayout.astro` no longer renders a raw `<script>` for
    Umami — it renders `<ConsentGate client:load umamiSiteId={umamiSiteId} />`
    once, at the end of `<body>`.
  - `web/src/pages/legal/privacy.astro` now states that analytics only loads
    after consent, instead of implying no consent step exists.
- **`consent-banner-gate.yml` now targets the real files**
  (`web/src/layouts/RootLayout.astro` + `web/src/islands/ConsentGate.tsx`) and
  checks the split responsibility: the layout must render `<ConsentGate>` and
  must never itself contain a raw Umami `<script>`; the island must contain
  `ConsentProvider` and gate any Umami reference behind `ConsentGatedScript`.

## Consequences / explicitly deferred

- **`/api/consent` backend sync is not wired up.** `useConsent`'s
  `syncConsentToBackend` POSTs to `/api/consent`, which does not exist in this
  Astro app. Calls will 404, retry with backoff, then queue in `localStorage`
  and log a `console.warn`. The banner and category gating still work
  correctly client-side — only the server-side GDPR Art. 7 audit trail
  (`lg_consent_record` / `lg_policy_version` in the shared Hasura backend) is
  missing. Wiring this requires confirming those tables exist in the live
  Ummat backend (cross-repo, not verifiable from this checkout) and adding a
  `web/src/pages/api/consent.ts` route delegating to
  `handleConsentRequest` from `@ummat/consent`.
- **No `/preferences`, `/legal/california`, or dedicated cookie-policy page**
  exist yet in the Astro app. The banner's "Manage preferences" flow works via
  the in-page `PreferencesModal`; there is no footer link to reopen it once
  dismissed, and no CCPA-specific disclosure page. Both links in the banner
  currently point at `/legal/privacy`.
- Both gaps above are the same scope the original Next.js implementation
  covered (S05, S05-08, S30-T03) and should be re-ticketed for the Astro app
  rather than done as a drive-by in this fix.
