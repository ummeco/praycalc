# Getting Started

## Prerequisites

- Node.js 22+
- pnpm (`npm install -g pnpm`)
- Flutter SDK (for mobile development)

## Web App

```bash
git clone https://github.com/ummeco/praycalc.git
cd praycalc/web
pnpm install
pnpm dev
```

The dev server runs at `http://localhost:3002`.

### Environment Variables

Copy `.env.local.example` to `.env.local` for local development. Most features work without any env vars set.

### Running Tests

```bash
pnpm test          # unit tests (Vitest)
pnpm test:e2e      # E2E tests (Playwright)
```

## Documentation Site

```bash
cd praycalc/org
pnpm install
pnpm dev
```

Runs at `http://localhost:3003`.

## Flutter App

```bash
cd praycalc/flutter
flutter pub get
flutter run
```

### Running Flutter Tests

```bash
flutter test                    # widget tests
cd packages/pray_calc_dart
dart test                       # unit tests for calculation engine
```
