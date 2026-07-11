/**
 * Purpose: GraphQL query/mutation strings + row typing for the "My TVs" manager screen.
 * Inputs: none (static query/mutation strings)
 * Outputs: GET_TV_SETTINGS, UPDATE_TV_SETTINGS, DELETE_TV_SETTINGS, StreamSource,
 *   TvSettingsRow
 * Constraints: Column set MUST mirror pc_tv_settings' live schema (see
 *   lib/pairing/pairingMutation.ts header for the value contract on the deep-settings
 *   columns: countdown_takeover_enabled/countdown_minutes, iqama_enabled/iqama_offsets,
 *   name_only_enabled/name_only_minutes, calc_method, madhab, time_format).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-tv-manager-queries
 */

import type { IqamaOffsets, TvMadhab, TvTimeFormat, TvLayout, TvTheme } from '../../lib/pairing/pairingMutation';

export const GET_TV_SETTINGS = `
  query GetTvSettings {
    pc_tv_settings(order_by: { created_at: asc }) {
      id
      device_id
      name
      accent_color
      stream_source
      rotate_minutes
      show_weather
      latitude
      longitude
      city
      timezone
      countdown_takeover_enabled
      countdown_minutes
      iqama_enabled
      iqama_offsets
      name_only_enabled
      name_only_minutes
      calc_method
      madhab
      time_format
      layout
      theme
      created_at
      updated_at
    }
  }
`;

export const UPDATE_TV_SETTINGS = `
  mutation UpdateTvSettings($id: uuid!, $changes: pc_tv_settings_set_input!) {
    update_pc_tv_settings_by_pk(pk_columns: { id: $id }, _set: $changes) {
      id
    }
  }
`;

export const DELETE_TV_SETTINGS = `
  mutation DeleteTvSettings($id: uuid!) {
    delete_pc_tv_settings_by_pk(id: $id) {
      id
    }
  }
`;

export type StreamSource = 'makkah-tv' | 'saudi-quran' | 'medina';

export interface TvSettingsRow {
  id: string;
  device_id: string;
  name: string;
  accent_color: string;
  stream_source: StreamSource;
  rotate_minutes: number;
  show_weather: boolean;
  latitude: number | null;
  longitude: number | null;
  city: string | null;
  timezone: string | null;
  countdown_takeover_enabled: boolean;
  countdown_minutes: number;
  iqama_enabled: boolean;
  iqama_offsets: IqamaOffsets;
  name_only_enabled: boolean;
  name_only_minutes: number;
  calc_method: string;
  madhab: TvMadhab;
  time_format: TvTimeFormat;
  layout: TvLayout;
  theme: TvTheme;
  created_at: string;
  updated_at: string;
}
