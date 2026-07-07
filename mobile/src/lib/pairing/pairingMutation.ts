/**
 * Purpose: GraphQL mutation builders for TV pairing — inserts into pc_tv_pairing
 *   (claim) and pc_tv_settings (per-device management row).
 * Inputs: pin (6-digit string from TV screen or deep link), deviceId (generated per
 *   app install), optional active location (lat/lng/city/timezone) from the settings
 *   store — delivered to the TV during pairing so it can render local prayer times
 *   without a separate location step on the TV side.
 * Outputs: { mutation, variables } ready for urql client.mutation()
 * Constraints: Column names MUST match tv/src/lib/graphql/queries.ts CHECK_PRAYCALC_PAIRING exactly
 *   (pin, is_active, paired, user_id, device_id, latitude, longitude, city, timezone) — the TV
 *   polls pc_tv_pairing with those columns. Uses the signed-in user's JWT (Hasura user role);
 *   server-side Hasura permission additionally gates this on Ummat+ entitlement
 *   (D-TV-PAIRING-PLUS-GATE). The pc_tv_settings upsert (SEED_TV_SETTINGS_MUTATION) keeps
 *   any existing `name` on conflict (only location columns are re-synced on re-pair) so a
 *   user's chosen TV name never gets clobbered by pairing again.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-pairing-mutation
 */

export const PAIR_TV_MUTATION = `
  mutation PairTv(
    $pin: String!
    $deviceId: String!
    $latitude: float8
    $longitude: float8
    $city: String
    $timezone: String
  ) {
    insert_pc_tv_pairing_one(
      object: {
        pin: $pin
        device_id: $deviceId
        is_active: true
        paired: true
        latitude: $latitude
        longitude: $longitude
        city: $city
        timezone: $timezone
      }
      on_conflict: {
        constraint: pc_tv_pairing_pin_key
        update_columns: [device_id, is_active, paired, latitude, longitude, city, timezone]
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

/**
 * Seeds (or refreshes the location on) the pc_tv_settings row for a freshly-paired
 * device. `name` is only set on INSERT — on_conflict update_columns intentionally
 * omits `name` so re-pairing never overwrites a name the user already customized
 * in the My TVs screen.
 */
export const SEED_TV_SETTINGS_MUTATION = `
  mutation SeedTvSettings(
    $deviceId: String!
    $name: String!
    $latitude: float8
    $longitude: float8
    $city: String
    $timezone: String
  ) {
    insert_pc_tv_settings_one(
      object: {
        device_id: $deviceId
        name: $name
        latitude: $latitude
        longitude: $longitude
        city: $city
        timezone: $timezone
      }
      on_conflict: {
        constraint: pc_tv_settings_device_key
        update_columns: [latitude, longitude, city, timezone]
      }
    ) {
      id
      device_id
      name
    }
  }
`;

export const DEFAULT_TV_NAME = 'My TV';

export interface ActiveLocationInput {
  latitude: number;
  longitude: number;
  city: string;
  timezone: string;
}

export interface PairTvVariables {
  pin: string;
  deviceId: string;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  timezone: string | null;
}

export interface SeedTvSettingsVariables {
  deviceId: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  timezone: string | null;
}

const PIN_PATTERN = /^\d{6}$/;

/** Validate a 6-digit PIN string (from manual entry or deep link). */
export function isValidPin(pin: string): boolean {
  return PIN_PATTERN.test(pin);
}

/**
 * Build the mutation + variables payload for pairing this device to a TV PIN.
 * `location` is optional (the active location may not be set yet) — omitted fields
 * are sent as null, which the TV/settings row simply leaves unset.
 */
export function buildPairTvRequest(
  pin: string,
  deviceId: string,
  location?: ActiveLocationInput | null,
): {
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
    variables: {
      pin,
      deviceId,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      city: location?.city ?? null,
      timezone: location?.timezone ?? null,
    },
  };
}

/**
 * Build the pc_tv_settings seed mutation + variables for a device that was just
 * paired. Called after buildPairTvRequest succeeds — seeds the management row
 * with the same location so "My TVs" has data on first view.
 */
export function buildSeedTvSettingsRequest(
  deviceId: string,
  location?: ActiveLocationInput | null,
  name: string = DEFAULT_TV_NAME,
): {
  query: string;
  variables: SeedTvSettingsVariables;
} {
  if (!deviceId) {
    throw new Error('Device ID is required.');
  }
  return {
    query: SEED_TV_SETTINGS_MUTATION,
    variables: {
      deviceId,
      name,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      city: location?.city ?? null,
      timezone: location?.timezone ?? null,
    },
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
