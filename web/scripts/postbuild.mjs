/**
 * postbuild.mjs — Fix Vercel Lambda bundle after `astro build`.
 *
 * WHY: Two resources are missing from the Lambda bundle after build:
 *
 * 1. nrel-spa/lib/spa.js — When pray-calc is bundled as external,
 *    nrel-spa/dist/index.mjs uses createRequire(import.meta.url)("../lib/spa.js")
 *    at runtime. Vercel only copies dist/ files, not lib/. Copy it in manually.
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
function findNrelSpa(searchRoot) {
  const pnpmStore = resolve(searchRoot, 'node_modules/.pnpm');
  if (!existsSync(pnpmStore)) return null;
  for (const entry of readdirSync(pnpmStore)) {
    if (!entry.startsWith('nrel-spa@')) continue;
    const candidate = resolve(pnpmStore, entry, 'node_modules/nrel-spa/lib/spa.js');
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

const spaSrc = findNrelSpa(web) ?? findNrelSpa(resolve(web, '..'));
if (!spaSrc) {
  console.error('[postbuild] ERROR: nrel-spa/lib/spa.js not found in web or workspace root .pnpm store');
  process.exit(1);
}
const spaRelative = spaSrc.replace(/.*node_modules\//, 'node_modules/');
const spaDest = resolve(funcRoot, spaRelative);
mkdirSync(dirname(spaDest), { recursive: true });
copyFileSync(spaSrc, spaDest);
console.log(`[postbuild] Copied nrel-spa/lib/spa.js → Lambda bundle ✓`);

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
