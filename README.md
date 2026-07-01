# PrayCalc

Accurate prayer times for Muslims, every device, every method, free forever.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/ummeco/praycalc/ci.yml?branch=main)](https://github.com/ummeco/praycalc/actions)
[![Version](https://img.shields.io/github/package-json/v/ummeco/praycalc?filename=web%2Fpackage.json)](https://github.com/ummeco/praycalc/releases)

**Live:** [praycalc.com](https://praycalc.com) | **Docs:** [praycalc.org](https://praycalc.org)

**P7 status (2026-05):** Stripe TEST mode only. Payment-gated features (Ummat+ premium) use Stripe TEST keys. No live charges. See [Changelog](.github/docs/changelog.md) for P7 updates.

## Engineering Charter — Required Reading

Before contributing, read [`.github/wiki/ENGINEERING-CHARTER.md`](.github/wiki/ENGINEERING-CHARTER.md). It is the single source of truth for code standards across every Ummeco repo. The most-read sections:

- [§ 21 Common AI-Agent Mistakes](.github/wiki/ENGINEERING-CHARTER.md#21-common-ai-agent-mistakes-read-before-any-change)
- [§ 4 Naming Conventions](.github/wiki/ENGINEERING-CHARTER.md#4-naming-conventions-master-reference)
- [§ 6 Documentation Bar](.github/wiki/ENGINEERING-CHARTER.md#6-documentation-bar)

## What is this

PrayCalc is a free, GPS-accurate Islamic prayer time calculator for web and mobile. It supports all major calculation methods (ISNA, MWL, Egypt, Umm al-Qura, Tehran, Karachi), Qibla direction, adhan reminders, and offline mode. It also powers prayer times across the Ummat app ecosystem.

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
- Desktop menu bar / tray app for macOS, Windows, Linux with live countdown

## Tech Stack

| Layer | Tech |
| --- | --- |
| Web | Next.js 15, TypeScript, Tailwind CSS |
| Mobile (Active) | React Native + Expo SDK 53 (iOS + Android) + react-native-tvos (TV platforms) |
| Mobile (Archive) | Flutter 1.2.3 — [archived branch](https://github.com/ummeco/praycalc/tree/archive/praycalc-flutter-1.2.3) (D-P2-PRAYCALC-RN) |
| Desktop | Tauri 2 + Vite + React 19 (macOS, Windows, Linux) |
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
├── desktop/    menu bar / tray app — Tauri 2 + Vite + React 19 (macOS, Windows, Linux)
└── flutter/    iOS + Android + macOS + Windows + Linux + TV + Watch + Smart Display
```

## Quick Start

Start the shared Ummat backend first:

```bash
cd ~/Sites/ummeco/ummat/backend && nself start
```

**Web app:**

```bash
cd web
cp .env.example .env.local   # fill in local Hasura + auth URLs
pnpm install
pnpm dev        # https://www.praycalc.local.nself.org:8543
```

**Docs site:**

```bash
cd org
pnpm install
pnpm dev        # http://localhost:3003
```

**Desktop app:**

```bash
cd desktop
pnpm install
pnpm tauri dev
```

**Flutter app:**

```bash
cd flutter
flutter pub get
flutter run
```

## Desktop Downloads

Latest release: [desktop-v1.1.1](https://github.com/ummeco/praycalc/releases/tag/desktop-v1.1.1)

| Platform | Installers |
| --- | --- |
| macOS (arm64) | `.dmg`, `.app.tar.gz` |
| Windows (x64) | `.msi`, `.exe` |
| Linux (x64) | `.deb`, `.AppImage`, `.rpm` |

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

## Contribute

See [`.github/wiki/Contributing.md`](https://github.com/ummeco/praycalc/wiki/Contributing) for architecture docs, contribution guidelines, and feature status.

## License

[MIT](LICENSE)
