# Tailwind Plus License — Component Clearance Analysis for `org/`

> **DRAFT for attorney review — factual analysis only; no conclusions of law. Do not treat
> this document as legal advice or as a cleared position. Counsel review is required before
> the component clearance question is closed.**
>
> Tracked in: the open component-clearance question raised when `org/LICENSE` was removed
> on 2026-07-09 (commit context: `org/` is a public MIT repository on GitHub).

---

## Background

`praycalc/org/` is the public documentation site for PrayCalc, published at `praycalc.org`.
The repository is public on GitHub (`ummeco/praycalc`) and the codebase root carries no
explicit license file as of the date of this analysis (the license file was removed 2026-07-09;
the component clearance question was left open at that point).

The `org/` site was built using the **Protocol** template — a paid documentation-site template
sold as part of the **Tailwind Plus** subscription (formerly Tailwind UI). Source components
in `org/src/components/` were adapted from Protocol into Astro/React 19 for this repo. The
components do not import any Tailwind Plus package; the code was ported and adapted manually.

---

## Component Inventory — Protocol Derivation Level

This section characterizes each component in `org/src/components/` by its level of derivation
from the Protocol template, based on in-file comments and code inspection.

| File | Derivation level | Evidence |
|------|-----------------|----------|
| `HeroPattern.astro` | **High — 1:1 port** | File header: "Ported from the original Protocol HeroPattern.tsx + GridPattern.tsx (Next.js/framer-motion) to a pure static Astro/SVG component." REF: `Protocol re-skin (36996b7~1: HeroPattern.tsx, GridPattern.tsx)`. The SVG grid geometry (width=72, height=56, the four highlighted square coordinates) mirrors the Protocol source. |
| `Logo.astro` | **High — structure 1:1; SVG content original** | File header: "ported 1:1 from the original Protocol Logo.tsx." The SVG paths are PrayCalc's own compass/starburst icon design (original), but the component structure, gradient markup pattern, and `<text>` wordmark approach follow Protocol exactly. REF: `Protocol re-skin (36996b7~1: Logo.tsx)`. |
| `Header.astro` | **Medium-High — Protocol parity, re-skinned** | File header: "Protocol parity, green-tuned." The scroll-driven background blur, search trigger wiring (Cmd/Ctrl+K dispatch), right-controls layout, and nav/divider structure are documented as Protocol-parity. Content (links, branding) and output language (Astro vs. Next.js) differ. REF: `Protocol re-skin (36996b7~1: Header.tsx)`. |
| `MobileNavToggle.tsx` | **Medium — Protocol mobile-nav style** | File header: "overlay drawer (Protocol mobile-nav style)." The full-screen portal overlay pattern is documented as Protocol-derived. The implementation is React 19 (original to this repo), no framer-motion. REF: `Protocol re-skin (MobileNavigation.tsx)`. |
| `PrevNext.astro` | **Low-Medium — Protocol-style footer pager** | File header: "renders two arrow cards (← prev / next →) like the Protocol template footer pager." The card layout with ← prev / next → arrows is a documented Protocol-style pattern. Implementation is Astro (no direct port cited). REF: Epic B-2 (no direct Protocol source commit). |
| `DocsSidebar.tsx` | **Low — Protocol-inspired** | No direct "Protocol re-skin" reference in the file header. Adds custom IntersectionObserver scroll-spy, section sub-listing, and section-click smooth-scroll — functionality beyond Protocol's sidebar. The visual style (active-page marker, vertical rule, zinc/emerald palette) is consistent with Protocol but not cited as a direct port. |
| `islands/Search.tsx` | **None — original** | Implements custom search using `@algolia/autocomplete-core` + FlexSearch over a static `/search-index.json`. Uses `@headlessui/react` (MIT-licensed independently). No Protocol derivation cited or apparent. |
| `islands/Feedback.tsx` | **None — original** | Uses `@headlessui/react` Transition (MIT). Yes/No feedback widget. No Protocol derivation cited. |
| `islands/ThemeToggle.tsx` | **Not inspected** | Not directly inspected in this pass; likely minimal and Protocol-stylistically consistent but not confirmed. |

**Summary:** 5 of 9 components carry explicit Protocol derivation notes (HeroPattern, Logo,
Header, MobileNavToggle, PrevNext). The two highest-derivation components are HeroPattern
(logic 1:1) and Logo (structure 1:1). Search and Feedback are fully original.

---

## The License Question

### What Tailwind Plus licenses say (factual, not legal interpretation)

Tailwind Plus (individual and team) grants licensees the right to use templates in any number
of personal and commercial projects. The published license terms explicitly state that licensees
may not:

