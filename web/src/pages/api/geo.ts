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

/** Strict IPv4 pattern: 0-255 octets only, no port or extra chars. */
const IPV4_RE = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/** Strict IPv6 pattern: full or compressed hex groups, no port or zone ID. */
const IPV6_RE = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$|^::([0-9a-fA-F]{0,4}:){0,6}[0-9a-fA-F]{0,4}$|^[0-9a-fA-F]{0,4}::([0-9a-fA-F]{0,4}:){0,5}[0-9a-fA-F]{0,4}$/;

/**
 * Validate and return a safe public IP from request headers.
 * Rejects private, loopback, and malformed addresses to prevent SSRF.
 */
function getClientIp(request: Request): string | null {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const raw = forwarded ? forwarded.split(',')[0]!.trim() : (realIp ?? null);
  if (!raw) return null;

  // Validate: must match strict IPv4 or IPv6 — no hostnames, no port, no path
  const isIPv4 = IPV4_RE.test(raw);
  const isIPv6 = IPV6_RE.test(raw);
  if (!isIPv4 && !isIPv6) return null;

  // Reject loopback and private ranges (IPv4)
  if (isIPv4) {
    const octets = raw.split('.').map(Number);
    if (
      octets[0] === 127 ||
      octets[0] === 10 ||
      (octets[0] === 172 && octets[1]! >= 16 && octets[1]! <= 31) ||
      (octets[0] === 192 && octets[1] === 168) ||
      (octets[0] === 169 && octets[1] === 254) || // link-local
      octets[0] === 0 ||
      octets[0] === 255
    ) return null;
    // Validate each octet is in range 0-255
    if (octets.some(o => o < 0 || o > 255)) return null;
  }

  // Reject IPv6 loopback, unspecified, link-local, ULA (fc00::/7), and IPv4-mapped addresses.
  // Normalize to lowercase before all prefix checks.
  if (isIPv6) {
    const lower = raw.toLowerCase();
    // Expand full-form loopback (0:0:0:0:0:0:0:1) to compare against compressed form.
    // Simplest approach: expand and compare compressed → canonical loopback.
    const isLoopback = lower === '::1' || lower === '0:0:0:0:0:0:0:1' || lower === '0000:0000:0000:0000:0000:0000:0000:0001';
    const isUnspecified = lower === '::' || lower === '0:0:0:0:0:0:0:0' || lower === '0000:0000:0000:0000:0000:0000:0000:0000';
    if (
      isLoopback ||
      isUnspecified ||
      lower.startsWith('fe80:') ||               // link-local fe80::/10
      lower.startsWith('fc00:') ||               // ULA fc00::/8
      lower.startsWith('fd') ||                  // ULA fd00::/8
      lower.startsWith('::ffff:') ||             // IPv4-mapped (::ffff:0:0/96)
      lower.startsWith('64:ff9b:')               // NAT64 well-known prefix (RFC 6052)
    ) return null;
  }

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
