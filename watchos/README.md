# PrayCalc watchOS App

Standalone Apple Watch app for PrayCalc. Shows prayer times, countdown to next prayer, Qibla direction, and a watch-face complication with the next prayer — all computed **offline** on-device.

## Status

Source scaffold (Swift/SwiftUI + WidgetKit) with a committed XcodeGen spec. The
`.xcodeproj` is generated, not checked in — run `xcodegen generate` to create it.

## Building

```bash
brew install xcodegen           # one-time
cd watchos
xcodegen generate               # creates PrayCalc.xcodeproj from project.yml
open PrayCalc.xcodeproj          # or build from the CLI:

xcodebuild build \
  -project PrayCalc.xcodeproj \
  -scheme PrayCalcWatch \
  -destination 'generic/platform=watchOS Simulator'
```

`project.yml` is the single source of truth for the Xcode project. Edit it (not
the generated `.xcodeproj`) and re-run `xcodegen generate`. The generated project
and Xcode's `DerivedData` are gitignored (see `watchos/.gitignore`).

## Requirements

- Xcode 16+ (validated on Xcode 26.3)
- watchOS 10.0+ deployment target
- Swift 5.9+
- Apple Watch Series 4 or later
- XcodeGen (`brew install xcodegen`)

## Targets

| Target | Type | Contents |
| --- | --- | --- |
| `PrayCalcWatch` | watchOS app | SwiftUI UI, `PrayerService`, `PrayCalcEngine` (C-core bridge) |
| `PrayCalcComplication` | WidgetKit extension | Watch-face complications; computes prayer times **locally** via the C core |
| `PrayCalcWatchTests` | unit tests | `Tests/PrayerDataTests.swift` |

Both app and widget compile the shared C core (`../core/c`) and
`Bridge/PrayCalcEngine.swift`, so the complication needs no network.

## Features

- Prayer list with all 5 daily prayers, next prayer highlighted
- Countdown timer with circular progress ring
- Qibla compass with bearing indicator and haptic alignment feedback
- Configurable calculation method (ISNA, MWL, Egypt, Umm al-Qura, Tehran, Karachi) and madhab (Shafii, Hanafi)
- WidgetKit complications (circular, rectangular, corner, inline)
- Offline-first: prayer times computed on-device by the shared C core
- GPS location with fallback to last-known position

## Offline-first architecture

The killer feature is a next-prayer complication that updates on the wrist
without connectivity. To make that work:

- `Bridge/PrayCalcEngine.swift` wraps the C core (`../core/c/pray_calc.c`,
  `qibla.c`, `nrel_spa.c`) via the bridging header. Both targets link it.
- `Complications/ComplicationController.swift` computes the whole timeline from
  `PrayCalcEngine` — **no network call in the complication path**.
- Location + method/madhab are shared app→widget through an App Group
  (`group.com.praycalc.watch`) via `Bridge/SharedLocationStore.swift`. The app
  writes its GPS fix there and calls `WidgetCenter.reloadAllTimelines()`.
- The app's `PrayerService` keeps a network API call **only as a fallback** for
  when the C core cannot compute (e.g. polar edge cases). Phone→watch sync will
  populate the same App Group once the paired iOS app ships.

## Architecture

```
PrayCalcWatch/
  PrayCalcWatchApp.swift        App entry point (@main App)
  ContentView.swift             TabView with 4 tabs
  Models/PrayerData.swift       Data models + response types (shared)
  Services/PrayerService.swift  Location, C-core calc, cache
  Views/                        PrayerList / Countdown / Qibla / Settings
  Bridge/
    PrayCalcEngine.swift        Swift wrapper over the C core (shared)
    SharedLocationStore.swift   App Group location/prefs (shared)
    PrayCalcWatch-Bridging-Header.h
  Complications/                WidgetKit complication (@main WidgetBundle)
  Assets.xcassets/              Colors + app icon slots
  Info.plist
PrayCalcComplication/
  Info.plist                    Widget extension NSExtension config
  PrayCalcComplication.entitlements  App Group
project.yml                     XcodeGen spec (source of truth)
```

## Brand Colors

| Name    | Hex       | Use                    |
| ------- | --------- | ---------------------- |
| Primary | `#79C24C` | Highlights, active     |
| Accent  | `#C9F27A` | Headings, labels       |
| Deep    | `#0D2F17` | Backgrounds, rings     |
