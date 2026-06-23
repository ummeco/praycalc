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
    }
  }
`;

export const GET_QIBLA_BEARING = `
  query GetQiblaBearing($city: String!) {
    pc_city(where: { name: { _eq: $city } }, limit: 1) {
      qibla_bearing
      latitude
      longitude
    }
  }
`;

export const GET_CITY_LIST = `
  query GetCityList($search: String!, $limit: Int!) {
    pc_city(
      where: { name: { _ilike: $search } }
      order_by: { name: asc }
      limit: $limit
    ) {
      id
      name
      country
      latitude
      longitude
      timezone
    }
  }
`;
