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

import { copyFileSync, cpSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const web = resolve(__dirname, '..');
const funcRoot = resolve(web, '.vercel/output/functions/_render.func');
const webRequire = createRequire(resolve(web, 'package.json'));

// --- 1. Copy nrel-spa/lib/spa.js ---
// resolve dynamically so the path works in both local pnpm store and CI virtual store
const spaSrc = webRequire.resolve('nrel-spa/lib/spa.js');
const spaRelative = spaSrc.replace(/.*node_modules\//, 'node_modules/');
const spaDest = resolve(funcRoot, spaRelative);

if (!existsSync(spaSrc)) {
  console.error(`[postbuild] ERROR: nrel-spa/lib/spa.js not found (checked: ${spaSrc})`);
  process.exit(1);
}
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
