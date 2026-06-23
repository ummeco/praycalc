# ADR: pray-calc Package Location — @acamarata Scope

**Date:** 2026-06-19  
**Status:** Accepted  
**Decision:** D-P2-PRAYCALC-PKG-LOCATION  
**Ticket:** P2-E4-W01-S01-T04  

---

## Context

The `praycalc/packages/pray-calc/` package implements the core prayer time calculation engine (NREL SPA + MCW seasonal method + dynamic twilight angles). It needs a published package location so that `praycalc/mobile/` (React Native + Expo) and `praycalc/tv/` (react-native-tvos) can consume it via the pnpm workspace protocol.

Two candidate scopes were considered:

| Scope | Path | Registry |
|---|---|---|
| `@ummat/pray-calc` | `ummat/packages/pray-calc` | ummeco private monorepo |
| `@acamarata/pray-calc` | `praycalc/packages/pray-calc` | acamarata open-source packages |

---

## Decision

**`@acamarata/pray-calc` at `praycalc/packages/pray-calc/`.**

---

## Rationale

1. **Zero Ummeco coupling.** The algorithm is pure mathematics — no Hasura, no auth, no Ummat types. It has zero runtime dependencies and no business logic specific to Ummat. Placing it under `@acamarata` keeps it maximally reusable.

2. **Open-source mandate.** Per ASI Policy 3 (Reusability hierarchy): "general-purpose → `@acamarata` package (open-source; prefer FOSS, build when none fits)". A prayer time calculator is a general Islamic utility, not Ummat-proprietary.

3. **Co-location with the praycalc repo.** The package lives alongside the apps that consume it (`praycalc/mobile/`, `praycalc/tv/`, `praycalc/web/`). Separation into `ummat/packages/` would add cross-repo pnpm complexity without benefit.

4. **Future reuse.** `chatislam`, `islamwiki`, and any future Islamic app can consume `@acamarata/pray-calc` without depending on the entire `@ummat/*` stack.

5. **`@ummat/pray-calc` is reserved** for a potential future thin Ummat-specific wrapper (Hasura integration, Ummat user preferences, etc.) if ever needed. That wrapper would depend on `@acamarata/pray-calc` as a peer.

---

## Implementation

- **Path:** `praycalc/packages/pray-calc/`
- **Package name:** `@acamarata/pray-calc`
- **pnpm workspace entry:** `packages/pray-calc` in `praycalc/pnpm-workspace.yaml`
- **Consumers reference:** `"@acamarata/pray-calc": "workspace:*"` in their `package.json`
- **Build outputs:** `dist/esm/` (ESM), `dist/cjs/` (CJS), `dist/types/` (TypeScript declarations)
- **Zero runtime dependencies:** enforced by `package.json` (devDependencies only)

---

## Consequences

- `praycalc/mobile/` and `praycalc/tv/` use `workspace:*` to resolve the package locally during development; on publish they will resolve the npm registry version.
- Any Ummeco app outside the praycalc workspace that needs prayer times must add `@acamarata/pray-calc` as a dependency once it is published to npm (P10+).
- If a Ummat-specific wrapper is ever built, it lives in `ummat/packages/pray-calc-ummat/` under `@ummat/pray-calc`, depending on this package as a peer.

---

## References

- ADR-0022: praycalc Flutter exception (superseded by D-P2-PRAYCALC-RN)
- D-P2-PRAYCALC-RN: praycalc React Native migration decision
- D-P2-STACK-CANON: unified TypeScript stack decision
- ASI Policy 3: Modular Coding / Reusability hierarchy
- `praycalc/packages/pray-calc/package.json`
