// FILE: src/lib/rehype-wrap-tables.ts
// PURPOSE: Rehype plugin that wraps every rendered <table> in MDX docs with
//   <div class="overflow-x-auto">...</div> so wide tables (e.g. the 6-column
//   method-comparison table, the API parameter tables) scroll horizontally on
//   narrow viewports instead of overflowing the page.
// INPUTS: hast tree, supplied by the unified/rehype pipeline (wired into
//   markdown.rehypePlugins in astro.config.ts).
// OUTPUTS: mutated hast tree with every <table> element wrapped in a div.
// CONSTRAINTS:
//   - CSS `overflow` has no effect on a `display:table` box, so the previous
//     `prose-table:overflow-x-auto` Tailwind modifier (applied directly to
//     the <table> element in DocPage.astro) created no scroll container at
//     all. Wrapping the table in a block-level div is the only correct fix
//     (RESP-03).
//   - No new npm dependency: walks the hast tree by hand instead of pulling
//     in `unist-util-visit` / `@types/hast`. Neither is a direct dependency
//     of this package — org/ has its own standalone pnpm-lock.yaml (see
//     REL-09 / lesson_praycalc_dual_lockfile_dependabot) and both packages,
//     while present transitively in the lockfile, are not hoisted for a
//     package that isn't their direct dependent under pnpm's strict
//     node_modules layout. A minimal local type + manual recursion avoids
//     the lockfile churn entirely.
//   - The wrapper div does not disable Tailwind Typography's `.prose table`
//     styling — `.prose table` is a descendant-combinator selector, so it
//     still matches the table through the new wrapper.
// REF: RESP-03 (docs table overflow on phones)

/** Minimal structural subset of a hast node — avoids depending on the `hast` package. */
interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

function wrapTables(children: HastNode[]): HastNode[] {
  return children.map((node) => {
    if (node.type === 'element' && Array.isArray(node.children)) {
      node.children = wrapTables(node.children);
    }
    if (node.type === 'element' && node.tagName === 'table') {
      return {
        type: 'element',
        tagName: 'div',
        properties: { className: ['overflow-x-auto'] },
        children: [node],
      };
    }
    return node;
  });
}

/** Rehype plugin: wraps every `<table>` in a scrollable `<div>`. */
export default function rehypeWrapTables() {
  return (tree: HastNode) => {
    if (Array.isArray(tree.children)) {
      tree.children = wrapTables(tree.children);
    }
  };
}
