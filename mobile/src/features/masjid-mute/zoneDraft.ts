/**
 * Purpose: In-progress mute-zone form state (draft) shared between the add and
 *   edit flows in MasjidMuteScreen / ZoneFormScreen.
 * Inputs: MuteZone (existing zone, for edit) or nothing (for add).
 * Outputs: ZoneDraft type + emptyDraft()/draftFromZone() constructors.
 * Constraints: Lat/lng kept as strings (raw TextInput values) until save-time
 *   validation/parsing in handleSaveZone.
 */

import { DEFAULT_RADIUS_METERS, type MuteZone } from './store/useMuteStore';

/** In-progress zone form state (draft), used for both add and edit flows. */
export interface ZoneDraft {
  id: string | null; // null = new zone
  label: string;
  latitude: string;
  longitude: string;
  radiusMeters: number;
}

export function emptyDraft(): ZoneDraft {
  return { id: null, label: '', latitude: '', longitude: '', radiusMeters: DEFAULT_RADIUS_METERS };
}

export function draftFromZone(zone: MuteZone): ZoneDraft {
  return {
    id: zone.id,
    label: zone.label,
    latitude: String(zone.latitude),
    longitude: String(zone.longitude),
    radiusMeters: zone.radiusMeters,
  };
}
