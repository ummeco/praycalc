/**
 * postbuild.mjs — Fix Vercel Lambda bundle after `astro build`.
 *
 * WHY: Two resources are missing from the Lambda bundle after build:
 *
 * 1. nrel-spa/lib/* — When pray-calc is bundled as external, nrel-spa/dist/index.mjs
 *    uses createRequire(import.meta.url) to load the SPA core from ../lib/ at runtime.
 *    Vercel only copies dist/ files, not lib/. Copy them in manually.
 *
 *    Copy EVERY file in lib/ rather than one hardcoded name. nrel-spa 2.1.0 renamed the
 *    core from spa.js to spa.cjs while still shipping the old name as a leftover, so a
 *    hardcoded 'spa.js' copied a file the bundle never loads and every SSR city page
 *    500'd with "Cannot find module '../lib/spa.cjs'". The build stayed green because
 *    the failure only appears when the Lambda actually renders.
 *
 * 2. data/ directory (geo.json + auto.json) — data-lookup.server.ts reads
 *    path.join(process.cwd(), "data", ...) at runtime. Lambda cwd is /var/task/,
 *    so data/ must be at the function root. Copy it there.
 */

import { copyFileSync, cpSync, mkdirSync, existsSync, readdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const web = resolve(__dirname, '..');
const funcRoot = resolve(web, '.vercel/output/functions/_render.func');

// --- 1. Copy nrel-spa/lib/spa.js ---
// In pnpm workspaces the virtual store can be at the workspace root (parent of web/)
// rather than inside web/node_modules/.pnpm. Search both locations, version-agnostic.
function findNrelSpaLib(searchRoot) {
  const pnpmStore = resolve(searchRoot, 'node_modules/.pnpm');
  if (!existsSync(pnpmStore)) return null;
  for (const entry of readdirSync(pnpmStore)) {
    if (!entry.startsWith('nrel-spa@')) continue;
    const candidate = resolve(pnpmStore, entry, 'node_modules/nrel-spa/lib');
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

/**
 * Every `nrel-spa/dist` directory inside the built function bundle.
 *
 * The destination is DISCOVERED rather than derived from the source path. Vercel nests
 * the bundle differently depending on whether the install lives in web/ or at the
 * workspace root — `_render.func/node_modules/...` in one case and
 * `_render.func/web/node_modules/...` in the other — and a regex that rewrites the source
 * path guesses wrong for one of them, silently placing the file where nothing looks for
 * it. Walking the output for the real dist/ location works for both layouts.
 */
function findBundledNrelSpaDists(root) {
  const found = [];
  const walk = (dir, depth) => {
    if (depth > 12 || !existsSync(dir)) return;
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue;
      const child = resolve(dir, entry.name);
      if (entry.name === 'nrel-spa' && existsSync(resolve(child, 'dist'))) {
        found.push(child);
        continue;
      }
      walk(child, depth + 1);
    }
  };
  walk(root, 0);
  return found;
}

const spaLibDir = findNrelSpaLib(web) ?? findNrelSpaLib(resolve(web, '..'));
if (!spaLibDir) {
  console.error('[postbuild] ERROR: nrel-spa/lib not found in web or workspace root .pnpm store');
  process.exit(1);
}
const libFiles = readdirSync(spaLibDir);
if (libFiles.length === 0) {
  console.error('[postbuild] ERROR: nrel-spa/lib is empty');
  process.exit(1);
}

const bundledPkgs = findBundledNrelSpaDists(funcRoot);
if (bundledPkgs.length === 0) {
  console.error('[postbuild] ERROR: no nrel-spa package found inside the Lambda bundle');
  process.exit(1);
}
for (const pkgDir of bundledPkgs) {
  for (const file of libFiles) {
    const dest = resolve(pkgDir, 'lib', file);
    mkdirSync(dirname(dest), { recursive: true });
    copyFileSync(resolve(spaLibDir, file), dest);
  }
}
console.log(
  `[postbuild] Copied nrel-spa/lib/{${libFiles.join(', ')}} into ${bundledPkgs.length} bundled copy(s) \u2713`,
);

// --- 2. Copy data/ directory (geo.json + auto.json) ---
const dataSrc = resolve(web, 'data');
const dataDest = resolve(funcRoot, 'data');

if (!existsSync(dataSrc)) {
  console.error(`[postbuild] ERROR: data/ dir not found at:\n  ${dataSrc}`);
  process.exit(1);
}
cpSync(dataSrc, dataDest, { recursive: true, filter: (src) => {
  // Only copy JSON files (skip libs/, sources/, build.js)
  return src === dataSrc || src.endsWith('.json');
}});
console.log('[postbuild] Copied data/*.json → Lambda bundle root ✓');
