/**
 * api/search.ts — City autocomplete search endpoint.
 *
 * PURPOSE: GET /api/search?q=<query> — returns matching GeoResult[]
 *   Used by LocationSearch island.
 * INPUTS: query string (min 2 chars)
 * OUTPUTS: JSON array of GeoResult
 * REF: P2-E3-W02-S02-T03
 */

import type { APIRoute } from 'astro';
import { searchAutoComplete, lookupGeoByName } from '@/lib/data-lookup.server';
import { geoRecordToResult } from '@/lib/geo.server';
import type { GeoResult } from '@/lib/geo';

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q');
  if (!q || q.trim().length < 2) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const autoResults = searchAutoComplete(q.trim());
  const results: GeoResult[] = autoResults
    .map((r) => {
      const geo = lookupGeoByName(r.n);
      return geo ? geoRecordToResult(geo) : null;
    })
    .filter((r): r is GeoResult => r !== null);

  return new Response(JSON.stringify(results), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
