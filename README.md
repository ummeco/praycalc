# PrayCalc

GPS-accurate Islamic prayer time calculator for the web and mobile.

**Live:** [praycalc.com](https://praycalc.com) | **Docs:** [praycalc.org](https://praycalc.org)

## Features

- All major calculation methods (ISNA, MWL, Egypt, Umm al-Qura, Tehran, Karachi)
- GPS-based location with city search
- Qibla compass direction
- Adhan audio notifications with multiple reciters
- Monthly/yearly prayer calendars with PDF export
- PWA with full offline support (service worker + IndexedDB caching)
- 8 languages (EN, AR, TR, UR, ID, FR, BN, SO) with RTL
- Countdown to next prayer
- Dark mode (WCAG 2.2 AA, system-preference-aware)
- Accessible (WCAG 2.2 AA — axe audited, Playwright viewport matrix)
- Ummat+ premium features: smart home display, TV widget, home screen widgets

## Tech Stack

| Layer | Tech |
| --- | --- |
| Web | Next.js 15, TypeScript, Tailwind CSS |
| Mobile | Flutter (iOS + Android + macOS + Windows + Linux + TV + Watch + Smart Display) |
| Backend platform | nSelf (100% — self-hosted PaaS on Hetzner) |
| API | Hasura GraphQL Engine (all data access via GraphQL, no direct SQL) |
| Auth | Hasura Auth — shared SSO at auth.ummat.dev |
| Docs site | Next.js + MDX |
| i18n | next-intl (8 locales) |
| PWA | Serwist (service worker, offline caching) |
| Testing | Vitest (unit), Playwright (E2E, 3-viewport matrix) |
| Deploy | Vercel (projects: ummat-praycalc, ummat-praycalc-org) |

## Project Structure

```
praycalc/
├── web/        praycalc.com — Next.js web app
├── org/        praycalc.org — documentation site
└── flutter/    iOS + Android + macOS + Windows + Linux + TV + Watch + Smart Display
```

## Getting Started

### Prerequisites

Start the shared Ummat backend first:

```bash
cd ~/Sites/ummeco/ummat/backend && nself start
```

### Web App

```bash
cd web
cp .env.example .env.local   # fill in local Hasura + auth URLs
pnpm install
pnpm dev        # https://www.praycalc.local.nself.org:8543
```

### Docs Site

```bash
cd org
pnpm install
pnpm dev        # http://localhost:3003
```

### Flutter App

```bash
cd flutter
flutter pub get
flutter run
```

## Backend

All data access goes through Hasura GraphQL. Never use direct SQL or install `pg` / `drizzle-orm` at runtime. See [`.github/docs/settings-architecture.md`](.github/docs/settings-architecture.md) for the GraphQL client pattern and env var reference.

**Local API:** `https://api.praycalc.local.nself.org:8543/v1/graphql` (port 8543)
**Production API:** `https://api.praycalc.com/v1/graphql`

## Documentation

- [API Security](.github/docs/api-security.md)
- [Settings Architecture](.github/docs/settings-architecture.md)
- [Release Checklist](.github/docs/release-checklist.md)
- [Changelog](.github/docs/changelog.md)
- [Wiki](https://github.com/ummeco/praycalc/wiki)

## Contributing

See the [wiki](https://github.com/ummeco/praycalc/wiki) for architecture docs, contribution guidelines, and feature status.

## License

[MIT](LICENSE)

---

*Last updated: 2026-04-28*
