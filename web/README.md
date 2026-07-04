# PrayCalc — Web App

Prayer time calculator at [praycalc.com](https://praycalc.com). Calculates prayer times, Hijri calendar, Qibla direction, and more.

## P4 Features Shipped

- Iftar countdown API (`/api/iftar`) — Ramadan hub integration (P4-C03)
- Nisab rates API (`/api/nisab`) — Zakat al-Fitr calculator (P4-C04)
- iOS home screen + lock screen widgets (WidgetKit — Flutter package)
- Apple Watch complication (WatchKit — separate watchOS target)
- WearOS complication (Jetpack Glance)
- macOS + Windows system tray
- Apple TV + Android TV ambient display
- Alexa skill (AlexaSkillsKit Lambda — 12 intents)
- Google Assistant action (Actions on Google — 8 intents)
- Push notification lifecycle (permission flow, quiet hours, opt-out)
- nSentry observability wiring (GlitchTip DSN + OTel)

## Tech Stack

Next.js 15 · TypeScript · Tailwind CSS · acamarata/pray-calc · Hasura GraphQL

## Dev

```bash
pnpm install
pnpm dev --port 3041
```

Local URL: `https://www.praycalc.local.nself.org:8543`

## Environment Variables

```env
# Server-only
REMOTE_SCHEMA_SECRET=
HASURA_GRAPHQL_ADMIN_SECRET=
APPLE_IAP_SANDBOX=true
GOOGLE_PLAY_SERVICE_ACCOUNT_JSON=
OTEL_EXPORTER_OTLP_ENDPOINT=
OTEL_SERVICE_NAME=praycalc

# Client + server
NEXT_PUBLIC_HASURA_URL=https://api.praycalc.local.nself.org:8543/v1/graphql
NEXT_PUBLIC_AUTH_URL=https://auth.local.nself.org:8543
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
```

See `.env.example` for full list.

## Production

Vercel project: `ummat-praycalc` · Domain: `praycalc.com`

## Content Pages

- `/institutions` — Islamic Calendar & accommodation guide for institutions
  (prisons, hospitals, schools, the U.S. military, employers). Build-time
  multi-year Umm al-Qura date table via `src/lib/islamic-dates.ts`
  (`@umalqura/core`; same engine as `src/lib/hijri.ts`). Static SSR content page,
  linked from the home footer.

> Note: `@astrojs/react` is pinned at `^4.4.2`. Do not bump to 6.x without
> migrating islands to the automatic JSX runtime and verifying the BUILT SSR
> output — 6.x compiles island JSX with the classic transform and throws
> `React is not defined` when server-rendering `client:load` islands. See
> `.github/docs/adr/ADR-web-institutions-and-astro-react-pin.md`.
