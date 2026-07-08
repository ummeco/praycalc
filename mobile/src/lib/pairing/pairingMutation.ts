/**
 * Purpose: GraphQL mutation builders for TV pairing — claims a pending pc_tv_pairing
 *   row (by PIN) and seeds the pc_tv_settings management row for the claimed device.
 * Inputs: pin (6-digit string from TV screen or deep link), optional active location
 *   (lat/lng/city/timezone) from the settings store — delivered to the TV during
 *   pairing so it can render local prayer times without a separate location step.
 * Outputs: { mutation, variables } ready for urql client.mutation()
 * Constraints: The TV app inserts its OWN pc_tv_pairing row (with its own stable
 *   device_id) when it boots and shows a PIN; the phone must NEVER write device_id —
 *   doing so overwrites the TV's real identity and breaks its ability to find its
 *   settings/paired-state on reboot (post-mortem: an earlier insert-based PAIR_TV_MUTATION
 *   did this). CLAIM_TV_MUTATION is therefore an UPDATE keyed on `pin` (+ is_active/paired
 *   guards so a PIN can only be claimed once), never an insert. It returns the TV's real
 *   `device_id` via `returning`, which the caller MUST use to seed pc_tv_settings —
 *   never a phone-generated id. `affected_rows === 0` means the PIN is invalid, already
 *   claimed, or expired. Column names MUST match tv/src/lib/graphql/queries.ts
 *   CHECK_PRAYCALC_PAIRING exactly (pin, is_active, paired, user_id, device_id, latitude,
 *   longitude, city, timezone) — the TV polls pc_tv_pairing with those columns. Uses the
 *   signed-in user's JWT (Hasura user role) — user_id is set server-side via a Hasura
 *   session-variable preset, never sent from the client; server-side Hasura permission
 *   additionally gates this on Ummat+ entitlement (D-TV-PAIRING-PLUS-GATE). The
 *   pc_tv_settings upsert (SEED_TV_SETTINGS_MUTATION) keeps any existing `name` on
 *   conflict (only location columns are re-synced on re-pair) so a user's chosen TV name
 *   never gets clobbered by pairing again.
 *
 * TvSettingsPatch (used by the My TVs manager's UPDATE_TV_SETTINGS mutation, defined in
 * TvManagerScreen.tsx) covers the full pc_tv_settings column contract, incl. the deep-settings
 * columns added for the TV dashboard epic: countdown_takeover_enabled/countdown_minutes,
 * iqama_enabled/iqama_offsets, name_only_enabled/name_only_minutes, calc_method, madhab,
 * time_format. Value contract (live prod schema): calc_method is a free-form method key
 * lowercased (e.g. 'dpc'); madhab is 'shafii'|'hanafi'; time_format is '12h'|'24h';
 * iqama_offsets is a 5-key object {fajr,dhuhr,asr,maghrib,isha} in minutes after adhan
 * (no sunrise key) — always send the full object on write, never a partial patch, since
 * Hasura's jsonb _set replaces the whole column.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-pairing-mutation
 */

export const CLAIM_TV_MUTATION = `
  mutation ClaimTv(
    $pin: String!
    $latitude: float8
    $longitude: float8
    $city: String
    $timezone: String
  ) {
    update_pc_tv_pairing(
      where: {
        pin: { _eq: $pin }
        is_active: { _eq: true }
        paired: { _eq: false }
      }
      _set: {
        paired: true
        latitude: $latitude
        longitude: $longitude
        city: $city
        timezone: $timezone
      }
    ) {
      affected_rows
      returning {
        device_id
      }
    }
  }
`;

/**
 * Seeds (or refreshes the location on) the pc_tv_settings row for a freshly-claimed
 * device. `deviceId` MUST be the TV's real device_id returned by CLAIM_TV_MUTATION's
 * `returning[0].device_id` — never a phone-generated id. `name` is only set on INSERT —
 * on_conflict update_columns intentionally omits `name` so re-pairing never overwrites
 * a name the user already customized in the My TVs screen.
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

/** iqama_offsets jsonb shape — minutes AFTER adhan per prayer. No sunrise key. */
export interface IqamaOffsets {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export const DEFAULT_IQAMA_OFFSETS: IqamaOffsets = {
  fajr: 20, dhuhr: 10, asr: 10, maghrib: 5, isha: 10,
};

export type TvMadhab = 'shafii' | 'hanafi';
export type TvTimeFormat = '12h' | '24h';

/**
 * Full pc_tv_settings editable-column patch shape (My TVs manager UPDATE_TV_SETTINGS
 * mutation). Mirrors the live prod column contract from T1 (see file header). All fields
 * optional — callers send only the columns they're changing.
 */
export interface TvSettingsPatch {
  name?: string;
  accent_color?: string;
  stream_source?: string;
  rotate_minutes?: number;
  show_weather?: boolean;
  latitude?: number;
  longitude?: number;
  city?: string;
  timezone?: string;
  countdown_takeover_enabled?: boolean;
  countdown_minutes?: number;
  iqama_enabled?: boolean;
  iqama_offsets?: IqamaOffsets;
  name_only_enabled?: boolean;
  name_only_minutes?: number;
  calc_method?: string;
  madhab?: TvMadhab;
  time_format?: TvTimeFormat;
}

export interface ClaimTvVariables {
  pin: string;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  timezone: string | null;
}

/** Shape of CLAIM_TV_MUTATION's response — `returning[0].device_id` is the TV's
 *  real, stable device_id (never a phone-generated one) and MUST be used to seed
 *  pc_tv_settings. `affected_rows === 0` means the PIN was invalid/already
 *  claimed/expired. */
export interface ClaimTvResult {
  update_pc_tv_pairing: {
    affected_rows: number;
    returning: { device_id: string }[];
  };
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
 * Build the mutation + variables payload for claiming a TV PIN. Never sends a
 * device_id — the TV owns its own device_id and CLAIM_TV_MUTATION only updates
 * the row it already inserted, keyed by `pin`. `location` is optional (the active
 * location may not be set yet) — omitted fields are sent as null.
 */
export function buildPairTvRequest(
  pin: string,
  location?: ActiveLocationInput | null,
): {
  query: string;
  variables: ClaimTvVariables;
} {
  if (!isValidPin(pin)) {
    throw new Error('PIN must be exactly 6 digits.');
  }
  return {
    query: CLAIM_TV_MUTATION,
    variables: {
      pin,
      latitude: location?.latitude ?? null,
      longitude: location?.longitude ?? null,
      city: location?.city ?? null,
      timezone: location?.timezone ?? null,
    },
  };
}

/**
 * Build the pc_tv_settings seed mutation + variables for a device that was just
 * claimed. Called after buildPairTvRequest succeeds, using the TV's real device_id
 * from the claim response (`ClaimTvResult.update_pc_tv_pairing.returning[0].device_id`)
 * — seeds the management row with the same location so "My TVs" has data on first view.
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
