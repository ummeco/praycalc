/**
 * Purpose: Keeps OS-level geofence registration in sync with useMuteStore — calls
 *   syncGeofences() whenever the zones list or autoMuteEnabled flag changes, so the
 *   MasjidMuteScreen (or app root) mounting this hook is the single place that
 *   drives (re)registration rather than every store action doing it inline.
 * Inputs: useMuteStore zones + autoMuteEnabled.
 * Outputs: side effect only (no return value) — registers/updates/stops geofences.
 * Constraints: Debounce-free (zone edits are infrequent, human-paced UI actions);
 *   swallows sync errors so a permission-denied state doesn't crash the screen —
 *   callers should check permission status separately before enabling.
 * SPORT: REGISTRY-HOOKS.md#praycalc-mobile-masjid-mute-use-geofence-sync
 */

import { useEffect } from 'react';
import { useMuteStore } from '../store/useMuteStore';
import { syncGeofences } from '../lib/geofenceTask';

export function useGeofenceSync(): void {
  const zones = useMuteStore((s) => s.zones);
  const autoMuteEnabled = useMuteStore((s) => s.autoMuteEnabled);

  useEffect(() => {
    void syncGeofences().catch(() => undefined);
    // Re-sync whenever the zone SET or the master toggle changes. Zone count is a
    // cheap, stable proxy for "the list changed" without deep-comparing objects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones.length, autoMuteEnabled, JSON.stringify(zones.map((z) => `${z.id}:${z.latitude}:${z.longitude}:${z.radiusMeters}`))]);
}
