# PrayCalc.com Deep Web Review — 2026-07-04

> 7-agent per-page audit of every praycalc.com route (source + live). Findings
> below were verified live. **Status legend:** ✅ FIXED & deployed · ⏳ pending (see
> "Deferred / product decisions"). Restoration + fixes shipped in commits
> `6d06acd`, `dbacf30`, `0f11041`, `5078629`, `d07c61e`.

## Fixed & deployed (verified live)
- ✅ **BLOCKER — city-slug routing.** Bare slugs (`/mecca`, `/london`, every `/times`
  link) 404'd; only 3-letter IATA codes resolved. Added a de-slugified name-lookup
  fallback in `web/src/lib/geo.server.ts`. All city URLs now 200.
- ✅ **Search widget styling.** Results dropdown used class names absent from CSS
  (drift from the E2E DOM contract); 7 `.location-*` classes had no rules. Realigned
  `LocationSearch.tsx` to the contract + added styles in `global.css`.
- ✅ **Missing assets.** Recovered `logo-sunrise.svg` (hero LCP, from git); generated
  a 1200×630 `og-image.png` (social previews were 404 site-wide).
- ✅ **robots.txt** sitemap → `sitemap-index.xml` (was a dead `/sitemap.xml`).
- ✅ **Footer copy** "No ads. No tracking." → "Privacy-friendly analytics only"
  (Umami loads on every page).
- ✅ **Regression caught & reverted:** `@astrojs/react` 6 (a parked Dependabot major)
  broke island SSR with `React is not defined` (home + /account 500). Reverted to
  4.4.2; see `.github/docs/adr/` and memory `lesson_astro_react_ssr_jsx_regression`.

## Deferred / product decisions (NOT changed — need direction)
- ⏳ `/contact` has no real contact method (links the marketing site).
- ⏳ `/times` meta claims "500+ cities" but lists 51.
- ⏳ Calendar PDF export buttons (city page) have no `onClick` — dead UI.
- ⏳ Checkout "launching soon" is a permanent dead-end on any transient failure.
- ⏳ No shared `Footer.astro` — 8+ pages have no footer; nav sets drift.
- ⏳ Home page has no `<h1>` (a11y/SEO); low-contrast footer text.
- ⏳ `[...slug]` unresolved-city redirect is 302→/404 (double-hop) not a clean 404.
- ⏳ Theology sanity-check on /about method framing (PPI content gate).

---

## Full agent report

# PrayCalc.com Engineering Audit Report

## 1. Executive Summary

