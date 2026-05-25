# PrayCalc — React Native Migration Status

Migrated from Flutter (`flutter/`) → Expo SDK 51 + Expo Router (`react-native/`).
Task: T-E1-08 (mega-p1/E1).

## Core — Implemented

| Unit | Path | Status |
|---|---|---|
| Types | `src/types/index.ts` | Done |
| prayCalc lib | `src/lib/prayCalc.ts` | Done |
| location lib | `src/lib/location.ts` | Done |
| notifications lib | `src/lib/notifications.ts` | Done |
| useLocation hook | `src/hooks/useLocation.ts` | Done |
| usePrayerTimes hook | `src/hooks/usePrayerTimes.ts` | Done |
| useQibla hook | `src/hooks/useQibla.ts` | Done |
| useNotifications hook | `src/hooks/useNotifications.ts` | Done |
| PrayerCard | `src/components/PrayerCard.tsx` | Done |
| CountdownTimer | `src/components/CountdownTimer.tsx` | Done |
| QiblaCompass | `src/components/QiblaCompass.tsx` | Done |
| MethodPicker | `src/components/MethodPicker.tsx` | Done |
| Root layout | `src/app/_layout.tsx` | Done |
| Prayer Times screen | `src/app/index.tsx` | Done |
| Qibla screen | `src/app/qibla.tsx` | Done |
| Notifications screen | `src/app/notifications.tsx` | Done |
| Settings screen | `src/app/settings.tsx` | Done |

## Tests

| File | Coverage |
|---|---|
| `__tests__/prayCalc.test.ts` | computePrayerTimes, epoch conversion, nextPrayer logic, Qiyam calc |
| `__tests__/usePrayerTimes.test.ts` | Default settings, AsyncStorage persistence, updateSettings merge, loading state |

## Flutter Features Not Yet Ported (stub candidates)

These existed in the Flutter app but are outside the T-E1-08 priority scope:

| Feature | Flutter location | Notes |
|---|---|---|
| OTA updates (Shorebird) | `main.dart` | Mobile-only; use Expo Updates OTA when needed |
| Sentry crash reporting | `main.dart` | Add `sentry-expo` in a follow-up task |
| TV / desktop detection | `main.dart` | Expo SDK 51 handles platform detection natively |
| Dark / light theme toggle | `settings_screen.dart` | `darkMode` setting is persisted; theme switching not wired to system theme yet |
| Full locale / i18n | `settings_screen.dart` | Locale selector present; `i18n-js` or `i18next` integration not yet added |
| Prayer time calculation for high latitudes | `prayer_provider.dart` | `dynamic` method in pray-calc handles this; no extra code needed |
| Offline map for Qibla | `qibla_screen.dart` | Static bearing shown when magnetometer unavailable |

## Package Decision Log

- `pray-calc` v2.1.0 (acamarata npm package, NOT pray-calc-js — actual name confirmed from `package.json`)
- `expo-sensors` Magnetometer for compass heading (replaces `flutter_compass`)
- `expo-location` for GPS (replaces `geolocator`)
- `expo-notifications` for prayer alerts (replaces `flutter_local_notifications`)
- `react-native-reanimated` for compass arrow animation (replaces Flutter `AnimationController`)
- `react-native-svg` for compass rose SVG (replaces Flutter `CustomPaint`)
