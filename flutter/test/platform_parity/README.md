# Platform Parity Smoke (ADR-P8-09)

Verifies the six platform surfaces protected by the Directive 3 exception remain
buildable: iOS, Android, macOS, watchOS (Swift companion), Wear OS (native
Kotlin), tvOS / Fire TV (Amazon flavor), Linux / Smart Display.

Run locally:

```bash
cd praycalc/flutter
flutter test test/platform_parity/
```

"Probe tests" use `dart:io` file-existence checks (no simulator, no device).
Widget tests use `flutter_test` only. No new pub packages.
