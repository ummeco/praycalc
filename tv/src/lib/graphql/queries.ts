/**
 * Purpose: GraphQL query documents for PrayCalc TV
 * Inputs: Prayer day, Hadith, Dua, Islamic events queries
 * Outputs: Typed gql query strings for urql
 * Constraints: All pc_ prefixed tables; Hasura schema
 * SPORT: praycalc/tv graphql queries
 */

export const GET_PRAYER_DAY = `
  query GetTvPrayerDay($date: date!, $city: String!) {
    pc_prayer_day(where: { date: { _eq: $date }, city: { _eq: $city } }, limit: 1) {
      fajr
      sunrise
      dhuhr
      asr
      maghrib
      isha
      date
      hijri_date
      hijri_month
      hijri_year
    }
  }
`;

/**
 * pc_hadith is small (3 rows as of 2026-07-07) — fetched in full and rotated
 * client-side by pickDailyHadith's day-seeded index, same convention the prior
 * bundled-array version used. reference is aliased to "source" to match the
 * HadithEntry type the screen renders.
 */
export const GET_HADITH_LIST = `
  query GetTvHadithList {
    pc_hadith(order_by: { id: asc }) {
      id
      text_ar
      text_en
      narrator
      source: reference
      grading
    }
  }
`;

export const GET_DUA_LIST = `
  query GetTvDuaList {
    pc_dua(order_by: { sort_order: asc }) {
      id
      title_ar
      title_en
      text_ar
      text_en
      transliteration
      source
    }
  }
`;

/**
 * pc_islamic_event stores a Hijri (month, day) pair, not a Gregorian date — the
 * screen computes the next upcoming Gregorian occurrence client-side via the
 * shared @umalqura/core hijri lib (same approach the prior hardcoded
 * ISLAMIC_EVENTS array used), so dates stay correct across Hijri years without
 * a server-side recompute job. is_active lets admin-seeded content be hidden
 * without a delete (e.g. a future content-gate correction).
 */
export const GET_ISLAMIC_EVENTS = `
  query GetIslamicEvents {
    pc_islamic_event(where: { is_active: { _eq: true } }, order_by: { hijri_month: asc, hijri_day: asc }) {
      id
      name
      hijri_month
      hijri_day
      description
    }
  }
`;

export const GET_MOON_PHASE = `
  query GetMoonPhase($date: date!) {
    pc_moon_phase(where: { date: { _eq: $date } }, limit: 1) {
      phase
      illumination
      age_in_days
      hijri_day
    }
  }
`;

export const CHECK_PRAYCALC_PAIRING = `
  query CheckPrayCalcPairing($pin: String!) {
    pc_tv_pairing(where: { pin: { _eq: $pin }, is_active: { _eq: true } }, limit: 1) {
      paired
      user_id
      device_id
      latitude
      longitude
      city
      timezone
    }
  }
`;

/**
 * TV full settings sync (public role). Selected by device_id — the same persisted
 * TV device id used for pairing. Covers cosmetic, deep-settings, and location columns;
 * the account (user role) writes them, the TV only reads. Location is included so a
 * post-pair edit from the account managers (web/mobile/desktop) reaches the TV on the
 * next sync, not just at pair time. When no row exists the caller falls back to store
 * defaults.
 */
export const GET_TV_SETTINGS = `
  query GetTvSettings($deviceId: String!) {
    pc_tv_settings(where: { device_id: { _eq: $deviceId } }, limit: 1) {
      accent_color
      stream_source
      rotate_minutes
      show_weather
      countdown_takeover_enabled
      countdown_minutes
      iqama_enabled
      iqama_offsets
      name_only_enabled
      name_only_minutes
      calc_method
      madhab
      time_format
      latitude
      longitude
      city
      timezone
    }
  }
`;

/**
 * TV-side pre-registration insert (public role). Server presets `is_active: true,
 * paired: false` — the TV must NOT send those columns (Hasura preset overrides/rejects
 * client-supplied values for preset columns). Unique constraint `pc_tv_pairing_pin_key`
 * on `pin` — on collision the caller must catch the error and regenerate the PIN.
 * Verified live against api.praycalc.com 2026-07-06: insert succeeds with exactly
 * { pin, device_id } and returns { paired: false, is_active: true }; a duplicate pin
 * returns a "Uniqueness violation ... pc_tv_pairing_pin_key" error.
 */
export const REGISTER_TV_PAIRING = `
  mutation RegisterTvPairing($pin: String!, $deviceId: String!) {
    insert_pc_tv_pairing_one(object: { pin: $pin, device_id: $deviceId }) {
      pin
      device_id
      paired
      is_active
    }
  }
`;

/**
 * City search — live in production against pc_cities (NOT pc_city, which does not
 * exist; verified via introspection + a live query against api.praycalc.com
 * 2026-07-06: pc_cities has 49,742 rows, columns id/name/country/state/latitude/
 * longitude/timezone/population, public role select, capped at limit 50).
 */
export const GET_CITY_LIST = `
  query GetTvCityList($search: String!, $limit: Int!) {
    pc_cities(
      where: { name: { _ilike: $search } }
      order_by: { population: desc_nulls_last }
      limit: $limit
    ) {
      id
      name
      country
      state
      latitude
      longitude
      timezone
      population
    }
  }
`;
