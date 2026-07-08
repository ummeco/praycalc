/**
 * Purpose: Parse `praycalc://` deep links into an internal route intent. Extends the
 *   original pairing-only handler (extractPinFromDeepLink in lib/pairing/pairingMutation)
 *   with a few more routes so shared links / future widgets can open specific screens:
 *   praycalc://pair?pin=NNNNNN (existing, unchanged), praycalc://city/<name>,
 *   praycalc://times.
 * Inputs: A raw deep link URL string (from Linking.getInitialURL() or the 'url' event).
 * Outputs: A discriminated-union DeepLinkRoute describing where to navigate, or null
 *   when the URL isn't a recognized praycalc:// link.
 * Constraints: Pure parsing only — no navigation side effects here (the caller in
 *   _layout.tsx does the router.push). Must not touch the existing pair-link shape;
 *   extractPinFromDeepLink in pairingMutation.ts stays the source of truth for that case.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-lib-deep-link-routes
 */

export type DeepLinkRoute =
  | { kind: 'pair'; pin: string }
  | { kind: 'city'; name: string }
  | { kind: 'times' };

/**
 * Parse a praycalc:// URL into a DeepLinkRoute. Returns null for anything that
 * isn't a recognized route (unknown host/path, wrong scheme, malformed).
 */
export function parseDeepLink(url: string): DeepLinkRoute | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'praycalc:') return null;

  // praycalc://pair?pin=123456 — hostname is 'pair' (matches extractPinFromDeepLink's shape)
  if (parsed.hostname === 'pair' || parsed.pathname.includes('pair')) {
    const pin = parsed.searchParams.get('pin');
    if (pin && /^\d{6}$/.test(pin)) {
      return { kind: 'pair', pin };
    }
    return null;
  }

  // praycalc://city/<name> — hostname is 'city', first path segment is the city name
  if (parsed.hostname === 'city') {
    const segment = parsed.pathname.replace(/^\/+/, '');
    const name = segment ? decodeURIComponent(segment) : null;
    if (name) return { kind: 'city', name };
    return null;
  }

  // praycalc://times — no params needed
  if (parsed.hostname === 'times') {
    return { kind: 'times' };
  }

  return null;
}