Overall site health is **weak despite polished code quality** — the underlying engineering (Qibla math, Hijri calendar, SSRF hardening, a11y patterns) is genuinely solid, but a single routing bug in `geo.server.ts` **breaks the entire city-page product surface** (every link on `/times`, the app's primary use case, 404s live). Compounding that, the default OG image and hero LCP image are both 404 site-wide, the sitemap in `robots.txt` points to a dead URL, and there is no shared Footer component — resulting in inconsistent, drifting nav across almost every page. Fix the routing bug first; everything else is secondary.

---

## 2. Blocker/High Findings (sorted by severity)

| Severity | Page | Issue | Fix |
|---|---|---|---|
| **Blocker** | All city pages (`/mecca`, `/cairo`, `/london`, `/algiers`, every `/times` link) | `geocodeSlugParts()` in `geo.server.ts:79-86` only resolves 1-segment slugs via 3-letter IATA code regex; every real city slug (`mecca`, `cairo`, etc.) falls through to `null` → 404. **This breaks the core product surface live.** | Add `lookupGeoByName(parts[0])` fallback in the `parts.length===1` branch before returning null. Location: `web/src/lib/geo.server.ts:79-86`, consumed by `web/src/pages/[...slug].astro:22-28`. |
| **Blocker** | Home (`index.astro`) | Hero LCP image `/logo-sunrise.svg` (eager, fetchpriority=high) 404s live — file doesn't exist in `public/` or `dist/client/`. | Add `web/public/logo-sunrise.svg` or point to existing `/logo.svg`. Location: `web/src/pages/index.astro:51`. |
| **High** | Site-wide (all pages via `RootLayout`) | Default `og:image`/`twitter:image` (`/og-image.png`) 404s live on every page that doesn't override it (home, embed, privacy, terms, 404, about-adjacent). Broken social-share previews everywhere. | Add real `og-image.png` (1200x630) to `public/`, or point default `ogImage` at an existing asset. Location: `web/src/layouts/RootLayout.astro:32`. |
| **High** | Home | `LocationSearch.tsx` renders `.search-dropdown`/`.search-result-name`/etc. but `global.css` only defines `.location-search-dropdown`/`.location-search-item` — **zero matching rules**. Search dropdown, GPS button, popular-city pills, tagline, and geo-prompt dialog all render unstyled. | Reconcile class names between `LocationSearch.tsx:138-152`/`GeoPrompt.tsx` and `global.css:155-166`. |
| **High** | robots.txt | `Sitemap:` directive points to `/sitemap.xml` (404); real sitemap is `/sitemap-index.xml` (200, valid). Crawlers can't discover the sitemap. | Change `web/public/robots.txt:4` to `sitemap-index.xml`. |
| **High** | `/times` index | All 51 city links use single-segment hrefs (`/${slug}`) that hit the same routing bug above — every link on this page 404s. | Fix via the geo.server.ts fallback (same root cause), or emit correct multi-segment hrefs matching `geoRecordToResult()`. Location: `web/src/pages/times/index.astro:44`. |
| **High** | Home | Zero heading elements (h1/h2/h3) anywhere on the page. | Add a visually-hidden `h1` near top of `<main>`. Location: `web/src/pages/index.astro`. |
| **High** | `/contact` | No actual contact method — just a circular link to praycalc.org (the marketing site, not a support inbox). | Add mailto: link, lightweight form, or GitHub Issues link. Location: `web/src/pages/contact.astro:21-31`. |
| **High** | `/embed` widget | Theme default mismatch: loader script (`praycalc.js`) defaults to `light`; `embed.astro` server render defaults to `dark`. Anyone hand-writing an iframe gets undocumented dark theme. | Make both files agree on one canonical default; cross-reference comment in each. Location: `web/public/embed/praycalc.js:8`; `web/src/pages/embed.astro:18`. |
| **High** | Home footer / privacy policy | Footer claims "No ads. No tracking." while Umami analytics loads on every page (including this one) and the privacy policy itself admits it. Site contradicts its own privacy claim. | Change footer copy to "No ads. Privacy-friendly analytics only." Location: `web/src/pages/index.astro:88`. |

---

## 3. Medium Findings (grouped by theme)

**SEO / Meta**
- `og:image` default reasserted as medium-severity across `embed.astro`, `privacy.astro`, `terms.astro`, `404.astro` (same root cause as the High above — listed here per its own audit entry) — `RootLayout.astro:32`.
- `account.astro` omits `canonical` prop unlike sibling `upgrade.astro`/`upgrade/success.astro` (low practical impact since `noIndex=true`) — `web/src/pages/account.astro:15`.

**Consistency / Navigation**
- No shared Footer component exists anywhere (`grep` for `*footer*` = zero matches). Footer link sets drift independently: home has 5 links, about has 3 (different wording, no self-link), contact has 1, and **city pages, `/times`, `/account`, `/upgrade`, `/upgrade/success`, and both legal pages have no footer/praycalc.org link at all**. City pages are the highest-traffic template with zero footer nav. — `index.astro:78-90` vs `about.astro:65-71` vs everything else.
- `[...slug].astro` uses `Astro.redirect('/404')` with no explicit status → defaults to 302, so unresolvable city slugs look like a temporary redirect (double-hop to real 404) instead of a clean 404. — `web/src/pages/[...slug].astro:27`.

**Content Quality**
- `legal/terms.astro` has no link to privacy policy, no contact link, no liability/governing-law clause — thin for a production app affecting religious practice. — `web/src/pages/legal/terms.astro:23-39`.
- `top-cities.ts` has a leftover stub comment ("expand to 500... use 50 for compilation") and only 51 entries, but `/times` meta description claims "500+ cities" — an order of magnitude short. — `web/src/lib/top-cities.ts:1,15`.
- All four PDF export buttons in `CalendarModal.tsx` (Year Calendar, Booklet, 2x Download) have no `onClick` and no disabled/coming-soon state — dead UI. — `web/src/islands/city/CalendarModal.tsx:165,166,188,239`.

**Accessibility**
- Footer nav links/tagline use `text-white/25` and `text-white/15` at 12px — roughly 2:1 contrast, well below WCAG AA 4.5:1. — `web/src/pages/index.astro:62,80,87`.
- Signed-in Dashboard (`AccountClient.tsx`) has no `h1` anywhere — the signed-out SignIn card correctly has one, but the authenticated view skips straight to h2. — `web/src/islands/account/AccountClient.tsx:371-446`.

**UX / Product**
- Checkout failure is a dead end: once `checkoutState` becomes `'unavailable'` (billing disabled OR any transient API failure), the button permanently shows "Ummat+ launching soon" with no reset/retry path — misleads users with expired tokens or network blips into thinking the feature isn't shipped. — `web/src/islands/account/AccountClient.tsx:327,357-369,430-438`.

---

## 4. Low / Nits

- Tagline is localized (en/ar/ur) but page `<title>`/description are hardcoded English — `index.astro:34-38`.
- `.about-pill` fixed position may visually collide with focused skip-link on mobile — `index.astro:41-48`.
- Duplicate `'new-york'` entry in `TOP_CITIES` renders two identical tiles on `/times` — `top-cities.ts`.
- No `BreadcrumbList` JSON-LD on city pages despite country>state>city slug hierarchy — `[...slug].astro:42-62`.
- `about.astro` back-link says "← Back" while 4 other info pages say "← Home" — `about.astro:21`.
- `contact.astro` meta description is a thin placeholder ("Contact PrayCalc.") — `contact.astro:12`.
- Mosque emoji on `about.astro` uses `role="img"` where `aria-hidden="true"` would be more correct (purely decorative) — `about.astro:25`.
- Uncited superlative: NREL SPA called "the most accurate solar position model available for civilian use" — `about.astro:38`.
- `upgrade.astro` back-link says "← Home", Dashboard says "← PrayCalc" for the same destination — inconsistent vocabulary.
- `$9.99/yr` has no visual emphasis on `/upgrade` marketing page vs. styled treatment in the Dashboard upsell card.
- `embed.astro` silently falls back to Mecca for unresolvable `?city=` with no error signal to publisher or viewer — `embed.astro:22-27`.
- No public docs page for the embed widget (theme/size/city options) — only inline code comments.
- Long-lived embedded iframe never refreshes; no "as of HH:MM" staleness cue.
- Both legal pages hardcode "Last updated: June 2026" with no mechanism tying it to actual edits.
- `calendar.ics.ts` derives day-0 from server UTC "now" regardless of requested timezone — could be a day off late at night UTC.
- Theology-review flag (not a bug): pairing the proprietary "Dynamic Method" default with the ahl us-sunnah consensus statement on `about.astro:36-54` could be misread as scholarly endorsement of that specific method — recommend a scholar sanity check per PPI theology gate.

---

## 5. Cross-Cutting Recommendations

1. **Fix `geo.server.ts` city-slug resolution first.** This is the single highest-leverage fix — it silently breaks the entire city-page product (the app's core feature) across every entry point (`/times`, direct links, presumably any marketing/social links using bare city slugs).
2. **Build a shared `Footer.astro` component** (About / All Cities / Privacy / Terms / praycalc.org) and render it from `RootLayout` on every non-embed page. Currently 8+ pages have zero footer and 2 more have hand-rolled, drifting subsets. This single component fixes the Consistency findings on 3 separate audits.
3. **Resolve the OG-image gap once, globally.** One missing `public/og-image.png` (or a wrong default pointer in `RootLayout.astro:32`) is producing "high" findings on 5 separate page audits (home, times, embed, legal, 404). Fix the asset and re-verify with `curl -I` on all og:image URLs.
4. **Add a CI/E2E smoke check that crawls every internal `<a href>` and asserts 200.** Both the city-slug 404s and the sitemap-vs-robots.txt mismatch would have been caught pre-deploy by a simple link-crawl test — worth adding given how much of this report is dead links.
5. **Reconcile island CSS class names against `global.css` in one pass** — the `LocationSearch`/`GeoPrompt` mismatch suggests a refactor left stale selectors; worth grepping all `.tsx` island class names against `global.css` definitions in one sweep rather than one-by-one.

---

## 6. Notable Strengths

- Qibla bearing (`qibla.ts`) uses correct great-circle math with accurate Ka'bah coordinates; Hijri calendar correctly uses Umm al-Qura table-driven algorithm per D-P7-21, avoiding known-inaccurate alternatives.
- SSRF hardening on the geo/IP-lookup API route is careful and well-commented (private-range rejection, strict IPv4/IPv6 regex).
- Skip-to-content link correctly uses the clip technique (not `left:-9999px`), avoiding the classic RTL bug — consistent site-wide.
- City pages ship a real SSR sr-only prayer-time table alongside the `client:only` interactive island — a deliberate, well-documented SEO/hydration tradeoff that gives crawlers real data.
- Stripe checkout flow is defensive throughout: billing-disabled short-circuits, all network calls catch-and-fallback (no unhandled rejections), social sign-in buttons correctly disabled with "Coming soon" rather than faked, webhook-based (not client-trusted) entitlement.
- `calendar.ics.ts` correctly implements RFC 5545 75-octet line folding — an easy detail to miss, handled properly.
- Theology framing on `/about` is appropriately hedged and consistent with the PPI theology gate (Shia/Jafari method correctly excluded from exposed list).
- No fabricated content found anywhere in the audit — privacy policy claims match actual code behavior.
---

## Update 2026-07-05 — P1 backlog completed

All deferred/product-decision items from this review are now shipped:
- ✅ Shared `Footer.astro` rendered by RootLayout on every page (was absent on
  8+ pages / hand-rolled + drifting); WCAG-AA link contrast. Inline home/about
  footers removed.
- ✅ Home page `<h1>` (sr-only) — a11y/SEO.
- ✅ `/times` "500+ cities" → "any city worldwide" (accurate).
- ✅ `/[...slug]` unresolved city → `Astro.rewrite('/404')` (proper 404, no 302
  double-hop; 404.astro sets status).
- ✅ `/contact` real channels: email (salam@praycalc.com), GitHub issues, docs.
- ✅ CalendarModal dead PDF buttons → `window.print()` + scoped `@media print`
  (clean calendar save-as-PDF); .ics remains primary export.
- ✅ Checkout dead-end → retryable 'error' state (was permanent 'launching soon'
  on any transient failure).

Only remaining item: a scholar sanity-check of the /about Dynamic-Method framing
(human review, per the PPI theology gate — not a code change).

**Note:** `salam@praycalc.com` needs email/DNS routing configured to receive mail.
