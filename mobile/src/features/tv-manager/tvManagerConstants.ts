/**
 * Purpose: Static option lists, numeric clamps, and i18n label-key maps for the "My
 *   TVs" manager screen (basic + deep-settings fields).
 * Inputs: none (static data)
 * Outputs: ACCENT_SWATCHES, STREAM_SOURCES, numeric MIN/MAX clamps, IQAMA_PRAYERS,
 *   MADHAB_OPTIONS, TIME_FORMAT_OPTIONS, and the *_LABEL_KEYS maps used to resolve
 *   i18n keys per option value.
 * Constraints: Keep in sync with pc_tv_settings' live column value contract — see
 *   lib/pairing/pairingMutation.ts header (madhab is 'shafii'|'hanafi', time_format is
 *   '12h'|'24h', iqama_offsets has no sunrise key).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-tv-manager-constants
 */

import type { IqamaOffsets, TvMadhab, TvTimeFormat } from '../../lib/pairing/pairingMutation';
import type { StreamSource } from './tvManagerQueries';

export const ACCENT_SWATCHES = ['#79C24C', '#C9F27A', '#4A9FD8', '#D8A24A', '#B981D9', '#FFFFFF'];
export const STREAM_SOURCES: StreamSource[] = ['makkah-tv', 'saudi-quran', 'medina'];

export const MIN_ROTATE_MINUTES = 1;
export const MAX_ROTATE_MINUTES = 30;
export const MIN_TAKEOVER_MINUTES = 1;
export const MAX_TAKEOVER_MINUTES = 60;
export const MIN_IQAMA_OFFSET = 0;
export const MAX_IQAMA_OFFSET = 60;
export const MIN_NAME_ONLY_MINUTES = 1;
export const MAX_NAME_ONLY_MINUTES = 60;

export const IQAMA_PRAYERS: (keyof IqamaOffsets)[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
export const MADHAB_OPTIONS: TvMadhab[] = ['shafii', 'hanafi'];
export const TIME_FORMAT_OPTIONS: TvTimeFormat[] = ['12h', '24h'];

export const STREAM_LABEL_KEYS: Record<StreamSource, string> = {
  'makkah-tv': 'screens.tvManager.streamMakkah',
  'saudi-quran': 'screens.tvManager.streamSaudiQuran',
  medina: 'screens.tvManager.streamMedina',
};

export const IQAMA_PRAYER_LABEL_KEYS: Record<keyof IqamaOffsets, string> = {
  fajr: 'screens.tvManager.prayerFajr',
  dhuhr: 'screens.tvManager.prayerDhuhr',
  asr: 'screens.tvManager.prayerAsr',
  maghrib: 'screens.tvManager.prayerMaghrib',
  isha: 'screens.tvManager.prayerIsha',
};

export const MADHAB_LABEL_KEYS: Record<TvMadhab, string> = {
  shafii: 'screens.tvManager.madhabShafii',
  hanafi: 'screens.tvManager.madhabHanafi',
};

export const TIME_FORMAT_LABEL_KEYS: Record<TvTimeFormat, string> = {
  '12h': 'screens.tvManager.timeFormat12h',
  '24h': 'screens.tvManager.timeFormat24h',
};
