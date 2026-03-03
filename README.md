# PrayCalc

GPS-accurate Islamic prayer time calculator for the web and mobile.

**Live:** [praycalc.com](https://praycalc.com) | **Docs:** [praycalc.org](https://praycalc.org)

## Features

- All major calculation methods (ISNA, MWL, Egypt, Umm al-Qura, Tehran, Karachi)
- GPS-based location with city search
- Qibla compass direction
- Adhan audio notifications with multiple reciters
- Monthly/yearly prayer calendars with PDF export
- PWA with full offline support
- 8 languages (EN, AR, TR, UR, ID, FR, BN, SO) with RTL
- Countdown to next prayer
- Dark mode
- Accessible (WCAG 2.1 AA)

## Tech Stack

| Layer | Tech |
| --- | --- |
| Web | Next.js 15, TypeScript, Tailwind CSS |
| Mobile | Flutter (iOS + Android) |
| Docs site | Next.js + MDX |
| i18n | next-intl (8 locales) |
| PWA | Serwist (service worker, offline caching) |
| Testing | Vitest (unit), Playwright (E2E) |

## Project Structure

```
praycalc/
├── web/        praycalc.com — Next.js web app
├── org/        praycalc.org — documentation site
└── flutter/    iOS + Android mobile app
```

## Getting Started

### Web App

```bash
cd web
pnpm install
pnpm dev        # http://localhost:3002
```

### Docs Site

```bash
cd org
pnpm install
pnpm dev        # http://localhost:3003
```

### Flutter App

```bash
cd flutter
flutter pub get
flutter run
```

## Contributing

See the [wiki](https://github.com/ummeco/praycalc/wiki) for architecture docs, contribution guidelines, and feature status.

## License

[MIT](LICENSE)
