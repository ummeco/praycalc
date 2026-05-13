# Changelog

All notable changes to PrayCalc are documented here. Versions follow semver.
Build numbers (the `+N` suffix on Flutter) increment with every store submission.

---

## [Unreleased — P7 Engineering Excellence Foundation] — 2026-05

> No version bump. P7 ships infrastructure, not a new public release.

### Changed

- Engineering Excellence Foundation applied: ADR standards, CI quality gates, documentation enforcement
- Stripe TEST mode confirmed: no live charges. Live activation gated to P8 per D-P7-18
- README updated with P7 status badge and Stripe TEST notice

---

## 1.2.0 — Dashboard Screenshots, Real-Time Push, tvOS, watchOS

*March 2026*

### TV Dashboard

- Web dashboard can now capture a live screenshot of any paired TV — press "Capture Now" and the current screen uploads to MinIO and appears in the dashboard within seconds
- Settings changes from the web dashboard push instantly to the TV via Hasura WebSocket subscription (no polling)
- SSE reconnect now uses exponential backoff (2s → 4s → 8s → 60s cap)
- Debug overlay shows both SSE and WebSocket connection status

### Native Apple TV App (tvOS)

- Brand new native Swift app for Apple TV — prayer times, countdown, full Quran player with Arabic text, live streams (Makkah, Madinah, Al-Aqsa, Quran Radio), adhan alert overlay, city search, children's mode

### watchOS

- WCSession sync implemented — prayer times push from iPhone to Apple Watch automatically
- ClockKit complication shows next prayer + countdown
- Source files ready; Xcode target wiring required (see `flutter/ios/PrayCalcWatch/README.md`)

### Platform & CI

- MinIO `praycalc-screenshots` bucket for TV screenshot storage
- Security: screenshot register endpoint now validates device ownership and key namespace
- Smart server Docker image published to `ghcr.io/ummeco/praycalc-smart` on every release
- Full automated release workflow: tag `v*` → builds all platforms → GitHub Release with artifacts

### Bug Fixes

- MIME type mismatch in screenshot presigned URL fixed (`image/png` was signed as `image/jpeg`)
- Authorization headers added to all web dashboard screenshot API calls
- tvOS prayer times URL deduplicated into `Config.swift`

---

## v1.1.0 — TV Command Center + Platform Expansion

*March 2026*

This is the first major feature release since public launch. The headline is TV Command Center,
but this release also ships across every platform: iOS widgets, Android widgets, WearOS,
Apple Watch, desktop (macOS/Windows/Linux), Fire TV, and the developer ecosystem.

### TV Command Center

**Auth and pairing**
- RFC 8628 device flow with QR code pairing from mobile app or web dashboard
- Guest mode and session persistence; JWT stored in flutter_secure_storage
- Mobile "Add from code" screen — scan QR or type a 4-digit code
- TV sharing: share your display with another Ummat account via email lookup

**Layouts and navigation**
- 4 preset layouts: masjid, home, minimal, fullscreen
- Full D-pad navigation for Android TV remote
- Configurable info bar: Hijri date, location, temperature — each toggleable
- Prayer countdown toggle on info bar

**Live streams**
- 10 built-in streams: Mecca, Medina, Al-Aqsa, Quran Radio, Islamic lectures
- Custom RTMP/HLS URL support
- Stream health checker with auto-reconnect

**Quran audio**
- everyayah.com CDN, 9 reciters
- Full-screen Arabic verse display in Amiri font
- Lock screen controls

**Launcher mode**
- Set TV app as Android home launcher
- Triple-back escape to Android launcher
- Boot receiver: app starts on TV power-on

**Adhan**
- Mosque silhouette animation at prayer time
- Per-prayer audio and volume configuration
- Prayer completion badges

**Ambient screensaver**
- Three modes: user photo slideshow, geometric pattern, world map overlay
- Time-based brightness profiles (day/night)
- Google Photos picker for user photos
- Fire TV Stick Lite detection: disables heavy ambient modes automatically

**Children mode**
- Confetti adhan animation
- Character icons for each prayer name
- PIN-protected D-pad entry
- Prayer name explanations (age-appropriate text)

**Masjid mode**
- Iqamah offsets per prayer
- Special layouts for Ramadan, Eid, Jumu'ah
- Group announcement broadcast from web dashboard

**Remote management**
- Web dashboard at praycalc.com/dashboard/tvs
- Live device list with SSE connection status indicator
- One-click screenshot with image display
- Push settings to device in real time
- Group announcements to multiple TVs at once

