# PrayCalcWatch

watchOS companion app for PrayCalc. Shows next prayer, countdown, and a full
five-prayer schedule as a complication and a full-screen SwiftUI view.

## Data flow

```
Flutter (Dart)
  └── WatchBridgeService.syncPrayerTimes()
        └── MethodChannel "com.praycalc.app/watch" → syncPrayerTimes
              └── AppDelegate.swift
                    ├── WCSession.sendMessage (reachable)
                    └── WCSession.transferCurrentComplicationUserInfo (always)
                          └── ExtensionDelegate.storePrayerPayload()
                                └── UserDefaults(suiteName: "group.com.praycalc.app")
                                      ├── watch_prayer_data   — raw JSON blob
                                      ├── watch_prayer_timestamp
                                      ├── widget_fajr         — "HH:mm"
                                      ├── widget_dhuhr
                                      ├── widget_asr
                                      ├── widget_maghrib
                                      └── widget_isha
```

Payload keys sent from iOS to watchOS:

| Key         | Type   | Description                          |
| ----------- | ------ | ------------------------------------ |
| `data`      | String | JSON blob from WatchBridgeService    |
| `timestamp` | String | ISO-8601 sync time                   |

The JSON blob inside `data` has the structure:

```json
{
  "prayers": {
    "fajr": "05:23",
    "dhuhr": "12:30",
    "asr": "15:45",
    "maghrib": "18:12",
    "isha": "19:45"
  }
}
```

## Xcode setup

The source files exist but are not yet wired into the Xcode project.

1. Open `flutter/ios/Runner.xcworkspace` in Xcode.
2. **File → New → Target → watchOS → Watch App for iOS App**
   - Product Name: `PrayCalcWatch`
   - Bundle Identifier: `com.praycalc.app.watchkitapp`
   - Language: Swift, User Interface: SwiftUI
3. Delete the generated placeholder `ContentView.swift` and `PrayCalcWatchApp.swift`.
4. In the **PrayCalcWatchExtension** target, add the existing files:
   - `ComplicationController.swift`
   - `ExtensionDelegate.swift`
   - `WatchView.swift`
   - Set `PrayCalcWatch-Info.plist` as the Info.plist for the extension target.
5. In **Signing & Capabilities** for both **Runner** and **PrayCalcWatchExtension**:
   - Add **App Groups** → `group.com.praycalc.app`
6. In the WatchKit App target's `Info.plist`, set:
   - `WKCompanionAppBundleIdentifier` = `com.praycalc.app`
7. Build (⌘B) — Xcode resolves missing framework references automatically.

## Files

| File                        | Target               | Purpose                              |
| --------------------------- | -------------------- | ------------------------------------ |
| `ExtensionDelegate.swift`   | WatchExtension       | WCSession + AppGroup UserDefaults    |
| `ComplicationController.swift` | WatchExtension    | ClockKit complication data source    |
| `WatchView.swift`           | WatchExtension       | SwiftUI root view + data model       |
| `PrayCalcWatch-Info.plist`  | WatchExtension       | Bundle metadata                      |
