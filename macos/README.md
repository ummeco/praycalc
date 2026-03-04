# PrayCalc for macOS

A lightweight macOS menubar app that shows prayer times at a glance. Lives in your menu bar with the next prayer name and time always visible.

## Features

- Next prayer name and time in menu bar
- Full prayer list with highlighted next prayer
- Countdown timer to next prayer
- Qibla direction bearing
- Gregorian and Hijri date display
- Notification alerts for each prayer (configurable)
- Auto-detect or manual location
- Multiple calculation methods (ISNA, MWL, Egypt, Umm al-Qura, Tehran, Karachi)
- Shafi'i and Hanafi madhab support
- Launch at login (via SMAppService)
- No dock icon (LSUIElement)

## Requirements

- macOS 13.0 or later
- Xcode 15+
- Apple Developer account (for signing)

## Build

1. Open `PrayCalcMenu/` in Xcode:
   ```
   open PrayCalcMenu/
   ```
   Or create a new Xcode project and add the source files.

2. Set your development team under Signing and Capabilities.

3. Build and run (Cmd+R).

The app appears in the menu bar with a moon icon and the next prayer time.

## Xcode Project Setup (Manual)

If starting from source files without an `.xcodeproj`:

1. Open Xcode. File > New > Project > macOS > App.
2. Product Name: `PrayCalcMenu`. Bundle ID: `com.praycalc.menu`.
3. Interface: SwiftUI. Language: Swift.
4. Replace the generated files with the source files from this directory.
5. Add `Info.plist` to the project (set in Build Settings > Info.plist File).
6. Under Signing and Capabilities, add "Location" capability.
7. Build and run.

## DMG Packaging

To distribute as a DMG:

```bash
# Install create-dmg via Homebrew
brew install create-dmg

# Archive the app
xcodebuild -scheme PrayCalcMenu -configuration Release archive -archivePath build/PrayCalcMenu.xcarchive

# Export the app
xcodebuild -exportArchive -archivePath build/PrayCalcMenu.xcarchive -exportPath build/ -exportOptionsPlist ExportOptions.plist

# Create DMG
create-dmg \
  --volname "PrayCalc" \
  --volicon "PrayCalcMenu/Assets.xcassets/AppIcon.appiconset/icon_512x512.png" \
  --window-pos 200 120 \
  --window-size 600 400 \
  --icon-size 100 \
  --icon "PrayCalc.app" 175 190 \
  --app-drop-link 425 190 \
  "build/PrayCalc.dmg" \
  "build/PrayCalc.app"
```

## Homebrew Cask (Future)

```ruby
cask "praycalc" do
  version "1.0.0"
  sha256 "TBD"
  url "https://github.com/ummeco/praycalc/releases/download/v#{version}/PrayCalc.dmg"
  name "PrayCalc"
  desc "Prayer times in your macOS menu bar"
  homepage "https://praycalc.com"

  app "PrayCalc.app"

  zap trash: [
    "~/Library/Preferences/com.praycalc.menu.plist",
  ]
end
```

## API

Prayer times are fetched from the PrayCalc API:
```
GET https://api.praycalc.com/api/v1/times?lat=X&lng=Y&date=YYYY-MM-DD&method=isna&madhab=shafii
```

The app caches prayer times for the current day and refreshes automatically at midnight.
