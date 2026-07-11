# PrayCalc

Accurate prayer times for Muslims, every device, every method, free forever.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Build](https://img.shields.io/github/actions/workflow/status/ummeco/praycalc/ci.yml?branch=main)](https://github.com/ummeco/praycalc/actions)
[![Version](https://img.shields.io/github/package-json/v/ummeco/praycalc?filename=web%2Fpackage.json)](https://github.com/ummeco/praycalc/releases)

**Live:** [praycalc.com](https://praycalc.com) | **Docs:** [praycalc.org](https://praycalc.org)

**Billing status (2026-07):** Stripe is not yet provisioned for this account. `/upgrade` shows a "launching soon" state instead of checkout — no live charges. Accounts, sign-in, and the free calculator work today on every surface. See [Changelog](.github/docs/changelog.md).

## Engineering Charter — Required Reading

Before contributing, read [`.github/wiki/ENGINEERING-CHARTER.md`](.github/wiki/ENGINEERING-CHARTER.md). It is the single source of truth for code standards across every Ummeco repo. The most-read sections:

- [§ 21 Common AI-Agent Mistakes](.github/wiki/ENGINEERING-CHARTER.md#21-common-ai-agent-mistakes-read-before-any-change)
- [§ 4 Naming Conventions](.github/wiki/ENGINEERING-CHARTER.md#4-naming-conventions-master-reference)
- [§ 6 Documentation Bar](.github/wiki/ENGINEERING-CHARTER.md#6-documentation-bar)

## What is this

PrayCalc is a free, GPS-accurate Islamic prayer time calculator for web, mobile, desktop, and TV. Its flagship method is DPC (Dynamic Prayer Calculation), alongside fixed presets (MWL, ISNA, Egypt, Umm al-Qura, Karachi, UOIF) and Custom — Tehran and Jafari are intentionally excluded (D-P3-19). It also supports Qibla direction, adhan reminders, and offline mode, and powers prayer times across the Ummat app ecosystem.

## Features

- DPC (Dynamic Prayer Calculation, default) plus fixed presets — MWL, ISNA, Egypt, Umm al-Qura, Karachi, UOIF — and Custom (Tehran/Jafari intentionally excluded, D-P3-19)
- GPS-based location with city search
- Qibla compass direction
- Adhan audio notifications (web: Mishari, Makkah; mobile: Makkah, Mishari, Madina)
- Monthly/yearly prayer calendars with PDF export
- PWA with full offline support (service worker + IndexedDB caching, installable to home screen)
- Web: 12 languages (EN, AR, UR, FA, ID, TR, MS, BN, FR, ES, DE, RU) with RTL for Arabic/Urdu. Mobile: 21 languages.
- Countdown to next prayer
- Dark mode (WCAG 2.2 AA, system-preference-aware)
- Accessible (WCAG 2.2 AA — axe audited, Playwright viewport matrix)
- Ummat account sign-in on web, mobile, and desktop — one login across the ecosystem
- Ummat+ ($9.99/yr): unlocks the TV app and Smart Home integrations (Google Home, Alexa)
- Desktop menu bar / tray app for macOS, Windows, Linux with live countdown and seamless auto-update

## Tech Stack

| Layer | Tech |
| --- | --- |
| Web | Astro, TypeScript, Tailwind CSS |
| Mobile (Active) | React Native + Expo SDK 53 (iOS + Android) + react-native-tvos (TV platforms) |
| Mobile (Archive) | Flutter 1.2.3 — [archived branch](https://github.com/ummeco/praycalc/tree/archive/praycalc-flutter-1.2.3) (D-P2-PRAYCALC-RN) |
| Desktop | Tauri 2 + Vite + React 19 (macOS, Windows, Linux) |
| Backend platform | nSelf (100% — self-hosted PaaS on Hetzner) |
| API | Hasura GraphQL Engine (all data access via GraphQL, no direct SQL) |
| Auth | Hasura Auth — shared SSO at auth.ummat.dev |
| Docs site | Astro + MDX |
| i18n | Astro built-in i18n routing (12 locales) |
| PWA | Serwist (service worker, offline caching) |
| Testing | Vitest (unit), Playwright (E2E, 3-viewport matrix) |
| Deploy | Vercel (projects: ummat-praycalc, ummat-praycalc-org) |

## Project Structure

```
praycalc/
├── web/        praycalc.com — Astro web app
├── org/        praycalc.org — documentation site
├── desktop/    menu bar / tray app — Tauri 2 + Vite + React 19 (macOS, Windows, Linux)
├── mobile/     iOS + Android phone/tablet — React Native + Expo SDK 53
├── tv/         Apple TV + Android TV + Fire TV — react-native-tvos
├── watchos/    watchOS companion — Swift + SwiftUI (scaffold)
├── wearos/     Wear OS companion — Kotlin + Jetpack Compose (scaffold)
├── smart/      Smart Home backend (Google Home + Alexa fulfillment)
└── flutter/    ARCHIVED reference only — do not add features here (see Tech Stack)
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

**Mobile app:**

```bash
cd mobile
pnpm install
pnpm start
```

**TV app:**

```bash
cd tv
pnpm install
pnpm start
```

`flutter/` is an archived reference only (superseded by `mobile/` + `tv/` per D-P2-PRAYCALC-RN) — do not run or extend it.

## Desktop Downloads

Current version: **v1.2.4**. Latest release: [ummeco/praycalc releases](https://github.com/ummeco/praycalc/releases?q=desktop-v) (filter to `desktop-v*` tags — the repo also cuts mobile/TV/whole-platform releases, so `/releases/latest` is not reliable for desktop specifically).

The app ships with seamless auto-update (signed installers + in-app updater) since `desktop-v1.2.3` — install once and future versions download in the background and prompt "Restart to update" when ready.

| Platform | Installers |
| --- | --- |
| macOS (arm64) | `.dmg`, `.app.tar.gz` |
| macOS (Intel/x64) | `.dmg`, `.app.tar.gz` |
| Windows (x64) | `.msi`, `.exe` |
| Linux (x64) | `.deb`, `.AppImage` |

## Android APK Direct Install

Every `mobile-v*` tag also publishes a signed APK to [GitHub Releases](https://github.com/ummeco/praycalc/releases?q=mobile-v) for direct sideload install — no Play Store account needed. Download the `.apk` asset, enable "install unknown apps" for your browser/file manager, and open it. This is a separate path from the Play Store listing (which ships from the same version via a manual EAS Submit dispatch) — the two can be a build or two apart in practice.

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
