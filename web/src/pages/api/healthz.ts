/**
 * api/healthz.ts — Health check endpoint.
 * REF: P2-E3-W02-S02-T03
 */

import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
  return new Response(JSON.stringify({ status: 'ok', app: 'praycalc-web' }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
