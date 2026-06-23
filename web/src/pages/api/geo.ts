/**
 * api/geo.ts — Reverse geocoding and IP geolocation endpoint.
 *
 * PURPOSE: GET /api/geo?lat=<lat>&lng=<lng> — reverse geocode
 *          GET /api/geo?q=<query> — city name lookup
 *          GET /api/geo?ip=1 — IP-based geolocation
 * INPUTS: lat/lng, query, or ip flag
 * OUTPUTS: JSON GeoResult
 * REF: P2-E3-W02-S02-T03
 */

import type { APIRoute } from 'astro';
import { lookupGeoByCoords, lookupGeoByName } from '@/lib/data-lookup.server';
import { geoRecordToResult } from '@/lib/geo.server';

interface IpapiResponse {
  city?: string;
  latitude?: number;
  longitude?: number;
  country_code?: string;
  error?: boolean;
}

function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const raw = forwarded ? forwarded.split(',')[0]!.trim() : (realIp ?? null);
  if (!raw) return null;
  if (
    raw === '::1' ||
    raw.startsWith('127.') ||
    raw.startsWith('10.') ||
    raw.startsWith('192.168.') ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(raw)
  ) return null;
  return raw;
}

export const GET: APIRoute = async ({ url, request }) => {
  const lat = url.searchParams.get('lat');
  const lng = url.searchParams.get('lng');
  const q = url.searchParams.get('q');
  const ipFlag = url.searchParams.get('ip');

  // Reverse geocode by coordinates
  if (lat && lng) {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (isNaN(latNum) || isNaN(lngNum)) {
      return new Response(JSON.stringify({ error: 'Invalid coordinates' }), { status: 400 });
    }
    const record = lookupGeoByCoords(latNum, lngNum);
    if (!record) {
      return new Response(JSON.stringify(null), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify(geoRecordToResult(record)), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // City name lookup
  if (q) {
    const record = lookupGeoByName(q);
    if (!record) {
      return new Response(JSON.stringify(null), { headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(JSON.stringify(geoRecordToResult(record)), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // IP geolocation
  if (ipFlag) {
    const ip = getClientIp(request);
    if (!ip) {
      return new Response(JSON.stringify(null), { headers: { 'Content-Type': 'application/json' } });
    }
    try {
      const res = await fetch(`https://ipapi.co/${ip}/json/`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!res.ok) throw new Error('ipapi failed');
      const data = await res.json() as IpapiResponse;
      if (!data.error && data.city) {
        const record = lookupGeoByName(data.city);
        if (record) {
          return new Response(JSON.stringify(geoRecordToResult(record)), {
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    } catch {
      // IP geolocation failed — return null gracefully
    }
    return new Response(JSON.stringify(null), { headers: { 'Content-Type': 'application/json' } });
  }

  return new Response(JSON.stringify({ error: 'Missing parameters' }), { status: 400 });
};
