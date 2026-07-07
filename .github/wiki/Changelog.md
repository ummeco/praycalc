# Changelog

All notable changes to PrayCalc are documented here.

## 2026-07-07 — Deep review round: 16 verified fixes

Three Opus review agents (correctness, security with live production probes, architecture) audited everything shipped 2026-07-06; every finding was adversarially verified before approval. Highlights:

- **Notifications now reschedule immediately** when you change calculation method, location, madhab, high-latitude rule, custom angles, travel mode/city, or adhan voice — previously they kept firing at stale times until app restart (worst case: travelers getting home-city alarms)
- Bundled fallback cities now carry IANA timezones (DST-correct); stored-city rendering no longer assumes the device timezone
- Notification titles/bodies localized (with proper plurals); adhan playback rejects non-https URLs
- Production hardening: TV pairing rows self-deactivate after 1 hour (bounds pin-guess exposure); the pashaii voice removed per the recorded Gate B content decision
- Refactors: prayer label keys deduplicated from 7 copies to one module; the two parallel state-component systems consolidated (a11y gap closed); SettingsScreen split from 542 to 285 lines; zustand persist versioning added
- 20 new tests (notification scheduling, qibla bearing, DST) — suite now 62

Also: desktop v1.2.1 published; expo prebuild now validates end-to-end (track-player patch, real icon set replacing placeholder squares); full surface roadmap authored (.github/docs/roadmap/); GitHub Actions billing bypassed via self-hosted runners on ummat-sentry.

## 2026-07-06 — Absolute-100% closure (mobile 2.1.0 · desktop 1.2.1 · web 2.0.1)

Closed every tracked partial from the parity re-audit, plus backend provisioning that turned out to be missing entirely.

**Backend (production Hasura — none of these tables existed):**
- `pc_adhan_voice` created + seeded with 8 recordings (already shipped in Flutter 1.2.3, now served from praycalc.com/adhan/)
- `pc_cities` created + seeded with the full 49,742-city Flutter dataset
- `pc_tv_pairing` created; mobile↔TV pair loop verified live end-to-end (a client mutation-shape fix landed alongside)

**Mobile 2.1.0:**
- Adhan plays as the real notification sound: bundled 26.6s opening-takbir cut (iOS 30s limit), dedicated Android channel; full reciter adhan still plays on tap
- Iqamah reminders (per-prayer offset, off/10/15/20/30 min)
- Mosque finder (OpenStreetMap Overpass, 10 km, open-in-maps, attribution)
- Full i18n extraction: 374 keys across 30 screens, locale-aware dates, EN-fallback with human-review tracking (`src/i18n/REVIEW.md`); religious content never machine-translated
- Android home-screen widget (react-native-android-widget) — travel-aware next prayer, refreshes on reschedule; iOS WidgetKit remains the one tracked PCI
- PARITY-GATE: 19/20 PASS, 1 tracked PARTIAL (iOS widget)

**Desktop 1.2.1:** version bump covering the earlier auth bare-path + billing host fixes.
**Web 2.0.1:** four additional adhan recordings published under /adhan/.

## 2026-07-06 — Mobile competitive-parity closure

Final verification pass against competitor adhan apps (Muslim Pro, Athan, Pillars), every screen re-read against real code. Commits `3cec3d9`, `f2202c2`, `98c3371`.

**Fixed (was broken or dead):**
- Onboarding never ran — no route ever navigated to it and the done-flag was never set; now a root gate runs it on first launch (existing users auto-pass)
- Prayer notifications silently expired after 3 days if the app stayed closed — the background reschedule task existed but was never registered; now registered at app start + on enable
- The 21-locale i18n system was dead code (zero importers) — now initializes at startup with RTL support, a Settings language picker, and translated prayer names/core strings

**Added (competitive gaps):**
- Dark mode (System/Light/Dark) across all 26 screens/components
- Per-prayer manual minute corrections (±30) and Hijri date adjustment (±2 days)
- Monthly prayer timetable screen with `.ics` calendar export
- Tapping a prayer notification plays the selected reciter's adhan

**Honesty corrections:**
- PARITY-GATE.md re-audited: 6 overstated rows corrected (16 PASS, 4 tracked PARTIALs)
- Subscription screen now lists only actually-gated Pro features

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

## 2026-07-05 — Web P1 polish + mobile core fixes
- **Web:** shared Footer on every page, home h1, accurate city-count copy, proper
  404s, real contact channels, working calendar PDF export, retryable checkout.
- **Mobile:** real prayer engine (pray-calc v2), Quran scoped to Islam.Wiki
  deep-links, 5 dead CTAs wired. (Full mobile parity continues in a dedicated
  session — see `.github/docs/reviews/2026-07-05-mobile-competitive-audit.md`.)
- **Desktop:** verified complete for scope (real engine via API, no stubs).

## 2026-07-06 — Final deep QA pass (web · desktop · mobile)
- **Auth (all platforms):** every client called `auth.ummat.dev/v1/auth/*` — a
  path nginx has no upstream for (502). Production sign-in had never worked.
  All clients now use hasura-auth's real bare paths (verified live).
- **Billing:** defaults pointed at `api.praycalc.com/billing` (404); corrected
  to the real `smart.praycalc.com/billing` in web proxy routes + desktop
  (+ Tauri CSP). Ummat+ entitlement checks now reach the service.
- **Web:** /embed made frameable (was blocked site-wide — the widget feature
  was dead); tz validation (400 instead of masked 500); city pages get a real
  SSR h1; /preferences fixes (single footer landmark, canonical, working
  unsubscribe, California link held per U-15 counsel gate); E2E search flake
  fixed with deterministic response waits.
- **Mobile:** travel-aware Qibla (useActiveLocation), offline state wired to
  expo-network (was dead code), parity-doc Tehran row corrected.
- Repo hygiene: 12 stale session branches/worktrees pruned (all content
  verified merged or superseded); master list updated with 5 new entities.
