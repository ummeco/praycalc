# Contributing to PrayCalc

Thanks for considering a contribution.

## Dev environment

- Node 20+, pnpm 9+
- Clone the repo
- `cd web && pnpm install` (sub-project root)
- See `README.md` for app-specific setup

## Running tests

- `pnpm test` — unit tests
- `pnpm test:e2e` — end-to-end tests
- `pnpm lint` and `pnpm typecheck` before opening a PR

## Submitting changes

1. Fork the repo and create a feature branch (`feature/{description}`)
2. Run lint + tests locally before opening a PR
3. Open a PR; fill out the template at `.github/PULL_REQUEST_TEMPLATE.md`
4. Maintainer review: best-effort, expect days to weeks (solo-maintained currently)

## Code style

Match existing style. TypeScript strict, ESLint passing, Prettier formatted. No AI attribution in commits.

## Scope

Prayer time calculation accuracy is critical. New calculation methods must include scholar attribution and a test fixture comparing against known reference times. UI changes must preserve accessibility (VoiceOver, TalkBack).

## License

By contributing you agree your work is licensed under the project's LICENSE.
