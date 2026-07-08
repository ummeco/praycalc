#!/usr/bin/env node
/**
 * lhci-preview-server.mjs — Serves the built Vercel output locally for Lighthouse CI.
 *
 * PURPOSE: This app uses `output: 'server'` with the @astrojs/vercel adapter, which
 *   does not implement `astro preview` (it exits with "does not support the preview
 *   command"). `vercel dev` isn't a substitute either — it re-runs the framework dev
 *   command instead of serving the prebuilt bundle. This script bridges the gap: it
 *   serves static assets straight from `.vercel/output/static/` (mirroring Vercel's
 *   filesystem-first routing) and forwards everything else to the actual compiled
 *   serverless handler, giving Lighthouse a true production-equivalent server —
 *   minified bundles, real asset hashes, no dev-mode HMR/overhead.
 * INPUTS: PORT env var (default 4321). Requires `pnpm build` to have already run.
 * OUTPUTS: HTTP server on PORT; logs "ready on" once listening (LHCI ready pattern).
 * CONSTRAINTS: local-only dev/CI tool, not part of the deployed app. Applies
 *   brotli/gzip compression to text responses (JS/CSS/HTML/JSON/SVG) negotiated via
 *   Accept-Encoding, mirroring Vercel's edge compression — without this, Lighthouse's
 *   "uses-text-compression" audit reports the full uncompressed transfer size and
 *   FCP/LCP are measured against a payload praycalc.com never actually serves.
 * REF: lighthouserc.cjs (startServerCommand) · web/.claude — Fix 4, PageSpeed audit
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createBrotliCompress, createGzip } from 'node:zlib';

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(__dirname, '..');
const staticDir = resolve(webRoot, '.vercel/output/static');
const entryPath = resolve(
  webRoot,
  '.vercel/output/functions/_render.func/web/dist/server/entry.mjs',
);

if (!existsSync(entryPath)) {
  console.error(
    `[lhci-preview-server] Missing build output at ${entryPath}. Run "pnpm build" first.`,
  );
  process.exit(1);
}

const { default: handler } = await import(pathToFileURL(entryPath).href);

/** @type {Record<string, string>} */
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
  '.mp3': 'audio/mpeg',
};

const port = Number(process.env.PORT) || 4321;

// Content-types worth compressing (matches what Vercel's edge compresses in prod).
// Already-compressed binaries (woff2, images, mp3) are deliberately excluded.
const COMPRESSIBLE_TYPE_RE =
  /^(text\/|application\/(javascript|json|manifest\+json|xml)|image\/svg\+xml)/;

/**
 * Wraps `res` so any response whose Content-Type matches COMPRESSIBLE_TYPE_RE is
 * transparently gzip/brotli-encoded per the request's Accept-Encoding, exactly as
 * Vercel's edge does for deployed responses. No-ops (returns `res` unchanged) when
 * the client sent no usable Accept-Encoding.
 */
function withCompression(req, res) {
  const acceptEncoding = String(req.headers['accept-encoding'] ?? '');
  const supportsBr = /\bbr\b/.test(acceptEncoding);
  const supportsGzip = /\bgzip\b/.test(acceptEncoding);
  if (!supportsBr && !supportsGzip) return res;

  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);
  let compressor = null;
  let decided = false;

  const decide = () => {
    if (decided) return;
    decided = true;
    const contentType = String(res.getHeader('content-type') ?? '');
    if (!COMPRESSIBLE_TYPE_RE.test(contentType)) return;
    compressor = supportsBr ? createBrotliCompress() : createGzip();
    res.removeHeader('Content-Length');
    res.setHeader('Content-Encoding', supportsBr ? 'br' : 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
    compressor.on('data', (chunk) => originalWrite(chunk));
    compressor.on('end', () => originalEnd());
  };

  res.write = (chunk, ...args) => {
    decide();
    if (compressor) {
      if (chunk) compressor.write(chunk);
      return true;
    }
    return originalWrite(chunk, ...args);
  };

  res.end = (chunk, ...args) => {
    decide();
    if (compressor) {
      if (chunk) compressor.write(chunk);
      compressor.end();
      return res;
    }
    return originalEnd(chunk, ...args);
  };

  return res;
}

const server = createServer((req, rawRes) => {
  const res = withCompression(req, rawRes);
  const url = new URL(req.url ?? '/', 'http://localhost');
  const candidate = join(staticDir, decodeURIComponent(url.pathname));

  if (existsSync(candidate) && statSync(candidate).isFile()) {
    const ext = extname(candidate);
    res.setHeader('Content-Type', MIME_TYPES[ext] ?? 'application/octet-stream');
    if (url.pathname.startsWith('/_astro/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
    createReadStream(candidate).pipe(res);
    return;
  }

  handler(req, res);
});

server.listen(port, () => {
  console.log(`[lhci-preview-server] ready on http://localhost:${port}`);
});
