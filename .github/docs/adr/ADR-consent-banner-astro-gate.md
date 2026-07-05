# ADR — Consent banner restoration on the Astro root layout

**Status:** Accepted · **Date:** 2026-07-05 · **Scope:** praycalc/web

## Context
The Next.js → Astro migration (D-P2-STACK-CANON) dropped the GDPR cookie-consent
gate that used to wrap `web/app/layout.tsx`. The Astro root layout
(`web/src/layouts/RootLayout.astro`) loaded the Umami analytics script
unconditionally whenever `UMAMI_WEBSITE_ID` was set, with no `ConsentProvider`,
no banner, and no opt-out — a GDPR Art. 6/7 regression. The `Consent Banner Gate`
CI workflow (`.github/workflows/consent-banner-gate.yml`) was still checking the
old `web/app/layout.tsx` path, which no longer exists, so the gate was failing
outright rather than catching the regression.

The `@ummat/consent` vendor package (`web/vendor/consent/`) already ships
`ConsentProvider`, `CookieBanner`, `PreferencesModal`, and `ConsentGatedScript` —
built for reuse across Ummeco apps — but nothing in praycalc wired it up.

## Decisions
- **New island: `web/src/islands/ConsentGate.tsx`.** A single client component
  mounting `ConsentProvider` + `CookieBanner` + `PreferencesModal`, and gating
  the Umami script behind `<ConsentGatedScript category="analytics">`. Mounted
  once in `RootLayout.astro` with `client:load` so consent state is known before
  any analytics script can fire.
- **`@ummat/consent` added as a workspace dependency** of `web/` (`file:./vendor/consent`,
  matching the existing `@ummat/astro-preset` pattern). Both the root and the
  standalone `web/pnpm-lock.yaml` were updated (per the dual-lockfile convention —
  Vercel installs `web/` standalone).
- **Raw unconditional `<script src="https://cloud.umami.is/script.js">` removed**
  from `RootLayout.astro`. Umami now loads only via `ConsentGatedScript`, i.e.
  only after the `analytics` category is accepted.
- **`CookieBanner` mounted without a hardcoded `region` prop.** No geo-IP
  detection exists in this layout, so claiming `region="EU"` for all visitors
  would be inaccurate; the banner shows its region-neutral copy for everyone
  until real region detection is added.
- **CI gate rewritten** to check the Astro paths (`RootLayout.astro` imports
  `ConsentGate`; `ConsentGate.tsx` contains `ConsentProvider`; neither file has
  a raw unconditional Umami `<script>`), replacing the dead `web/app/layout.tsx`
  check.

## Deferred (tracked separately, not in this change)
1. **Backend consent-record sync.** `useConsent.tsx`'s `syncConsentToBackend`
   POSTs to `/api/consent`, which does not exist in this Astro app (404 →
   retry-with-backoff → localStorage queue). The vendor package already ships
   `handleConsentRequest` (`web/vendor/consent/src/server-handler.ts`) targeting
   Hasura tables `lg_consent_record` / `lg_policy_version` for the Art. 7 audit
   trail. Needs: confirm those tables exist in the shared Ummat Hasura backend,
   add the migration if not, and add `web/src/pages/api/consent.ts` as a thin
   Astro API route delegating to `handleConsentRequest`. The ported
   `/preferences` page's "Unsubscribe from marketing emails" button has the
   same gap — it posts to `/api/preferences/unsubscribe`, which has never
   existed in this app (Next.js or Astro); it will 404 until this item lands.

## Resolved (this follow-up, 2026-07-05)
2. ~~**Missing pages.**~~ Ported from the pre-migration Next.js app
   (git `a4993c5`):
   - `web/src/pages/preferences.astro` + `web/src/islands/preferences/PreferencesClient.tsx`
     — consent-category toggles + unsubscribe action. Mounts its own
     `ConsentProvider` (from `@ummat/consent/hooks`) rather than reusing
     `ConsentGate`'s — Astro islands are isolated component trees, so React
     context can't cross from the layout-level island into a page-level one.
     Both instances read/write the same localStorage-backed record, so they
     stay consistent across a page navigation (full reload).
   - `web/src/pages/legal/california.astro` — CCPA/CPRA disclosure, ported
     as a static page (no client state in the original).
   - `web/src/components/Footer.astro` now links "Cookie Settings" → `/preferences`
     on every page, so the page is reachable after the banner is dismissed.

   **U-15 status check:** confirmed still **open**, not resolved. The
   `ADR-DEFERRED` substitution applied to chatislam's and islamwiki's CCPA
   pages under ticket `P2-E5-W02-S02-T01` (2026-06-22) explicitly did **not**
   reach praycalc — that ticket's own QA-C notes record praycalc's CCPA page
   as still carrying raw `TODO(U-15)` comments, and `.claude/docs/FEATURES.md`
   lists only chatislam/islamwiki/ummat-app-web as confirmed-noindex, omitting
   praycalc. Counsel review of the CPRA sensitive-info classification has not
   returned. Accordingly `legal/california.astro` preserves the original
   gating unchanged: `noIndex={true}`, the yellow DRAFT banner, and every
   `TODO(U-15)` marker — none of it is presented as final or counsel-reviewed
   copy. Do not flip `noIndex` or remove the DRAFT banner without a recorded
   U-15 resolution.

## Consequences
- Umami cannot fire before consent on any page rendered through `RootLayout.astro`.
- `Consent Banner Gate` CI now exercises real, existing files and will catch a
  future regression instead of failing on a stale path.
- Consent choices are captured client-side (localStorage) today; they are not
  yet durably recorded server-side — tracked as follow-up ticket, item 1 above.
