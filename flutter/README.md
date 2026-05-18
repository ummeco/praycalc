# PrayCalc Flutter

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
