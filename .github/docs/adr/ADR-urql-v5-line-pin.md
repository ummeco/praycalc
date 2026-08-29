# ADR: Pin the urql v5 line across the praycalc workspace

- **Status:** Accepted
- **Date:** 2026-08-29
- **Scope:** `praycalc/mobile`, `praycalc/tv`, workspace root

## Context

urql ships its React bindings, its core, and its exchanges as separate packages
that must move together. There are two coherent pairings:

| Line | `urql` | `@urql/exchange-auth` | `@urql/core` |
|---|---|---|---|
| v5 | 4.x | 2.2.1 | 5.x |
| v6 | 5.x | 3.0.0 | 6.x |

`praycalc/mobile` was declaring `urql@^4.1.0` (v5 line) alongside
`@urql/exchange-auth@^3.0.0` (v6 line). `exchange-auth@3` declares
`@urql/core: ^6.0.0` as **both** a dependency and a peer, so the two direct
deps demanded different majors of the same package.

pnpm papered over this by resolving `exchange-auth@3`'s peer down to the
`core@5.2.0` that `urql@4` had already pinned. That happened to work: v3 of
exchange-auth imports only `makeOperation`, `createRequest`, and
`makeErrorResult` from core, and all three exist with identical signatures in
5.2.0. So nothing crashed, and typecheck stayed clean — which is precisely why
this survived into a shipped release (mobile 2.3.3).

The hazard was never the current install. It was that
`praycalc/tv` independently pins `@urql/core: ^5.0.6`, so any resolution
refresh that let `exchange-auth` pull its declared `^6.0.0` would put **two
copies of `@urql/core` in one graph**. urql's exchanges rely on operation
identity and shared client internals; two cores means auth silently stops
applying to operations created by the other core. That failure is invisible to
both `tsc` and the test suite.

## Decision

1. `praycalc/mobile` pins `@urql/exchange-auth` to `^2.2.1` — the v5-line release.
2. The workspace root adds a pnpm override `"@urql/core": "^5.2.0"`.

`exchange-auth@3.0.0` was a **pure peer-range bump** published as part of
urql's v6 release train. Its distributed implementation
(`urql-exchange-auth.mjs`) and its public type surface (`.d.ts`) are
**byte-identical** to `2.2.1`. Verified by diffing both tarballs from the
registry. The downgrade therefore changes zero runtime behaviour, which is the
only reason it was acceptable to make against an already-shipped app without
device verification.

The override exists so that future drift **fails loudly at install** instead of
silently splitting the graph.

## Consequences

- Anyone intentionally moving to the v6 line must change all four coordinates
  together — `urql@^5`, `@urql/exchange-auth@^3`, the root `@urql/core`
  override, and `tv/package.json` — in one commit. The override makes a partial
  migration an install-time error rather than a runtime auth bug.
- The v6 line is not urgent: v5-line urql is still maintained and the app's
  usage (`useQuery`, `useMutation`, `Client`, `Provider`, `authExchange`) is
  identical across both.

## Verification

- `mobile`: typecheck clean · 328 tests / 34 suites pass · lint 0 errors
- `tv`: typecheck clean · 115 tests / 16 suites pass
- Resolution: exactly **one** `@urql/core` (5.2.0) across the whole workspace
- Runtime: the app's real exchange chain (`cacheExchange` → `authExchange` →
  `fetchExchange`) constructs successfully under the new resolution