**Security**
- flutter_secure_storage for JWT storage
- Kiosk PIN salted with device ID
- Rate limiting on all pairing endpoints (10 requests per window)
- Input validation and length caps throughout
- CSRF protection on all web dashboard mutations
- Next.js middleware for all /dashboard/* and /api/dashboard/* routes

### iOS Widgets

- systemSmall (1x1): next prayer + countdown
- systemMedium (2x1): full 5-prayer schedule with next prayer highlighted
- Lock screen widget (existing)
- Flutter writes widget keys on every prayer time calculation

### Android Widgets

- 2x1 widget: next prayer + countdown, click-to-open
- 4x2 widget: full 5-prayer grid, next prayer highlighted in brand green, past prayers dimmed
- WorkManager midnight refresh
- Click actions on all widgets

### WearOS

- DataClient sync from phone on every prayer calculation
- PrayCountdownTile: dark green background, brand green countdown text, 60-second auto-refresh
- Handles day-wrap: "in 23h 14m" if next prayer is tomorrow Fajr

### Apple Watch

- WCSession sync from phone; stores payload in App Group UserDefaults
- Complications: circular, modular, utilitarian, graphic circular, graphic corner, graphic bezel, graphic rectangular
- `CLKComplicationServer.reloadTimeline()` called on every sync

### Desktop (macOS, Windows, Linux)

- System tray with next prayer + countdown
- Adhan alert window (brought to front before alert plays)
- macOS dock bounce at prayer time
- window_manager: proper show/hide, focus, sizing
- Menu items: Open PrayCalc, TV Devices, Settings, Quit

### Fire TV

- Separate Amazon build flavor (amazon-build.sh)
- Gradient-only ambient mode on Stick Lite
- Submission guide in .github/docs/fire-tv-submission.md

### Audio and Spiritual

- 20+ adhan voices with CDN streaming, preview, per-prayer selection
- Custom adhan recording via microphone or file import
- Haptic adhan with per-prayer patterns and accessibility toggle
- Notification actions: "I Prayed", "Remind in 10 minutes", "Start Dhikr"
- Iqamah notification: configurable offset (5, 10, 15, 20, or 30 minutes)
- Tahajjud notification: last-third-of-night calculation, opt-in, off by default
- Duha notification: 20 minutes after sunrise, opt-in, off by default
- Post-salah dhikr: guided counter (33x SubhanAllah, Alhamdulillah, AllahuAkbar) with haptic
- Quran player: everyayah.com, 9 reciters, verse-by-verse Arabic, background audio, lock screen controls

### Home Screen

- Sky gradient: weather-aware via Open-Meteo, rain and cloud overlays
- Moon phase icon: 8 phases in home screen corner, taps to Hijri calendar
- Prayer card fan: arc layout with spring animation, swipe to inspect
- Prayer stats: 52x7 heatmap (52 weeks), daily goal slider, streak tracking, milestone notifications at 7/30/100-day

### Ramadan

- Suhoor/Iftar times from user location via public prayer times API
- Juz progress tracker: interactive toggle cells, localStorage per Hijri year
- Day N of Ramadan + days to Eid + full Hijri date display
- Ramadan microsite at praycalc.com/ramadan

### Web

- 500+ city prayer time pages at praycalc.com/times/[city] (ISR + JSON-LD schema)
- Embeddable widget: add `<script src="praycalc.com/embed/praycalc.js">` to any site
- iFrame embed at /embed?city=...
- Email digest: /digest subscribe + weekly cron
- Dua/Adhkar library at /duas
- Prayer stats web at /stats (auth-gated, bar charts, streaks)
- Agendas at /agendas (CRUD, share slugs)
- Tasbeeh counter at /tasbeeh (8 presets, Vibration API)
- About page at /about
- Privacy and Terms pages with "Delete my data" button

### Developer Ecosystem

- `pray-calc` npm package (published)
- `pray_calc_dart` pub.dev package (published)
- `pray-calc` Python package (PyPI)
- `PrayCalc` Swift Package
- `pray_calc` Go module
- Public REST API at /api/v1/public/times
- OpenAPI spec at praycalc.org/api
- `homebridge-praycalc` plugin: adhan triggers, prayer LED, auto do-not-disturb

### Infrastructure

- Config centralized: app_config.dart (Flutter), config.ts (smart server)
- Error handling culture: all bare `catch (_) {}` replaced with logged catches
- Settings sync: lastModified LWW conflict resolution
- Tests: 4 new regression tests (auth/ownership, rate limiting, prayer calc, notifications)
- CI: macOS build added, continue-on-error removed
- i18n: TV dashboard, desktop tray, children mode, Ramadan — all 22 languages
- Accessibility: Semantics labels, 48dp tap targets, icon-only tooltips
- Offline: optimistic agenda creation with sync queue; settings flush within 30s

---

## v0.9.9 — Quality, CI, i18n, Accessibility, Store

*March 2026 (internal)*

Focus: code quality, CI hardening, internationalization completeness, accessibility, and App Store preparation.

### CI Hardening

- macOS build job added to flutter-ci.yml (`flutter build macos --debug` on macos-latest)
- Removed `continue-on-error: true` from Shorebird patch jobs; failed patches now fail CI
- Removed `continue-on-error` from high-severity npm audit step in web CI

### i18n Completeness

- Web TV dashboard: all hardcoded English extracted to `web/messages/*.json` under "tv" namespace
- Flutter desktop tray menu: `desktopOpen`, `desktopQuit`, and related keys added to all ARB files
- TV Children Mode prayer explanations: all 22 language ARB files updated
- Ramadan Hijri year: was hardcoded "1447", now computed from current Gregorian date

### Code Quality

- 25+ bare `catch (_) {}` in TV code replaced with `catch (e, st)` + `_log.warning(...)`
- `Announcement.copyWith()` added to `tv_settings_model.dart`
- Vendored pray-calc: `VERSION` file + CI validation step
- Smart server CI upgraded to Node 22
- `flutter_local_notifications` upgraded from dev to stable `^21.0.0`

### Accessibility

- `Semantics` labels added to all prayer time cards on home, settings, and notification screens
- All 48x48dp tap target requirements met
- `tooltip:` or `Semantics(label:)` on all icon-only buttons and gesture detectors

### Performance

- Fire TV Stick Lite detection via DeviceInfoPlugin: disables world map + geometric pattern, uses gradient-only ambient

### Navigation and Links

- iOS Universal Links: Associated Domains entitlement + `/.well-known/apple-app-site-association` for `/times/*`, `/widget/*`, `/share/*`
- Notification cold-start routing: `getNotificationAppLaunchDetails()` on startup + `GoRouter.go('/home?prayer=...')` on tap

### Offline

- Offline agenda creation: optimistic local-first write with sync queue; 3 offline events sync on reconnect
- Mobile settings offline sync: `pendingChanges` in `SyncState`; flush within 30 seconds of reconnection

### App Store

- `.github/docs/app-store-listing.md`: full descriptions, keywords, content rating
- Privacy page at `web/app/privacy/page.tsx`
- Terms page at `web/app/terms/page.tsx`
- "Delete my data" button in settings, linked from store listing

---

## v0.9.8 — UX Fixes, Architecture, Error Handling, Tests

*March 2026 (internal)*

Focus: fixing UX friction discovered in QA, provider architecture, error surfacing, and regression tests.

### UX Fixes

- Location denied: "Set City Manually" card shown; taps to city search
- GPS failure in onboarding: "Enter your city instead" button after 10-second timeout
- iOS notification permission: requested after city selection, not at cold start
- Calculation method change: notifications rescheduled immediately
- "I Prayed" notification action: also stops adhan audio
- TV pairing code: 5-minute countdown shown; auto-requests new code on expiry
- JWT expiry warning: persistent banner shown 24h before TV token expires
- TV location null state: after 60 seconds of null poll, shows "Set a location in dashboard" + QR code
- SSE connection indicator dot on TV (debug mode)
- Group announcements: minimum TV count lowered to 1 (was 3)

### Architecture

- AuthProvider: 30-second timeout on signIn/signUp; shows "Request timed out" on error
- PrayerProvider: returns `AsyncValue.error(NoLocationError)` when city is null
- SyncProvider: `String? error` field; surfaces 401 and network errors in settings
- Android widget SharedPrefs key prefix verified and corrected
- TvSettings conflict resolution: `lastModified` LWW — keeps local if local timestamp is newer

### Error Handling

- Systematic bare-catch audit across all TV feature files (25+ instances)
- Systematic bare-catch audit across all core providers and notification/geo/auth services
- Smart server: all routes return proper error codes; no silent 200 on internal errors

### Security (wave 2)

- flutter_secure_storage for TV JWT (replaces SharedPreferences)
- PIN entry salted with device ID (kiosk mode hardening)

### Sync

- Settings sync: `localVersion`/`remoteVersion` fields; LWW resolution
- Offline settings changes queued and flushed within 30 seconds of reconnection

### Tests

- Auth/ownership regression test: verifies device JWT cannot access other user's devices
- Rate limiting regression test: verifies activate endpoint enforces rate limit
- Prayer calc edge tests: high-latitude cities, midnight sun, polar night
- Notification regression test: verifies Iqamah and Tahajjud scheduling at boundary times

---

## v0.9.7 — Security Hardening, Critical Bugs, Migrations

*March 2026 (internal)*

Focus: fixing critical security issues found in a 4-agent parallel CR+QA sweep of 151 issues.

### Security Hardening

- `GET /api/v1/tv/:id/settings`: added `requireAuth` middleware + device ownership check (was unauthenticated)
- `GET /api/v1/tv/:id/announcements`: added device ownership check (had auth but no ownership verification)
- `POST /api/v1/tv/activate`: rate limited to 10 attempts per IP per 15 minutes
- `POST /api/v1/tv/app-code`: rate limited; code TTL enforced server-side
- TV SSE endpoint: device JWT required; malformed JWTs now return 401 immediately
- Web dashboard pages: all `/dashboard/*` routes protected by Next.js middleware
- CSRF protection: origin header validated on all `/api/dashboard/*` mutations
- Input validation: device name max 100 chars, announcement text max 500 chars
- API security audit document: all 14 smart server route files documented in `.github/docs/api-security.md`

### Critical Bug Fixes

- TV settings push: device offline detection (>90 seconds) returns 410 Gone, not silent 200
- Prayer time calculation: edge case fix for cities past ±60° latitude with certain methods
- Adhan audio: `AdhanService.stop()` now called correctly when "I Prayed" notification action tapped
- Notification channel: `praycalc_sunnah` channel added for Iqamah/Tahajjud/Duha (was missing)

### Migrations

- TV device table: `last_seen_at` column added; backfilled from SSE connection timestamps
- TV settings model: `lastModified` field added with `?? null` default (backward-compatible)
- Notification preferences: `SunnahNotificationConfig` model with `iqamahOffsetMinutes` field

---

## v0.9.6 — Platform Completion

*March 2026 (internal)*

Focus: bringing every platform to 100% feature coverage.

### iOS Widgets

- systemSmall home screen widget: next prayer + countdown (was lock-screen only before)
- systemMedium home screen widget: full 5-prayer schedule with next prayer highlighted
- Flutter writes `widget_next_prayer`, `widget_next_prayer_time`, `widget_location_name` keys and calls `updateWidget()`

### Android Widgets

- Large 4x2 widget: all 5 prayers, next highlighted in brand green (#C9F27A), past dimmed
- Click actions on all widgets: tap opens app at prayer times screen
- WorkManager midnight refresh and onResume refresh

### Quran Player

- Arabic verse text display: fetched from alquran.cloud API, cached, shown in Amiri font RTL
- Background audio playback via `audio_service` package and `QuranAudioHandler`
- Lock screen controls with Now Playing metadata
- iOS background audio mode enabled

### WearOS

- Flutter app sends prayer times to WearOS DataClient on every calculation
- `PrayCountdownTile`: dark green (#1E5E2F) background, brand green (#C9F27A) countdown, 60-second refresh

### WatchOS

- Phone to Watch via `WCSession`: `AppDelegate` sends prayer dict on every calculation
- Watch stores payload in App Group UserDefaults and calls `CLKComplicationServer.reloadTimeline()`
- All complication families supported

### Ramadan Page

- Suhoor and Iftar times from user location via public prayer times API (was hardcoded)
- Juz progress tracker: interactive toggle cells, localStorage per Hijri year
- Day N of Ramadan + days to Eid + Hijri date computed via JDN algorithm

### Sunnah Notifications

- Iqamah: configurable offset (5, 10, 15, 20, or 30 minutes after adhan time)
- Tahajjud: last-third-of-night calculation, opt-in, off by default
- Duha: 20 minutes after sunrise, opt-in, off by default
- Settings screen: new "Sunnah Prayers" section with toggles and offset dropdown

### Prayer Statistics

- Yearly heatmap: 52x7 grid, green intensity by completion count, tap for day detail sheet
- Daily completion goal: slider (1–5 prayers), milestone notifications at 7/30/100 days
- Streak tracking: current and best streak displayed

### Dhikr

- "Start Dhikr" notification action button on prayer arrival notifications
- Routes to DhikrFlowScreen on cold-start tap

### MinIO Screensaver Photos

- Smart server: `POST /api/v1/tv/:id/photo/upload` returns presigned S3 PUT URL
- TV: Google Photos picker → upload to MinIO → stores key in screensaver settings
- Upload progress bar; keys stored in `TvScreensaverSettings`

---

## v0.9.5 — Stubs Fixed, TV Sharing

*March 2026 (internal)*

Focus: resolving all confirmed stubs and adding TV account sharing.

### Stubs Fixed

- MinIO upload: smart server now returns real presigned URL from MinIO SDK, gated on `MINIO_ENDPOINT` env var (returns clear error if unconfigured)
- TV info bar Jumu'ah text: localized via ARB key `tvJumuahGreeting` in all 22 languages
- TV info bar prayer countdown toggle: wired to `TvInfoBarConfig.showPrayerCountdown` model field; respects setting in `TvInfoBar` widget
- Web TV dashboard screenshot: fetch + display wired; "Take Screenshot" button with loading state

### TV Sharing

- Share TV with another Ummat account via email lookup
- Shared-with-me section in web dashboard
- Shared device appears in recipient's dashboard with read-only settings view
- Share acceptance flow; revoke sharing from owner dashboard
- Smart server routes for share create/list/revoke
- Hasura permissions: shared user gets read role on device

---

## v0.9.4 — TV Quran, Mobile Home, Desktop

*March 2026 (internal)*

Focus: wiring all previously built but disconnected components.

### TV Quran Panel

- `TvQuranService` wired with Riverpod provider
- SSE Quran command events (`play`, `stop`, `next`, `prev`) handled in TV home screen
- `TvQuranVerseDisplay` rendered in TV layout body
- Quran state subscription active in `_TvHomeScreenState`

### Mobile Home Screen

- Moon phase icon: 8 phases, shown in home screen corner, taps to Hijri calendar
- Prayer card fan: arc layout, spring animation, swipe to inspect; settings toggle
- Sky gradient background: weather-aware via Open-Meteo, rain overlay, cloudy desaturation
- Home screen weather particles (rain/snow) shown based on Open-Meteo conditions

### Desktop Full Wiring

- `window_manager` added to pubspec.yaml
- `DesktopTrayApp` lifecycle integrated into `PrayCalcApp`
- System tray icon appears on macOS, Windows, Linux
- `DesktopAdhanAlert.init()` called in `main()`
- `/desktop` route added to GoRouter; `DesktopFullWindow.registerShowCallback()` wired
- `DesktopAlertScheduler` started; prayer times monitored; alerts fire at prayer time
- Tray left-click shows popover; menu items route correctly to Settings and TV Devices
- `windowManager.ensureInitialized()` called in main; window behavior defined
- macOS build directory added; entitlements (network.client) + Info.plist configured
- Windows app icon resource added
- macOS Info.plist: notification alert style set

---

## v0.9.3 — TV Command Center Foundation

*Early 2026 (internal)*

The TV feature set was built across Phases P, Q, R, S, T, U:

- RFC 8628 device pairing flow
- QR code generation and display
- TV JWT authentication
- Web dashboard device list and settings
- Smart server TV routes: activate, settings, announcements, SSE
- TV home screen with prayer times, adhan, info bar
- Ambient screensaver modes (geometric, world map)
- Children mode (base implementation)
- Kiosk PIN
- Guest QR code from TV settings

---

## v0.9.2 — Audio, Dhikr, Smart Home

*Late 2025 (internal)*

- Multi-voice adhan: 20+ reciters, CDN streaming, preview, per-prayer selection
- Custom adhan recording via microphone and file import
- Haptic adhan patterns per prayer
- Post-salah dhikr counter (3-phase guided)
- Notification actions: "I Prayed", "Remind in 10 minutes"
- Homebridge plugin (`homebridge-praycalc`)
- Public REST API (`/api/v1/public/times`)

---

## v0.9.0 — Desktop, WearOS, WatchOS Scaffold

*Late 2025 (internal)*

- Desktop system tray scaffold (macOS/Windows/Linux)
- WearOS tile scaffold
- WatchOS complication scaffold
- iOS lock screen widget
- Android 2x1 home screen widget

---

## v1.0.0 — Public Launch

*2025*

First public release on the App Store and Play Store.

### Features

- Accurate prayer times via GPS or manual city selection
- Calculation methods: ISNA, MWL, Egypt, Umm al-Qura, Tehran, Karachi
- Asr method: Standard (Shafi) and Hanafi
- High-latitude methods: angle-based, one-seventh, middle-of-night
- Qibla direction compass
- Adhan reminders with local notification scheduling
- Monthly prayer calendar view
- Hijri date display
- Multiple saved locations
- Offline mode: prayer times cached on-device
- Account sync via Hasura Auth (shared SSO)
- Guest mode (no account required)

### Web

- praycalc.com: GPS prayer times in browser
- City search with autocomplete
- Shareable location links
- PWA installable

### Developer

- Vendored pray-calc calculation library
- Remote Schema federated into Hasura (praycalc.com/api/graphql)
