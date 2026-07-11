# PrayCalc — Web App

Prayer time calculator at [praycalc.com](https://praycalc.com). Calculates prayer times, Hijri calendar, Qibla direction, city search, and account/Ummat+ features.

## Tech Stack

Astro 5 · React 19 islands · TypeScript · Tailwind CSS v4 · `@acamarata/pray-calc` · Hasura GraphQL · Serwist (PWA)

`@astrojs/react` is on `^6.0.1` with the automatic JSX runtime (PR #58) — an earlier attempt to bump from `4.4.2` broke SSR for `client:load` islands (`React is not defined`) and was reverted; the fix landed once the JSX-runtime migration was verified against the built SSR output, not just `astro dev`. See `.github/docs/adr/ADR-web-institutions-and-astro-react-pin.md` for the history.

## Dev

```bash
pnpm install
pnpm dev        # astro dev --port 3040
```

Via the shared nself proxy: `https://www.praycalc.local.nself.org:8543` (start the Ummat backend first — see repo root README).

## Environment Variables

Astro convention: only `PUBLIC_`-prefixed vars are inlined into the client bundle; everything else is server-only. See `.env.example` for the full, current list — it is regenerated from what `src/` actually reads (WEB-06 gap-closure; the previous version was 100% Next.js-era and referenced nothing this app uses).

```env
# Client-exposed
PUBLIC_HASURA_URL=            # Hasura GraphQL (CORS-restricted). Prod: https://api.praycalc.com/v1/graphql
PUBLIC_AUTH_URL=               # Shared Ummat Hasura Auth. Prod: https://auth.ummat.dev
PUBLIC_BILLING_URL=            # PrayCalc "smart" billing service. Prod: https://smart.praycalc.com/billing
PUBLIC_BILLING_MODE=           # Set to "disabled" to skip billing calls locally
PUBLIC_SENTRY_DSN_PRAYCALC=    # Client Sentry DSN (lazy-loaded, off critical path)

# Server-only
SENTRY_DSN_PRAYCALC=
HASURA_ADMIN_URL=
HASURA_GRAPHQL_ADMIN_SECRET=   # never exposed to the browser
```

## Production

Vercel project: `ummat-praycalc` · Domain: `praycalc.com`

## Content Pages

- `/institutions` — Islamic Calendar & accommodation guide for institutions (prisons, hospitals, schools, the U.S. military, employers). Build-time multi-year Umm al-Qura date table via `src/lib/islamic-dates.ts` (`@umalqura/core`; same engine as `src/lib/hijri.ts`). Static SSR content page, linked from the home footer.
- `/preferences` — GDPR privacy-preferences page (consent categories + marketing unsubscribe).
- Account page (`/account`) — sign in/up, saved settings, Ummat+ badge and `/upgrade` flow, and paired-TV management ("Add TV" by code, per-TV deep display settings).

## API Routes

`src/pages/api/` — `prayers`, `search`, `geo`, `calendar.ics`, `consent`, `healthz`, `auth/*` (signin/signup/refresh/signout), `billing/*` (checkout/status), `tvs/` (TV pairing + settings proxy, Ummat+-gated, server-side only — the browser never calls Hasura directly for TV data).
