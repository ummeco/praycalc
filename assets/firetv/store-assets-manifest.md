# Fire TV Store Assets — PrayCalc

## Required Assets for Amazon Appstore

### App Icons
- [ ] Small icon: 114×114 PNG (app icon)
- [ ] Large icon: 512×512 PNG (store listing)

### Screenshots (Fire TV)
- [ ] Minimum 3 screenshots at 1920×1080 (landscape, required for TV)
- Screenshot 1: Home screen showing prayer times in TV layout
- Screenshot 2: Adhan overlay animation
- Screenshot 3: Settings / configuration screen

### Screenshots (Fire Tablet, optional)
- [ ] 1280×800 or 1024×600 (7" tablet)

### Promotional Banner
- [ ] 2500×2500 PNG — used as listing banner on Fire TV home screen carousel
- [ ] 1024×500 PNG — Promotional graphic for Amazon search results

### App Preview Video (optional)
- [ ] 30-second MP4 at 1080p (highly recommended for TV apps)
- Content: Shows prayer times display, adhan overlay, settings, D-pad navigation

## Amazon Appstore Listing Details

### App Title
PrayCalc — Islamic Prayer Times

### Short Description (max 1200 chars)
GPS-accurate Islamic prayer times for your Fire TV. Beautiful adhan overlay, Quran display, multi-city support, and masjid TV mode. Free, ad-free, forever.

### Long Description
PrayCalc brings beautiful, accurate Islamic prayer times to your Amazon Fire TV.

Features:
- GPS-accurate prayer times using industry-standard calculation methods (ISNA, MWL, Umm Al-Qura, and more)
- Beautiful adhan overlay with mosque silhouette animation
- Quran verse display with 9 reciter voices
- Multi-city prayer board for masjid use
- Children's mode with colorful prayer display
- World map ambient screensaver
- Islamic geometric pattern screensavers
- Ramadan display with suhoor/iftar countdown
- Configurable from your phone — no keyboard needed

### Keywords
prayer times, salah, namaz, quran, adhan, athan, masjid, mosque, islamic, muslim, ramadan, fajr, dhuhr, asr, maghrib, isha

### Category
Lifestyle > Religion & Spirituality

### Content Rating
Everyone (no age restriction)

### Pricing
Free

### Countries
All countries (worldwide)

## Build Command

```bash
cd flutter
./amazon-build.sh
# Output: build/app/outputs/flutter-apk/app-amazon-release.apk
```

## ADB Test Commands

```bash
adb connect <fire-tv-ip>:5555
adb install flutter/build/app/outputs/flutter-apk/app-amazon-release.apk
adb shell monkey -p com.praycalc.app.amazon -c android.intent.category.LEANBACK_LAUNCHER 1
# Capture screenshot:
adb shell screencap -p /sdcard/ss.png && adb pull /sdcard/ss.png
```

## Technical Details

| Field | Value |
| --- | --- |
| Package name | `com.praycalc.app.amazon` |
| Min API | 21 (Android 5.0) |
| Target API | 34 |
| Permissions | `ACCESS_FINE_LOCATION`, `RECEIVE_BOOT_COMPLETED`, `VIBRATE`, `INTERNET` |
| Devices | Fire TV Stick (all gens), Fire TV Cube, Fire TV Edition |
| Google Play Services | Excluded (amazon flavor) |
| In-app purchases | None |

## Pre-Submission Checklist

- [ ] APK built with `./amazon-build.sh`
- [ ] Tested on real Fire TV or emulator (see `fire-tv-submission.md`)
- [ ] 3+ screenshots at 1920×1080
- [ ] Icons at 114×114 and 512×512
- [ ] Promotional banner at 2500×2500
- [ ] Amazon Developer account active (developer.amazon.com — $99/year)
- [ ] Listing copy pasted from this file into Amazon Appstore Console
- [ ] APK uploaded
