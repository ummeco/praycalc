# Architecture

## Project Structure

```
praycalc/
├── web/                    praycalc.com — Astro 5 + React 19 islands
│   ├── src/pages/          routes + API routes (prayers, search, geo, calendar.ics,
│   │                       auth/*, billing/*, tvs/) — city pages under [country]/[state]/[city]
│   ├── src/islands/        interactive React islands (settings, account, TV manager)
│   ├── src/lib/            shared utilities, GraphQL/session helpers
│   ├── src/i18n/           i18n (12 locales, RTL for ar/ur)
│   ├── public/             static assets (adhan audio, PWA icons/manifest)
│   └── __tests__/          Vitest unit + Playwright E2E
├── org/                    praycalc.org — Astro 5 + MDX + React 19 islands
│   └── src/                docs pages and components
├── desktop/                menu bar / tray app (Tauri 2 + Vite + React 19)
│   ├── src/                React frontend (tray popup UI)
│   └── src-tauri/          Rust shell (tray, autostart, notifications, updater)
├── mobile/                 iOS + Android phone/tablet (React Native + Expo SDK 53)
├── tv/                     Apple TV + Android TV + Fire TV (react-native-tvos, bare)
├── watchos/                watchOS companion (Swift + SwiftUI)
├── wearos/                 Wear OS companion (Kotlin + Jetpack Compose)
├── smart/                  smart home backend (Home Assistant, Alexa, Google Home, Shortcuts)
├── homebridge/             Apple HomeKit plugin (via Homebridge)
├── packages/pray-calc/     `@acamarata/pray-calc` — canonical TS prayer-time engine
└── flutter/                ARCHIVED reference only — superseded by mobile/ + tv/
```

## Tech Stack

| Layer | Technology |
| --- | --- |
| Web frontend | Astro 5, React 19 islands, TypeScript, Tailwind CSS v4 |
| Docs site | Astro 5 + MDX, React 19 islands |
| Mobile | React Native + Expo SDK 53 (iOS + Android); Flutter archived (D-P2-PRAYCALC-RN) |
| TV | react-native-tvos (bare) — Apple TV, Android TV, Fire TV |
| Calculation engine | `@acamarata/pray-calc` (zero-dependency TypeScript) |
| i18n | Astro built-in i18n routing — 12 locales on web, 21 on mobile |
| PWA | Serwist (service worker, offline caching, install-to-home-screen) |
| Testing | Vitest (unit), Playwright (E2E) |
| Desktop | Tauri 2, Vite, React 19 (macOS, Windows, Linux) — signed auto-update |
| CI/CD | GitHub Actions; mobile/TV OTA via expo-updates, desktop OTA via tauri-plugin-updater |
| Hosting | Vercel (web, org), App Store / Play Store (mobile, TV), GitHub Releases (desktop, mobile APK) |

## Data Flow

1. User opens praycalc.com or a native app
2. GPS or city search provides coordinates
3. Prayer times calculated locally via `@acamarata/pray-calc`
4. Results cached in localStorage / AsyncStorage / MMKV depending on surface
5. PWA service worker (web) enables full offline mode; native apps cache locally by default

## Desktop App

`desktop/` is a menu bar (macOS) / system tray (Windows, Linux) app built with Tauri 2, Vite, and React 19. No dock icon on macOS (`LSUIElement`); tray-only on all platforms.

- **macOS:** live countdown to next prayer rendered as tray text (`set_title`), plus click popup.
- **Windows / Linux:** countdown shown via tray tooltip on hover; click opens the popup (tray text is macOS-only).
- Popup auto-positions above or below the tray icon depending on taskbar position (top vs bottom).
- Auto-start on login and native notifications via `tauri-plugin-autostart` and `tauri-plugin-notification`.

**Release process:** pushing a `desktop-v*` tag triggers `.github/workflows/release-desktop.yml`, which builds a 3-OS matrix (macOS arm64, Windows x64, Linux x64) and publishes one GitHub release with all installers (`.dmg`/`.app.tar.gz`, `.msi`/`.exe`, `.deb`/`.AppImage`). The updater points at a separate rolling `desktop-latest` release tag (not the repo's overall `releases/latest`, which is shared with non-desktop tags). `.github/workflows/ci-desktop.yml` validates the same 3-OS build on every push to `main` touching `desktop/**`.

Current release: [desktop-v1.2.4](https://github.com/ummeco/praycalc/releases/tag/desktop-v1.2.4) (2026-07-10). Seamless auto-update (signed installers + in-app updater checking on launch and hourly) has shipped since v1.2.3.

## Backend Integration

PrayCalc connects to the shared Ummat backend via GraphQL for:
- User authentication (shared SSO via Hasura Auth at `auth.ummat.dev`)
- Settings sync across devices
- Saved cities and preferences

API endpoint: `https://api.praycalc.com/v1/graphql`

## Accounts & Entitlements

Every surface (web, mobile, desktop) signs in against the shared Ummat backend and gets back a JWT. Free accounts get the full calculator on every surface. Ummat+ ($9.99/yr) unlocks the TV app and Smart Home integrations.

Entitlement checks happen server-side, not in the client:
- The billing service converges the user's Hasura role (`plus`) with their subscription record on every Stripe/Apple/Google webhook.
- TV pairing writes are restricted to the `plus` role at the Hasura permission layer — a free account cannot insert a pairing row even by calling the API directly.
- Smart-home routes (Google Home / Alexa account linking, device and token issuance) run a `requirePlus` middleware that returns `402 ummat_plus_required` for non-Plus accounts.
- `/billing/checkout` returns `503 billing_disabled` while Stripe is unprovisioned for this account — no live charges happen yet.

This keeps the client dumb: the web account island, the mobile "Pair TV" screen, and the desktop Account tab all just call the same endpoints and show whatever the backend says, instead of each surface re-implementing its own gate.

## TV Control Data Flow

Two tables drive account-linked TV control, both in the shared Ummat backend:

- **`pc_tv_pairing`** — pre-registered when the TV app boots unpaired. It writes its own `device_id` and a public 6-digit PIN, then polls this row waiting to be claimed. When an Ummat+ user submits the PIN from web, desktop, or mobile, the claim is a single `UPDATE ... WHERE pin = $pin` that sets `user_id` — it never touches `device_id`, so the TV's identity is stable across the whole pairing lifecycle.
- **`pc_tv_settings`** — the single control plane. One row per paired TV, owned by the user. Every setting (name, accent color, stream source, rotation interval, weather toggle, per-TV location, countdown takeover window, per-prayer iqama offsets, prayer-name-only mode, calculation method, madhab, time format) lives here.

Flow: TV pre-registers PIN → Ummat+ user claims by PIN (device_id preserved) → any surface writes to `pc_tv_settings` → TV polls its own `device_id` row on `pc_tv_settings` every ~5s via the public Hasura role (read-only, scoped to display columns) → changes render on screen within one poll cycle.

Write access is asymmetric by design:
- The TV only ever reads `pc_tv_settings` (public role, by `device_id`) and writes its own `pc_tv_pairing` row.
- Web, desktop, and mobile write `pc_tv_settings` under the authenticated `user` role, scoped to rows they own.
- The web app never calls Hasura directly for TV data — it proxies through `/api/tvs`, which does a server-side Ummat+ check before touching the database (same ADR-010 server-side-token pattern used for auth elsewhere in the app).
