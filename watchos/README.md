# PrayCalc watchOS App

Standalone Apple Watch app for PrayCalc. Shows prayer times, countdown to next prayer, and Qibla direction.

## Features

- Prayer list with all 5 daily prayers, next prayer highlighted
- Countdown timer with circular progress ring
- Qibla compass with bearing indicator and haptic alignment feedback
- Configurable calculation method (ISNA, MWL, Egypt, Umm al-Qura, Tehran, Karachi) and madhab (Shafii, Hanafi)
- WidgetKit complications for watch faces (circular, rectangular, corner, inline)
- Offline caching with daily refresh
- GPS location with fallback to last-known position

## Requirements

- Xcode 15.0+
- watchOS 10.0+
- Swift 5.9+
- Apple Watch Series 4 or later

## Xcode Project Setup

This directory contains the Swift source files and assets. To build and run:

1. Open Xcode and create a new watchOS App project:
   - File > New > Project > watchOS > App
   - Product Name: `PrayCalcWatch`
   - Bundle Identifier: `com.praycalc.watch`
   - Interface: SwiftUI
   - Language: Swift

2. Remove the auto-generated `ContentView.swift` and `PrayCalcWatchApp.swift` from the new project.

3. Add all files from this directory to the Xcode project:
   - Drag the `PrayCalcWatch/` folder into the Xcode project navigator
   - Make sure "Copy items if needed" is unchecked (files are already in place)
   - Select the PrayCalcWatch target

4. For WidgetKit complications:
   - File > New > Target > watchOS > Widget Extension
   - Product Name: `PrayCalcComplication`
   - Move the files from `Complications/` into this target
   - Remove the `@main` from `PrayCalcWatchApp.swift` if using the widget bundle entry point, or vice versa

5. Configure signing:
   - Select the PrayCalcWatch target > Signing & Capabilities
   - Set Team and Bundle Identifier
   - Add "Location When In Use" capability

6. Build and run on Apple Watch simulator or device.

## API

The app fetches prayer times from:

```
GET https://api.praycalc.com/api/v1/times
  ?lat={latitude}
  &lng={longitude}
  &date={YYYY-MM-DD}
  &method={isna|mwl|egypt|umm_al_qura|tehran|karachi}
  &madhab={shafii|hanafi}
```

## Architecture

```
PrayCalcWatch/
  PrayCalcWatchApp.swift     App entry point
  ContentView.swift          TabView with 4 tabs
  Models/
    PrayerData.swift         Data models + API response types
  Services/
    PrayerService.swift      API client, location, caching
  Views/
    PrayerListView.swift     Prayer list with highlighting
    CountdownView.swift      Countdown ring + timer
    QiblaView.swift          Qibla compass
    SettingsView.swift       Method + madhab pickers
  Complications/
    PrayerComplication.swift WidgetKit complication views
    ComplicationController.swift Timeline provider
  Assets.xcassets/           Colors + app icon slots
  Info.plist                 App configuration
```

## Brand Colors

| Name    | Hex       | Use                    |
| ------- | --------- | ---------------------- |
| Primary | `#79C24C` | Highlights, active     |
| Accent  | `#C9F27A` | Headings, labels       |
| Deep    | `#0D2F17` | Backgrounds, rings     |
