# Architecture

## Project Structure

```
praycalc/
├── web/                    praycalc.com (Next.js 15)
│   ├── app/                App Router pages and API routes
│   │   ├── [country]/[state]/[city]/   city prayer times page
│   │   ├── api/            API routes (prayers, search, geo, calendar PDF)
│   │   └── account/        user account page
│   ├── components/         React components
│   ├── hooks/              custom hooks (useClock, useSettings, useSession)
│   ├── lib/                shared utilities, session management
│   ├── messages/           i18n translation files (8 languages)
│   ├── public/             static assets (adhan audio, icons)
│   └── tests/              Vitest unit + Playwright E2E
├── org/                    praycalc.org (documentation, Next.js + MDX)
│   └── src/                docs pages and components
└── flutter/                mobile app (iOS + Android)
    ├── lib/                Dart source
    │   ├── core/           providers, services, theme
    │   ├── features/       screen implementations
    │   └── shared/         models, widgets
    ├── packages/
    │   └── pray_calc_dart/ pure Dart prayer time engine
    └── test/               widget and unit tests
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Web frontend | Next.js 15, TypeScript, Tailwind CSS |
| Mobile | Flutter (iOS + Android) |
| Calculation engine | `pray_calc_dart` (pure Dart, no dependencies) |
| i18n | next-intl (EN, AR, TR, UR, ID, FR, BN, SO) |
| PWA | Serwist (service worker, offline caching) |
| Testing | Vitest (unit), Playwright (E2E), flutter_test |
| CI/CD | GitHub Actions, Shorebird (OTA patches) |
| Hosting | Vercel (web), App Store / Play Store (mobile) |

## Data Flow

1. User opens praycalc.com or the mobile app
2. GPS or city search provides coordinates
3. Prayer times calculated locally using astronomical algorithms
4. Results cached in localStorage / SharedPreferences
5. PWA service worker enables full offline mode

## Backend Integration

PrayCalc connects to the shared Ummat backend via GraphQL for:
- User authentication (shared SSO via Hasura Auth)
- Settings sync across devices
- Saved cities and preferences

API endpoint: `https://api.praycalc.com/v1/graphql`
