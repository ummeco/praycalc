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

export const GET_HADITH_OF_DAY = `
  query GetTvHadithOfDay($offset: Int!) {
    pc_hadith(limit: 1, offset: $offset) {
      id
      text_ar
      text_en
      source
      narrator
      grading
    }
  }
`;

export const GET_DUA_LIST = `
  query GetTvDuaList($limit: Int!, $offset: Int!) {
    pc_dua(limit: $limit, offset: $offset, order_by: { sort_order: asc }) {
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

export const GET_ISLAMIC_EVENTS = `
  query GetIslamicEvents($from_date: date!, $to_date: date!) {
    pc_islamic_event(
      where: { gregorian_date: { _gte: $from_date, _lte: $to_date } }
      order_by: { gregorian_date: asc }
    ) {
      id
      name_ar
      name_en
      hijri_date
      gregorian_date
      is_significant
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
 * TV cosmetic settings sync (public role). Selected by device_id — the same persisted
 * TV device id used for pairing. Columns are the four cosmetic fields the dashboard
 * consumes; the phone/backend writes them, the TV only reads. When no row exists the
 * caller falls back to store defaults.
 */
export const GET_TV_SETTINGS = `
  query GetTvSettings($deviceId: String!) {
    pc_tv_settings(where: { device_id: { _eq: $deviceId } }, limit: 1) {
      accent_color
      stream_source
      rotate_minutes
      show_weather
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
