# PrayCalc Flutter — ARCHIVED REFERENCE

> **This tree is a frozen snapshot. Do not add features or fix bugs here, and do not
> read it to determine current behaviour.**
>
> Per the user directive of 2026-06-28 (superseding ADR-P8-09), Flutter is retired for
> PrayCalc. It is retained read-only for 1:1 parity during migration. Live surfaces:
>
> | Surface | Live path | Stack |
> |---|---|---|
> | Mobile (iOS/Android/tablet) | `praycalc/mobile/` | React Native + Expo 53 |
> | TV (Apple TV / Android TV) | `praycalc/tv/` | react-native-tvos |
> | Desktop (macOS/Windows/Linux) | `praycalc/desktop/` | Tauri 2 + Vite + React 19 |
> | watchOS | `praycalc/watchos/` | Swift + SwiftUI (unchanged) |
> | Wear OS | `praycalc/wearos/` | Kotlin + Jetpack Compose (unchanged) |
>
> **`packages/pray_calc_dart/` in this tree is also stale** — it is 0.2.0 while the
> published package is 1.2.x. See that package's README before citing it for anything.
>
> The build commands below describe the archived snapshot and are kept for parity
> reference only. Flutter CI runs in non-blocking mode (analyze always passes).

Multi-platform prayer time calculator. Supports iOS, Android, macOS, Windows, Linux,
watchOS, Wear OS, tvOS, and Smart Display.

## Getting Started

```bash
flutter pub get
flutter run
```

## Release

OTA patches (iOS + Android) are managed via Shorebird. See [SHOREBIRD.md](./SHOREBIRD.md)
for the full release workflow: initial binary submission, OTA patching, and CI integration.

## Platforms

| Platform | Build command |
|---|---|
| iOS | `shorebird release ios` (initial) · `shorebird patch ios` (OTA) |
| Android | `shorebird release android --flavor google` (initial) · `shorebird patch android --flavor google` |
| macOS | `flutter build macos` |
| Windows | `flutter build windows` |
| Linux | `flutter build linux` |
| watchOS | Xcode companion target |
| Wear OS | `flutter build apk --flavor wearos` |
| tvOS | Xcode companion target |
| Smart Display | `flutter build linux --flavor smart_display` |

## CI

See `.github/workflows/flutter-ci.yml` — full 9-platform matrix with Shorebird patch jobs.

## Resources

- [Flutter documentation](https://docs.flutter.dev/)
- [Shorebird OTA guide](./SHOREBIRD.md)
