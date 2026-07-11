# Installation

PrayCalc is available as a web app, iOS app, Android app, macOS app, Windows app, Linux app, Android TV app, and Fire TV app.

## Web App (No install required)

Visit [praycalc.com](https://praycalc.com) in any browser. The site works as a Progressive Web App (PWA) — you can install it to your home screen for offline access.

**Install as PWA:**
- **Chrome / Edge:** click the install icon in the address bar
- **Safari (iOS):** tap Share, then "Add to Home Screen"
- **Firefox Android:** tap the menu, then "Install"

## Mobile Apps

| Platform | Store | Minimum OS |
| --- | --- | --- |
| iOS | [App Store](https://apps.apple.com) | iOS 16+ |
| Android | [Google Play](https://play.google.com) | Android 8+ |

**Android direct install (sideload):** every `mobile-v*` release also publishes a signed APK to [GitHub Releases](../releases?q=mobile-v) — no Play Store account needed. Download the `.apk`, enable "install unknown apps" for your browser or file manager, and open it. This ships from GitHub the moment a version tag is pushed; the Play Store listing for the same version follows separately once someone runs the store-submission workflow.

## Desktop Apps

Current version: **v1.2.4**. Since v1.2.3 the app auto-updates: it checks for a new version on launch and hourly, downloads it in the background, and shows a "Restart to update" banner when it's ready — no manual re-download after the first install.

| Platform | Download | Notes |
| --- | --- | --- |
| macOS | [Releases](../releases?q=desktop-v) | Menu bar integration, auto-start, seamless auto-update |
| Windows | [Releases](../releases?q=desktop-v) | System tray, auto-start on login, seamless auto-update |
| Linux | [Releases](../releases?q=desktop-v) | System tray, auto-start on login, seamless auto-update; right-click the tray icon for the menu |

## TV Apps

| Platform | Store | Notes |
| --- | --- | --- |
| Android TV | Google Play (TV section) | Pair by code or QR from any surface |
| Fire TV | Amazon Appstore | Same pairing flow as Android TV |

An unpaired TV shows a 6-digit code (and a QR code) on launch. Add it to your Ummat+ account from any surface — web (account page, "Add TV"), desktop (menu-bar app, "My TVs" tab), or mobile (Pair TV screen) — by entering the code, or by scanning the QR from the mobile app. Once paired, settings changes from any surface reach the TV in about 5 seconds; a single account can pair and manage any number of TVs.

## Wearables

| Platform | Notes |
| --- | --- |
| WatchOS | Installed automatically with the iOS app |
| Wear OS | Installed automatically with the Android app |

Prayer times work offline on both watches using the C core engine — no phone connection required during the day once synced.

## Developer Setup

See [[Getting Started]] for local development instructions.
