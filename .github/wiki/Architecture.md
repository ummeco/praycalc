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
├── desktop/                menu bar / tray app (Tauri 2 + Vite + React 19)
│   ├── src/                React frontend (tray popup UI)
│   └── src-tauri/          Rust shell (tray, autostart, notifications)
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
| Desktop | Tauri 2, Vite, React 19 (macOS, Windows, Linux) |
| CI/CD | GitHub Actions, Shorebird (OTA patches) |
| Hosting | Vercel (web), App Store / Play Store (mobile), GitHub Releases (desktop) |

## Data Flow

1. User opens praycalc.com or the mobile app
2. GPS or city search provides coordinates
3. Prayer times calculated locally using astronomical algorithms
4. Results cached in localStorage / SharedPreferences
5. PWA service worker enables full offline mode

## Desktop App

`desktop/` is a menu bar (macOS) / system tray (Windows, Linux) app built with Tauri 2, Vite, and React 19. No dock icon on macOS (`LSUIElement`); tray-only on all platforms.

- **macOS:** live countdown to next prayer rendered as tray text (`set_title`), plus click popup.
- **Windows / Linux:** countdown shown via tray tooltip on hover; click opens the popup (tray text is macOS-only).
- Popup auto-positions above or below the tray icon depending on taskbar position (top vs bottom).
- Auto-start on login and native notifications via `tauri-plugin-autostart` and `tauri-plugin-notification`.

**Release process:** pushing a `desktop-v*` tag triggers `.github/workflows/release-desktop.yml`, which builds a 3-OS matrix (macOS arm64, Windows x64, Linux x64) and publishes one GitHub release with all installers (`.dmg`/`.app.tar.gz`, `.msi`/`.exe`, `.deb`/`.AppImage`/`.rpm`). `.github/workflows/ci-desktop.yml` validates the same 3-OS build on every push to `main` touching `desktop/**`.

Current release: [desktop-v1.1.0](https://github.com/ummeco/praycalc/releases/tag/desktop-v1.1.0) (2026-07-01).

## Backend Integration

PrayCalc connects to the shared Ummat backend via GraphQL for:
- User authentication (shared SSO via Hasura Auth)
- Settings sync across devices
- Saved cities and preferences

API endpoint: `https://api.praycalc.com/v1/graphql`
