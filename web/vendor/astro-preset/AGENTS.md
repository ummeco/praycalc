# AGENTS.md — @ummat/astro-preset

## Purpose

Astro integration factory for Ummat sites. Provides `astroUmmat()` that:
- Injects `@ummat/brand` design tokens CSS into every Astro page `<head>`
- Sets RTL `dir` attribute on `<html>` for RTL locales (ar, ur, fa, he, ckb)
- Notes urql SSR exchange requirement (actual config is in the app's `createUrqlClient()`)

Used by every Astro site in Ummeco (islamwiki, chatislam, praycalc/org, flock/site, ummat/dev/web) per E3 migration.

## Constraints

- **Peer deps**: `astro >= 4.0.0`, `@astrojs/react >= 3.0.0` (optional). Never import at runtime.
- **No DOM APIs**: this package runs in Astro's SSR config hook — no `window`, `document`, `localStorage`.
- **D-P2-STACK-CANON**: target stack is Astro for all content/SEO surfaces. This preset is the shared base.
- All RTL locale codes: `['ar', 'ur', 'fa', 'he', 'ckb']` — mirrors `@ummat/i18n ALL_RTL_LOCALES`.

## Brand tokens

`src/brand-tokens.ts` embeds the core `--brand-*` CSS custom properties as a string literal.
**Keep in sync with `packages/brand/src/tokens.css`** — any new token added there must also be added here.

## RTL direction

`setRtlDirection: true` (default) injects a small inline script that reads `document.documentElement.lang`
and sets `dir="rtl"` for RTL primary-subtag locales. Works with Astro's i18n routing.

## urql SSR

`urqlSsr: true` (default) is currently informational — it logs a reminder that `createUrqlClient()`
must be configured with `ssrExchange`. Future: wire up full SSR serialisation via Astro middleware.

## Files

- `src/integration.ts` — `astroUmmat()` factory
- `src/brand-tokens.ts` — embedded CSS token string
- `src/types.ts` — `UmmatAstroOptions` interface
- `src/index.ts` — root re-export
- `src/__tests__/integration.test.ts` — vitest suite
