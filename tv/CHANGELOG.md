# Changelog — PrayCalc TV

## [1.0.0] - 2026-07-11

### Added
- First public release (Android TV / Fire TV sideload APK via GitHub; tvOS via EAS store lane).
- Account-linked control plane: pair by 6-digit code, then manage everything from Web/Desktop/Mobile.
- Five selectable layouts (Classic — Mecca live 2/3 + prayer rail, Flipped, Stream Full, Times Only, Ambient) and four theme palettes, switchable per-TV from the account managers.
- Full-screen adhan countdown takeover, per-prayer iqama times, prayer-name-only mode.
- Update-available toast pointing at GitHub releases; store builds update via their stores.

## [0.2.0] — 2026-07-08

### Account-linked settings sync + display modes

- Launch flow now gates on `pc_tv_pairing`: an unpaired TV shows its 6-digit code and waits, a paired TV goes straight to the dashboard
- `tvSettingsSync`: polls `pc_tv_settings` by the TV's own `device_id` every ~5s via the public Hasura role, applies changes made from web/desktop/mobile without a restart
- `PrayerTakeover`: full-screen countdown in the final N minutes before adhan
- Per-prayer iqama offsets (minutes after adhan, no sunrise iqama) rendered on `PrayerRail`
- Prayer-name-only full-screen mode for N minutes after adhan/iqama, hides the Mecca stream during that window
- Mawlid intentionally excluded from all TV content

## [0.1.0] — 2026-06-21

### Initial scaffold: 15 TV screens + D-pad focus + pairing flow (P2-E4-W03-S03-T05)

**Stack**
- react-native-tvos 0.74.2-0 (RN fork for tvOS)
- react-navigation v6 (Stack navigator; NOT Expo Router — tvOS requires react-navigation focus engine)
- urql v4 (Bearer JWT transport to api.ummat.dev/v1/graphql)
- Zustand v5 (settingsStore, prayerStore)
- react-native-qrcode-svg v6 (Pairing screen QR code)
- @acamarata/pray-calc (workspace dependency for prayer time calculation)
- TypeScript strict

**Screens (all 15)**
1. HomeScreen — City, clock, all 6 prayer times, next-prayer highlight, countdown
2. QiblaScreen — Compass bearing, city name, large TV display
3. CalendarScreen — Hijri/Gregorian month grid, D-pad L/R month navigation
4. HadithOfDayScreen — Arabic RTL text (tashkeel preserved), narrator chain citation
5. DuaDisplayScreen — Scrolling full-screen dua, Arabic + transliteration + translation
6. AdhanSettingsScreen — Calculation method selector, per-prayer volume control, madhab toggle
7. NotificationScheduleScreen — Visual 24h timeline, prayer time blocks
8. CitySearchScreen — D-pad navigable city picker, FlatList with hasTVPreferredFocus
9. PairingScreen — QR code (react-native-qrcode-svg) + 6-digit PIN, polls pc_tv_pairing every 5s
10. SettingsScreen — Method, madhab, location, display options, all rows focusable
11. AboutScreen — App version, credits, mission, legal
12. RamadanScreen — Live iftar/suhoor countdown, fasting status, full-screen mode
13. MoonPhaseScreen — Visual moon animation (View-based), phase name, illumination, hijri day
14. IslamicEventsScreen — Upcoming Islamic dates, D-pad navigable grid
15. ScreensaverScreen — Clock display, dims after 5min inactivity (setInterval), remote press exits

**D-pad focus**
- All interactive elements: `accessible={true}` + `accessibilityRole="button"`
- First element on each screen: `hasTVPreferredFocus={true}`
- `TVFocusGuideView` wraps grids/lists with `destinations` pointing to first ref
- `useTVEventHandler` on Home for directional navigation between screens
- Modal screens (Pairing success): `hasTVPreferredFocus` on single CTA

**Pairing flow**
- `PairingService`: generates 6-digit PIN + device ID
- QR encodes `praycalc://pair?pin={pin}`
- Polls `pc_tv_pairing` table (NOT `fl_tv_device_pairing`) every 5s via urql
- Auto-navigates to Home on success

**Infrastructure**
- `praycalc/pnpm-workspace.yaml` updated to include `tv`
- `@acamarata/pray-calc` wired as workspace:* dependency
- `tsconfig.json` extends @tsconfig/react-native, strict mode
