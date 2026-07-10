# PrayCalc

GPS-accurate Islamic prayer time calculator. Web, iOS, Android, macOS, Windows, Linux, Android TV, Fire TV, WatchOS, and Wear OS.

**Live:** [praycalc.com](https://praycalc.com) | **Docs:** [praycalc.org](https://praycalc.org)

[![Web](https://img.shields.io/badge/web-praycalc.com-brightgreen)](https://praycalc.com)
[![iOS](https://img.shields.io/badge/iOS-App%20Store-blue)](https://apps.apple.com)
[![Android](https://img.shields.io/badge/Android-Google%20Play-green)](https://play.google.com)

## Quick links

- [[Installation]] -- install on any platform
- [[Features]] -- full feature list with status
- [[API-Reference]] -- public HTTP API for prayer times and Qibla
- [[IAP]] -- Ummat+ subscription and in-app purchase setup
- [[Smart-Home]] -- connect prayer times to HomeKit, Google Home, Alexa, and Home Assistant
- [[Account-Deletion]] -- delete your account and data
- [[Privacy]] -- what data we collect
- [[Changelog]] -- release history
- [[Getting-Started]] -- local development setup
- [[Architecture]] -- technical overview
- [[Contributing]] -- how to contribute

## About

PrayCalc gives accurate Islamic prayer times for any location worldwide. It supports 10 calculation methods, all major Asr schools, Qibla direction, adhan notifications with 9 reciters, prayer calendars, and offline support on every platform including wearables.

The project includes:
- **Web app** at `web/` -- Astro, deployed to [praycalc.com](https://praycalc.com)
- **Documentation site** at `org/` -- Astro + MDX, deployed to [praycalc.org](https://praycalc.org)
- **Desktop** at `desktop/` -- Tauri 2 + Vite + React 19, macOS/Windows/Linux menu bar app with seamless auto-update
- **Mobile** at `mobile/` -- React Native + Expo SDK 53, iOS + Android
- **TV** at `tv/` -- react-native-tvos, Apple TV + Android TV + Fire TV
- **WatchOS** at `watchos/` and **Wear OS** at `wearos/` -- native Swift/Kotlin scaffolds, no release automation yet
- `flutter/` is an **archived reference only** (superseded by `mobile/` + `tv/`) -- do not build from it

## Platforms

| Surface | Status |
| --- | --- |
| Web (praycalc.com) | Live |
| macOS / Windows / Linux (desktop) | Live |
| iOS | Live |
| Android | Live |
| Android TV / Fire TV / Apple TV | Live |
| WatchOS | Scaffold, no release yet |
| Wear OS | Scaffold, no release yet |

## Calculation methods

ISNA, MWL, Egypt, Umm al-Qura, Tehran, Karachi, Kuwait, Qatar, Singapore, Moonsighting Committee.

## Languages

22 languages: Arabic, Bengali, Chinese, Dutch, English, Farsi, French, German, Hausa, Hindi, Indonesian, Italian, Japanese, Korean, Malay, Portuguese, Russian, Somali, Spanish, Swahili, Turkish, Urdu.