- Use a purchased template to create a competing product (another template or theme for sale).
- Share, sell, or otherwise distribute the template files themselves.

The license does **not** contain explicit language addressing whether template-derived code may
be included in a **publicly accessible open-source repository** under a permissive open-source
license such as MIT.

The tension is this: an MIT license grants anyone who receives the code the rights to use, copy,
modify, merge, publish, distribute, sublicense, and sell copies. A Tailwind Plus license does
not grant the licensee the right to sublicense the template code to third parties. Publishing
Protocol-derived code in a public MIT repository may effectively grant the public rights that
the Tailwind Plus license does not allow the licensee to grant.

### What is NOT in question

- `@headlessui/react` (used in Search.tsx, Feedback.tsx) is an MIT-licensed open-source
  package maintained by Tailwind Labs. Its use in a public MIT repository is unambiguously
  permitted.
- `@tailwindcss/typography`, `tailwindcss`: MIT-licensed. No restriction on public use.
- The PrayCalc logo SVG paths in `Logo.astro`: the actual icon artwork is PrayCalc's original
  design. The question is only whether the component structure (the "how the file is organized")
  is protectable.
- Functional patterns (scroll-blur headers, mobile nav drawers, prev/next page navigation)
  are common web patterns not unique to Protocol. Counsel should assess whether the specific
  implementation expression in these files crosses the threshold for protectable expression,
  distinct from unprotectable functional ideas.
- The `HeroPattern.astro` SVG grid geometry (specific width/height values 72×56, the four
  `[sx, sy]` square coordinates `[4,3][2,1][7,3][10,6]`) is more clearly specific expression
  ported from Protocol source — this is the strongest candidate for a genuine derivation concern.

---

## Three Options for Counsel Consideration

### Option A — License `org/` under terms that exclude Protocol-derived components

Add a `LICENSE` file to `org/` (or to the repo root for the full `praycalc` repo) that is MIT
for original code and explicitly carves out the Protocol-derived components as "All rights
reserved / used under a commercial license from Tailwind Labs." This approach:

- Is factually accurate.
- Removes the inconsistency between the MIT grant and the Tailwind Plus license.
- Is unusual for a public GitHub repository and may confuse contributors or users of the
  published packages.
- Does not eliminate the Protocol-derivation risk — it documents the carve-out rather than
  resolving it. Tailwind Labs still needs to not object to the public availability of the
  ported code.

### Option B — Rewrite the five derived components from scratch

Replace HeroPattern.astro, the Protocol-parity portions of Header.astro, MobileNavToggle.tsx,
PrevNext.astro, and the Logo structure in Logo.astro with implementations that are not based
on Protocol source, documented as independently authored. Leave Logo SVG paths (original
PrayCalc art) intact.

This approach:
- Fully resolves the license question.
- Has engineering cost: estimated 1–2 sprint-days for a careful rewrite of the five components.
- The DocsSidebar.tsx and Search.tsx are already original — no action needed there.
- HeroPattern.astro is the simplest to rewrite (a background gradient + SVG grid is easily
  re-authored without referencing the Protocol source). PrevNext.astro is equally
  straightforward. Header and MobileNavToggle are more involved.

### Option C — Obtain written permission from Tailwind Labs

Contact Tailwind Labs (Adam Wathan / Tailwind Labs, Inc.) to request explicit written
confirmation that including Protocol-derived components in a public MIT-licensed open-source
documentation site is permitted under the purchased Tailwind Plus license.

This approach:
- Resolves the question definitively if granted.
- Has no engineering cost.
- Outcome is uncertain — Tailwind Labs may grant it (open-source documentation sites using
  Protocol are not uncommon), decline it, or offer a different resolution.
- Should be pursued before Option B if counsel believes the permission is likely to be
  granted, since Option B has engineering cost and B and C are mutually exclusive.

---

## Counsel Questions

1. Does including Protocol-derived source code in a public GitHub repository, under the
   conditions described, violate the Tailwind Plus license — specifically the prohibition on
   distributing template files?
2. Is the Tailwind Plus license's prohibition on "distributing template files" materially
   different from publishing adapted/ported code that was derived from those files?
3. For Options A, B, and C: which approach provides adequate clearance and is proportionate
   to the risk level of the specific files at issue?
4. Does the fact that `org/` is a documentation site (not a commercial product or competing
   template) affect the risk assessment?

---

## See Also

- `org/src/components/` — all component files referenced above
- `org/package.json` — no Tailwind Plus package dependency; only MIT-licensed packages
- `smart/certification/alexa/`, `smart/certification/google/` — unrelated to this analysis
- `web/src/pages/legal/` — the CCPA draft is in a separate legal memo
