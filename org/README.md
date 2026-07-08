# praycalc.org

Scientific documentation site for [PrayCalc](https://praycalc.com) — solar physics, twilight optics, orbital mechanics, calculation methods, and the npm packages that power prayer time calculation. Built with [Astro 5](https://astro.build), MDX, React 19 islands, and Tailwind CSS v4.

## Getting started

Install dependencies with pnpm (this repo is pnpm-only):

```bash
pnpm install
```

Run the dev server:

```bash
pnpm dev
```

Open [http://localhost:3041](http://localhost:3041) in your browser.

## Scripts

| Script | Purpose |
| --- | --- |
| `pnpm dev` | Start the Astro dev server on port 3041 |
| `pnpm build` | Build the static search index, then build the site to `dist/` |
| `pnpm preview` | Preview the production build on port 3041 |
| `pnpm typecheck` | Run `astro check` + `tsc --noEmit` |
| `pnpm lint` | Run ESLint |

## Content

Docs pages live under `src/pages/` as `.mdx` files (Getting Started, Features, Science, Research, Packages, Advanced) plus a small set of translated landing pages (`src/pages/{ar,fa,ur,id}/index.astro`). Sidebar navigation is the single source of truth at `src/lib/navigation.ts`.

## Search

Site search is powered by [FlexSearch](https://github.com/nextapps-de/flexsearch), lazily loaded on first interaction (click the search trigger or press `⌘K`/`Ctrl+K`). The index is generated at build time from the English MDX pages by `src/scripts/build-search-index.mjs` into `public/search-index.json` — no manual configuration needed when adding a new doc page.

## Stack

- [Astro 5](https://astro.build/) — static site generation, MDX pages, islands architecture
- [React 19](https://react.dev/) — interactive islands (search, sidebar, table of contents, theme toggle, feedback widget)
- [Tailwind CSS v4](https://tailwindcss.com/) — styling
- [Headless UI](https://headlessui.com/) — accessible dialog/transition primitives
- [Algolia Autocomplete](https://www.algolia.com/doc/ui-libraries/autocomplete/introduction/what-is-autocomplete/) — search UI/keyboard behavior
- [FlexSearch](https://github.com/nextapps-de/flexsearch) — client-side search index
- [Framer Motion](https://www.framer.com/motion/) — sidebar/TOC animations

## License

See [LICENSE.md](./LICENSE.md).
