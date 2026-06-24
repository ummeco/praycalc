# AGENTS.md — @ummat/brand

## Purpose

Single source of truth for design tokens, logos, Tailwind preset, and seasonal themes
across every Ummat app and standalone repo.

## Invariants

- Tokens (`tokens.colors.green[*]`) are FROZEN — bumping them ripples to every app's
  computed styles and pre-rendered images. Coordinate with marketing before edits.
- The 4-stop green palette (`#C9F27A` / `#79C24C` / `#1E5E2F` / `#0D2F17`) is the brand
  baseline; never override locally.
- Per-app brand configs live under `apps/<app>` sub-paths and consume the same tokens.

## DO NOT

- Edit `dist/` directly — it's the tsup build output, regenerated on every build.
- Add a new app config without a paired ADR and the app's mapped Vercel project.
- Rename tokens — consumers reference them by literal path.

## Test commands

```bash
pnpm --filter @ummat/brand build
pnpm --filter @ummat/brand test
```
