# Store Listing Metadata

App Store (Apple) and Play Store (Google) listing copy for PrayCalc.

## Structure

```
store_listing/
└── en-US/
    ├── title.txt            30 chars max (both stores)
    ├── short_description.txt 80 chars max (Play Store only)
    ├── description.txt      4000 chars max (both stores)
    └── whatsnew.txt         500 chars max (Play Store) / 4000 (App Store)
```

## Upload

### Google Play (Fastlane supply)
```bash
cd flutter
bundle exec fastlane supply --track internal --metadata_path store_listing
```

### App Store Connect (Fastlane deliver)
```bash
cd flutter
bundle exec fastlane deliver --metadata_path store_listing --skip_binary_upload
```

Or paste manually into App Store Connect / Google Play Console.

## v1.1 Features Covered in This Copy
- iOS Live Activity (lock screen + Dynamic Island countdown)
- Apple Watch companion (watchOS 9+)
- WearOS companion (WearOS 3+)
- TV App (Android TV + tvOS)
- Desktop Tray (Windows + macOS)
- Home Screen Widgets
- Alexa Skill
- Google Actions
- Smart Home Integration (Ummat+ required)
