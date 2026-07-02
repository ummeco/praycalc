/**
 * Purpose: GraphQL mutation builder for TV pairing — inserts into pc_tv_pairing.
 * Inputs: pin (6-digit string from TV screen or deep link), deviceId (generated per app install)
 * Outputs: { mutation, variables } ready for urql client.mutation()
 * Constraints: Column names MUST match tv/src/lib/graphql/queries.ts CHECK_PRAYCALC_PAIRING exactly
 *   (pin, is_active, paired, user_id, device_id) — the TV polls pc_tv_pairing with those columns.
 *   Uses the signed-in user's JWT (Hasura user role); server-side Hasura permission additionally
 *   gates this on Ummat+ entitlement (D-TV-PAIRING-PLUS-GATE).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-pairing-mutation
 */

export const PAIR_TV_MUTATION = `
  mutation PairTv($pin: String!, $deviceId: String!) {
    insert_pc_tv_pairing_one(
      object: { pin: $pin, device_id: $deviceId, is_active: true, paired: true }
      on_conflict: {
        constraint: pc_tv_pairing_pin_key
        update_columns: [device_id, is_active, paired, user_id]
      }
    ) {
      pin
      device_id
      user_id
      paired
      is_active
    }
  }
`;

export interface PairTvVariables {
  pin: string;
  deviceId: string;
}

const PIN_PATTERN = /^\d{6}$/;

/** Validate a 6-digit PIN string (from manual entry or deep link). */
export function isValidPin(pin: string): boolean {
  return PIN_PATTERN.test(pin);
}

/** Build the mutation + variables payload for pairing this device to a TV PIN. */
export function buildPairTvRequest(pin: string, deviceId: string): {
  query: string;
  variables: PairTvVariables;
} {
  if (!isValidPin(pin)) {
    throw new Error('PIN must be exactly 6 digits.');
  }
  if (!deviceId) {
    throw new Error('Device ID is required.');
  }
  return {
    query: PAIR_TV_MUTATION,
    variables: { pin, deviceId },
  };
}

/**
 * Extract a PIN from a praycalc://pair?pin=123456 deep link URL.
 * Returns null when the URL isn't a valid pairing link or the PIN is malformed.
 */
export function extractPinFromDeepLink(url: string): string | null {
  try {
    const parsed = new URL(url);
    const isPairLink =
      (parsed.protocol === 'praycalc:' && parsed.hostname === 'pair') ||
      (parsed.protocol === 'praycalc:' && parsed.pathname.includes('pair'));
    if (!isPairLink) return null;
    const pin = parsed.searchParams.get('pin');
    if (!pin || !isValidPin(pin)) return null;
    return pin;
  } catch {
    return null;
  }
}
