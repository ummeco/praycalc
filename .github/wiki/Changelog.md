# Changelog

All notable changes to PrayCalc are documented here.

## [Unreleased — P4]

### Added

- Iftar countdown API (`/api/iftar`) — real-time iftar/suhoor times for Ramadan hub integration (P4-C03)
- Nisab rates API (`/api/nisab`) — gold and silver nisab values for Zakat al-Fitr calculator (P4-C04)
- iOS home screen widgets (WidgetKit — next prayer, Hijri date, countdown)
- iOS lock screen widgets (WidgetKit — compact next prayer)
- Apple Watch complication (WatchKit — next prayer + time remaining)
- WearOS complication (Jetpack Glance — next prayer tile)
- macOS system tray app (menu bar: prayer times + adhan alerts)
- Windows system tray app (taskbar: prayer times + adhan alerts)
- Apple TV ambient display (tvOS — full-screen prayer times + adhan overlay)
- Android TV ambient display (Android TV + Fire TV — prayer times + Quran ayah rotation)
- Alexa skill integration (AlexaSkillsKit Lambda — 12 intents: next prayer, today's times, Qibla, etc.)
- Google Assistant action (Actions on Google — 8 intents: next prayer, today's schedule, Qibla direction)
- Push notification lifecycle — permission flow, quiet hours, opt-out preferences
- nSentry observability wiring (GlitchTip DSN + OTel instrumentation)

---

## v0.9.4 (2026-03-09)

TV Command Center — Android TV and Fire TV support.

- **Android TV app:** Dedicated TV home screen with full-screen prayer times, live Hijri date, adhan overlay with countdown, and automatic adhan audio playback.
- **TV Command Center (mobile):** Manage connected TVs from the PrayCalc mobile app. View online/offline status, push settings, rename devices.
- **QR pairing:** Pair a TV to your account by scanning the QR code shown on the TV pairing screen. Manual 6-character code entry as fallback.
- **Kiosk mode:** Lock the TV display to prevent unauthorized access. Admin PIN entry to exit kiosk.
- **TV settings push:** Push calculation method, adhan voice, display theme, and brightness settings from mobile to TV in real time.
- **Live stream library:** Curated Islamic live streams (Makkah, Madinah, Al-Quds) available as ambient TV background.
- **Quran display:** Rotating ayahs displayed on the TV home screen with reciter selection.
- **Smart home dashboard:** TV-optimized overview of all smart home devices and prayer-time automations.
- **macOS TV management:** Manage connected TVs from the macOS menu bar popover (TVsView).
- **i18n TV pairing:** TV pairing strings localized to all 22 supported languages.
- **CI:** Added Windows and Linux Flutter build jobs to GitHub Actions.

## v0.9.3 (2026-03-08)

The "everything release": C core engine, desktop platforms, alerts, 22 languages.

- **C core engine:** Pure C prayer calculation library with zero dependencies. FFI bindings for Flutter. Enables offline prayer times on watches and embedded devices without phone connectivity.
- **Windows desktop app:** System tray integration, notifications, auto-start on login.
- **Linux desktop app:** System tray integration, notifications, auto-start on login.
- **TV alert system:** Full-screen adhan overlay with countdown timer and dismiss action on Android TV.
- **Desktop alert system:** Full-screen adhan overlay with countdown timer on macOS, Windows, and Linux.
- **IAP plugins:** Native StoreKit 2 (IAPPlugin.swift) and Play Billing (IAPPlugin.kt) for in-app purchases.
- **Smart home E2E:** End-to-end integration with /api/v1/integrations and /api/v1/devices endpoints.
- **Audio focus:** AudioFocusPlugin (Kotlin) pauses media playback during adhan on TV.
- **Privacy analytics:** Self-hosted analytics collector (/api/analytics) storing to Hasura. No PII, anonymous session hash only.
- **i18n expanded to 22 languages:** Added DE, ES, FA, HA, HI, IT, JA, KO, MS, NL, PT, RU, SW, ZH to existing EN, AR, TR, UR, ID, FR, BN, SO.
- **Watch bridge updated:** API-first architecture with C core offline fallback for WatchOS and Wear OS.

## v0.9.2 (2026-02-20)

- Fixed Firebase config injection in Flutter CI workflow.
- Fixed Android build failures in CI (unused function removal, TODO comment cleanup).

## v0.9.1 (2026-02-15)

- Bug fixes for CI pipeline stability.
- Improved GitHub Actions workflow reliability.

## v0.9.0 (2026-02-01)

Full i18n, CI/CD, and QA polish.

- **i18n:** 11 languages across web (next-intl) and Flutter (ARB): EN, AR, TR, UR, ID, FR, BN, SO.
- **Lighthouse CI:** Performance budgets (95+ scores, Core Web Vitals thresholds).
- **Stress testing:** k6 load tests (4 scenarios, 1000 virtual users).
- **Security audit:** OWASP checklist (8/10 pass, 2 medium findings documented).
- **Help pages:** 25+ FAQ entries across 6 categories with search.
- **API docs:** OpenAPI 3.0.3 spec for the smart home service.
- **Shorebird OTA:** Code push dependency, silent background download, CI jobs.

## v0.8.0 (2026-01-15)

Watch apps and macOS menu bar.

- **WatchOS app:** SwiftUI prayer list, countdown, Qibla compass, settings, complications (all families), 24h timeline, 4 XCTests.
- **Wear OS app:** Compose UI, ScalingLazyColumn, rotary input, tile + complications (ShortText/LongText/RangedValue), 4 tests.
- **Watch phone bridge:** WatchConnectivity (iOS) + DataLayer (Android) bridging prayer data to watches.
- **macOS menu bar:** MenuBarExtra popover showing next prayer, countdown, notifications, 4 tests.
- **Web iCal endpoint:** webcal:// subscription feed at /api/calendar/ics.
- **Platform parity audit:** Coverage matrix across 11 platforms.

## v0.7.0 (2025-12-01)

Smart home integration.

- **Prayer times REST API:** Cached endpoint with 18 tests.
- **Google Home Action:** 5 intents, SSML responses, 9 tests.
- **Alexa Skill:** Intent handlers, APL card, 12 tests.
- **Siri Shortcuts:** 3 shortcut files for quick prayer time queries.
- **Home Assistant (HACS):** Config flow, 10 sensors, automation blueprints (10+ YAML).
- **OAuth 2.0 adapter:** Authorization, token exchange, revocation.
- **Ummat+ paywall:** Stripe billing integration, 8 tests.
- **Voice testing:** 55 utterance tests across Google and Alexa.
- **Integration tests:** 30 tests covering OAuth, billing, webhooks, rate limiting.
- **Smart home docs:** praycalc.org features/smart-home.

## v0.6.0 (2025-10-15)

Ummat+ subscription and premium features.

- **Stripe integration:** Checkout, portal, webhook handling.
- **Upgrade page:** Premium feature showcase with subscription flow.
- **Gated features:** Smart home, TV, and widget features behind Ummat+ paywall.

## v0.5.0 (2025-09-01)

Cross-device sync and TV display.

- **TV display (Android TV / Fire TV):** Full-screen prayer clock (2x3 grid), masjid signage mode, ambient/screensaver with 39 MinIO-cached photos, weather overlay, D-pad settings, standalone entry point.
- **Cross-device sync:** Hasura Auth JWT, offline-first sync engine (last-write-wins, mutation queue), settings/cities/prayer log sync, conflict resolution UI, anonymous-to-auth migration.

## v0.4.0 (2025-07-15)

Advanced mobile features.

- **Multi-city pinning:** 5-city free tier, horizontal swipe bar.
- **Yearly calendar:** 4x3 heatmap grid with Islamic holidays.
- **iCal export:** Monthly/yearly .ics files with VALARM reminders.
- **Prayer statistics:** Charts, streaks, share card.
- **Travel mode:** Qasr toggle with Haversine 77km auto-detection.

## v0.3.0 (2025-06-01)

First batch of i18n and mobile features.

- **i18n:** Initial language support (EN, AR, TR, UR).
- **Prayer completion tracker:** Per-fard "I prayed" tracking.
- **Tasbeeh counter:** Haptics, presets, history.
- **Ramadan mode:** Auto-detect, Suhoor/Iftar labels, banner.
- **Prayer agendas:** Custom reminders with 7-day lookahead scheduling.
- **Sky gradient background:** Dynamic colors based on sun position.
- **Share prayer card:** PNG export via SharePlus.
- **Jumu'ah Al-Kahf reminder:** Friday Fajr+15min notification.

## v0.2.0 (2025-04-15)

Flutter mobile app for iOS and Android.

- **pray-calc-dart engine:** Dart port of the prayer calculation engine, 24/24 tests.
- **City search:** 49K+ cities in SQLite with 300ms debounce.
- **GPS geolocation:** Permission flow with persistence.
- **Qibla compass + AR mode:** flutter_compass with camera overlay.
- **Monthly calendar + Hijri:** DataTable with month navigation.
- **Moon phase + Hijri screen:** Jean Meeus algorithm.
- **Dark mode (OLED):** System/manual toggle.
- **Push notifications:** Per-prayer WorkManager scheduling, 3 channels.
- **Adhan audio playback:** just_audio with background audio support.
- **Android persistent shade:** Foreground service with 60s update cycle.
- **iOS Live Activity + Dynamic Island:** ActivityKit integration.
- **iOS WidgetKit (small + medium):** SwiftUI home screen widgets.
- **Android Glance widgets (2x1, 4x2):** Jetpack Glance widgets.

## v0.1.0 (2025-03-01)

Initial web app release.

- **Prayer times calculation:** 6 methods (ISNA, MWL, Egypt, Umm al-Qura, Tehran, Karachi) using NREL SPA.
- **City search:** 50K+ cities with server-side geo lookup.
- **GPS geolocation:** Browser Geolocation API with IP fallback.
- **Qibla compass:** Leaflet map with great-circle bearing.
- **Monthly calendar + Hijri dates:** Gregorian and Hijri side-by-side.
- **PDF calendar export:** Monthly, yearly, and Ramadan variants.
- **PWA:** Installable, offline-capable via Serwist service worker.
- **SEO:** Sitemap, JSON-LD, Open Graph, ISR for top 200 cities.
- **Accessibility:** WCAG 2.1 AA verified with axe-core.
- **Dark mode:** System preference detection with manual toggle.
- **Security:** CSP headers, rate limiting, input validation.
- **Error states:** Custom 404, 500, offline, and skeleton loading screens.

## 2026-07-04 — Web app: Institutions page + deep-review fixes
- **Restored** the Institutions accommodation-reference page at `/institutions`
  (Islamic dates table + guidance for prisons/hospitals/schools/military/employers),
  recovered from git and rebuilt on Astro + `@umalqura/core`. Footer link added.
- **Fixed (deep review):** bare city-slug routing (`/mecca` etc. were 404),
  unstyled search widget, missing hero + OG images, robots.txt sitemap URL, and a
  self-contradicting "No tracking" footer line.
- **Reverted** `@astrojs/react` 6→4.4.2 (broke island SSR: `React is not defined`).
- Full review + deferred items: `.github/docs/reviews/2026-07-04-web-deep-review.md`.
