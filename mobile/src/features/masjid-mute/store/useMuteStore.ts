/**
 * Purpose: Zustand v5 store for user-defined masjid/mute zones — PrayCalc has no
 *   masjid database (that is the future Ummat app), so the user manually adds their
 *   own geofenced zones (e.g. their local masjid) with a label, coordinates, and
 *   radius. Persisted via AsyncStorage, single source of truth for the geofencing
 *   registration effect (useGeofenceSync) and MasjidMuteScreen.
 * Inputs: Actions from MasjidMuteScreen (add/update/remove zone, toggle auto-mute).
 * Outputs: Zone state + CRUD actions + autoMuteEnabled flag + previousRingerMode
 *   (captured on zone ENTER so EXIT can restore the user's actual prior ringer
 *   state instead of always forcing 'normal').
 * Constraints: Independent of useSettingsStore (do not import/touch it — this
 *   feature owns its own persisted slice, per ticket boundary). Radius clamped to
 *   MIN/MAX_RADIUS_METERS. Zone ids are generated client-side (no backend).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-masjid-mute-store
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Radius clamp bounds in meters — small enough to not cover a whole neighborhood,
 *  large enough to cover a masjid's parking lot / adjacent building. */
export const MIN_RADIUS_METERS = 50;
export const MAX_RADIUS_METERS = 300;
export const DEFAULT_RADIUS_METERS = 100;

export interface MuteZone {
  id: string;
  label: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
}

/** Android ringer mode captured immediately before a zone-entry auto-mute, so
 *  zone-exit can restore the user's actual prior state (e.g. they were already on
 *  vibrate) instead of always forcing 'normal'. iOS never populates this — Apple
 *  does not allow programmatic ringer/mute-switch control (see MasjidMuteScreen). */
export type CapturedRingerMode = 'silent' | 'vibrate' | 'normal';

export interface MuteStoreState {
  zones: MuteZone[];
  autoMuteEnabled: boolean;
  /** Ids of zones the device is currently considered "inside" — drives restore-on-exit
   *  and lets the UI show which zone(s) are currently active. */
  activeZoneIds: string[];
  /** Ringer mode to restore once the LAST active zone is exited. Null when not muted. */
  previousRingerMode: CapturedRingerMode | null;

  addZone: (zone: Omit<MuteZone, 'id'>) => MuteZone;
  updateZone: (id: string, patch: Partial<Omit<MuteZone, 'id'>>) => void;
  removeZone: (id: string) => void;
  setAutoMuteEnabled: (enabled: boolean) => void;
  setActiveZoneIds: (ids: string[]) => void;
  setPreviousRingerMode: (mode: CapturedRingerMode | null) => void;
  reset: () => void;
}

/** Clamp a candidate radius into the supported range, rounding to whole meters. */
export function clampRadius(meters: number): number {
  return Math.max(MIN_RADIUS_METERS, Math.min(MAX_RADIUS_METERS, Math.round(meters)));
}

/** Client-side id generator — no backend, so this only needs to be unique within
 *  the local zones list, not globally. */
function generateZoneId(): string {
  return `zone_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

const initialState = {
  zones: [] as MuteZone[],
  autoMuteEnabled: true,
  activeZoneIds: [] as string[],
  previousRingerMode: null as CapturedRingerMode | null,
};

export const useMuteStore = create<MuteStoreState>()(
  persist(
    (set) => ({
      ...initialState,

      addZone: (zone) => {
        const newZone: MuteZone = {
          ...zone,
          id: generateZoneId(),
          radiusMeters: clampRadius(zone.radiusMeters),
        };
        set((s) => ({ zones: [...s.zones, newZone] }));
        return newZone;
      },

      updateZone: (id, patch) =>
        set((s) => ({
          zones: s.zones.map((z) =>
            z.id === id
              ? { ...z, ...patch, radiusMeters: clampRadius(patch.radiusMeters ?? z.radiusMeters) }
              : z,
          ),
        })),

      removeZone: (id) =>
        set((s) => ({
          zones: s.zones.filter((z) => z.id !== id),
          activeZoneIds: s.activeZoneIds.filter((zoneId) => zoneId !== id),
        })),

      setAutoMuteEnabled: (autoMuteEnabled) => set({ autoMuteEnabled }),

      setActiveZoneIds: (activeZoneIds) => set({ activeZoneIds }),

      setPreviousRingerMode: (previousRingerMode) => set({ previousRingerMode }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: 'praycalc-masjid-mute',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      // v0 (unversioned) persisted state is structurally compatible with v1 — this
      // is a pass-through placeholder so a future breaking shape change has a real
      // migration path instead of silently reading stale state after an app update.
      migrate: (persistedState) => persistedState as MuteStoreState,
      // Never persist transient runtime state — activeZoneIds/previousRingerMode
      // must always start fresh on app boot (a cold-started device is definitionally
      // not "inside" a zone from the OS's perspective until geofencing re-fires).
      partialize: (state) => ({
        zones: state.zones,
        autoMuteEnabled: state.autoMuteEnabled,
      }) as MuteStoreState,
    },
  ),
);
