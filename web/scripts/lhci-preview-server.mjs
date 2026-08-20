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

const entryModule = await import(pathToFileURL(entryPath).href);

/**
 * Node-style `(req, res)` request handler for whichever entry shape the adapter emitted.
 *
 * @astrojs/vercel changed its function entry between Astro 5 and 7: it used to default-export
 * a Node handler, and now default-exports `{ fetch }`, a Web-standard handler. Supporting
 * both keeps this harness working across the upgrade instead of dying with
 * "handler is not a function" only once a request arrives — the server still binds a port,
 * so a naive smoke check that only waits for the port would call it healthy.
 */
const handler = await (async () => {
  const entry = entryModule.default ?? entryModule;
  if (typeof entry === 'function') return entry;
  if (typeof entry?.fetch !== 'function') {
    throw new TypeError(
      `[lhci-preview-server] Unrecognised entry export: ${Object.keys(entry ?? {}).join(', ') || typeof entry}`,
    );
  }
  return async (req, res) => {
    const requestUrl = new URL(req.url ?? '/', `http://localhost:${port}`);
    const body =
      req.method === 'GET' || req.method === 'HEAD'
        ? undefined
        : await new Promise((resolve) => {
            const chunks = [];
            req.on('data', (c) => chunks.push(c));
            req.on('end', () => resolve(Buffer.concat(chunks)));
          });
    const response = await entry.fetch(
      new Request(requestUrl, {
        method: req.method,
        headers: /** @type {HeadersInit} */ (req.headers),
        body,
        duplex: body ? 'half' : undefined,
      }),
    );
    res.statusCode = response.status;
    response.headers.forEach((value, key) => res.setHeader(key, value));
    if (!response.body) return res.end();
    res.end(Buffer.from(await response.arrayBuffer()));
  };
})();

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
 *
 * Two response paths need covering, and they flush headers differently:
 *   1. The static-asset branch below sets headers via `res.setHeader()` then relies
 *      on Node's IMPLICIT header flush on the first `write()`/`end()` call (via
 *      `createReadStream().pipe(res)`) — decided lazily from `res.getHeader()`.
 *   2. Astro's NodeApp.writeResponse (the SSR document path, forwarded to `handler`
 *      below) calls `res.writeHead(status, headersObj)` EXPLICITLY. Node's writeHead
 *      flushes headers synchronously as part of that call in this runtime — by the
 *      time a lazy first-write decision runs, `res.headersSent` is already true and
 *      `res.getHeader()` no longer reflects what was passed to writeHead, so the
 *      original implementation (deciding only on write/end) silently never fired for
 *      the actual HTML document and Lighthouse always measured it uncompressed.
 *      Fixed by intercepting `writeHead` itself and deciding from its `headers` arg
 *      before the real writeHead call ever runs.
 */
function withCompression(req, res) {
  const acceptEncoding = String(req.headers['accept-encoding'] ?? '');
  const supportsBr = /\bbr\b/.test(acceptEncoding);
  const supportsGzip = /\bgzip\b/.test(acceptEncoding);
  if (!supportsBr && !supportsGzip) return res;

  const originalWriteHead = res.writeHead.bind(res);
  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);
  let compressor = null;
  let decided = false;

  function startCompressing() {
    compressor = supportsBr ? createBrotliCompress() : createGzip();
    compressor.on('data', (chunk) => originalWrite(chunk));
    compressor.on('end', () => originalEnd());
  }

  /** @param {Record<string, string | number | string[]>} headers */
  function findHeaderKey(headers, name) {
    return Object.keys(headers).find((k) => k.toLowerCase() === name);
  }

  // Path 2 (see header comment): explicit writeHead(status, headers) call.
  res.writeHead = (statusCode, arg2, arg3) => {
    decided = true;
    const hasStatusMessage = typeof arg2 === 'string';
    const statusMessage = hasStatusMessage ? arg2 : undefined;
    const headers = { ...((hasStatusMessage ? arg3 : arg2) ?? {}) };
    const contentTypeKey = findHeaderKey(headers, 'content-type');
    const contentType = contentTypeKey ? String(headers[contentTypeKey]) : '';
    if (COMPRESSIBLE_TYPE_RE.test(contentType)) {
      const lengthKey = findHeaderKey(headers, 'content-length');
      if (lengthKey) delete headers[lengthKey];
      headers['content-encoding'] = supportsBr ? 'br' : 'gzip';
      headers['vary'] = 'Accept-Encoding';
      startCompressing();
    }
    return hasStatusMessage
      ? originalWriteHead(statusCode, statusMessage, headers)
      : originalWriteHead(statusCode, headers);
  };

  // Path 1 (see header comment): implicit header flush via setHeader() + write()/end().
  const decideFromImplicitHeaders = () => {
    if (decided) return;
    decided = true;
    const contentType = String(res.getHeader('content-type') ?? '');
    if (!COMPRESSIBLE_TYPE_RE.test(contentType)) return;
    res.removeHeader('Content-Length');
    res.setHeader('Content-Encoding', supportsBr ? 'br' : 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
    startCompressing();
  };

  res.write = (chunk, ...args) => {
    decideFromImplicitHeaders();
    if (compressor) {
      if (chunk) compressor.write(chunk);
      return true;
    }
    return originalWrite(chunk, ...args);
  };

  res.end = (chunk, ...args) => {
    decideFromImplicitHeaders();
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

  Promise.resolve(handler(req, res)).catch((err) => {
    console.error('[lhci-preview-server] request failed:', err);
    if (!res.headersSent) res.statusCode = 500;
    res.end('Internal Server Error');
  });
});

server.listen(port, () => {
  console.log(`[lhci-preview-server] ready on http://localhost:${port}`);
});
