// Post-build step for the CJS output: tsc emits .js files, but this package's
// package.json declares "type": "module"-style ESM entrypoints, so the CJS
// build must ship as .cjs. Renames dist/cjs/**/*.js to .cjs and rewrites
// relative require("./x.js") specifiers to require("./x.cjs").
// Copied verbatim from packages/ui-utils/scripts/fix-cjs.mjs — keep both in
// sync if this post-build step ever changes.
import { readdirSync, readFileSync, writeFileSync, renameSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../dist/cjs', import.meta.url).pathname;

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

// 1. Rename *.js -> *.cjs
for (const file of walk(ROOT)) {
  if (file.endsWith('.js')) renameSync(file, file.slice(0, -3) + '.cjs');
}

// 2. Rewrite relative require("./x.js") -> require("./x.cjs")
const RELATIVE_REQUIRE = /require\((['"])(\.{1,2}\/[^'"]+)\.js\1\)/g;
for (const file of walk(ROOT)) {
  if (!file.endsWith('.cjs')) continue;
  const src = readFileSync(file, 'utf8');
  const next = src.replace(RELATIVE_REQUIRE, 'require($1$2.cjs$1)');
  if (next !== src) writeFileSync(file, next);
}
