/**
 * Purpose: Background geofence enforcement for masjid-mute. Defines the
 *   expo-task-manager task expo-location calls on region ENTER/EXIT, and exposes
 *   syncGeofences() to (re)register the user's zones whenever they change.
 * Inputs: useMuteStore (zones, autoMuteEnabled), expo-location geofencing events.
 * Outputs: registers GEOFENCE_TASK_NAME with TaskManager; syncGeofences(),
 *   requestGeofencePermissions(), stopAllGeofences().
 * Constraints:
 *   - Android: on ENTER, captures the current ringer mode into useMuteStore and
 *     sets vibrate; on EXIT (once no zones remain active), restores it.
 *   - iOS: Apple does not allow apps to change the mute switch/ringer volume, so
 *     ENTER instead fires a high-priority local notification asking the user to
 *     silence manually; EXIT is a no-op (nothing to restore).
 *   - Geofencing requires "Always" location permission (region monitoring must
 *     work while the app is backgrounded/killed) — requestGeofencePermissions()
 *     requests foreground first, then background, matching Android/iOS OS-level
 *     UX expectations (you cannot request background-only on either platform).
 *   - A geofence-callback failure must never crash the OS-owned background task —
 *     all branches are wrapped and swallow errors after best-effort logging.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-masjid-mute-geofence-task
 */

import { Platform } from 'react-native';
import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import * as Notifications from 'expo-notifications';
import { useMuteStore } from '../store/useMuteStore';
import { muteDevice, restoreDevice, getCurrentRingerMode } from './ringerControl';
import { t } from '../../../i18n';

export const GEOFENCE_TASK_NAME = 'MASJID_MUTE_GEOFENCE';

interface GeofenceTaskEventData {
  eventType: Location.GeofencingEventType;
  region: Location.LocationRegion;
}

/**
 * Fires a high-priority local notification reminding the user to silence their
 * phone — the iOS substitute for programmatic muting (Apple does not permit it).
 * Best-effort: a notification failure must not break geofence handling.
 */
async function notifyIOSReminder(zoneLabel: string): Promise<void> {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: t('screens.masjidMute.iosReminderTitle'),
        body: t('screens.masjidMute.iosReminderBody', { zone: zoneLabel }),
        sound: true,
        interruptionLevel: 'timeSensitive',
      },
      trigger: null, // fire immediately
    });
  } catch {
    // Best-effort only.
  }
}

TaskManager.defineTask(GEOFENCE_TASK_NAME, async ({ data, error }) => {
  if (error) return;
  const { eventType, region } = (data ?? {}) as GeofenceTaskEventData;
  if (!eventType || !region) return;

  const store = useMuteStore.getState();
  if (!store.autoMuteEnabled) return;

  const zone = store.zones.find((z) => z.id === region.identifier);
  const zoneLabel = zone?.label ?? t('screens.masjidMute.defaultZoneLabel');

  try {
    if (eventType === Location.GeofencingEventType.Enter) {
      const nextActive = Array.from(new Set([...store.activeZoneIds, region.identifier ?? '']));
      store.setActiveZoneIds(nextActive.filter(Boolean));

      if (Platform.OS === 'android') {
        // Only capture+mute on the FIRST zone entered — if already inside another
        // zone, previousRingerMode already holds the pre-masjid-mode state and
        // must not be overwritten with 'vibrate' from the first mute.
        if (store.previousRingerMode === null) {
          const { muted, previousMode } = await muteDevice();
          if (muted) store.setPreviousRingerMode(previousMode ?? (await getCurrentRingerMode()) ?? 'normal');
        }
      } else {
        await notifyIOSReminder(zoneLabel);
      }
    } else if (eventType === Location.GeofencingEventType.Exit) {
      const nextActive = store.activeZoneIds.filter((id) => id !== region.identifier);
      store.setActiveZoneIds(nextActive);

      // Only restore once the LAST active zone is exited — if still inside another
      // zone, stay muted.
      if (nextActive.length === 0 && Platform.OS === 'android' && store.previousRingerMode !== null) {
        await restoreDevice(store.previousRingerMode);
        store.setPreviousRingerMode(null);
      }
    }
  } catch {
    // Never let a geofence-handling failure crash the OS-owned background task.
  }
});

/** Requests foreground, then background ("Always") location permission — geofencing
 *  needs background access to fire while the app is not in the foreground. Returns
 *  true only if background permission was granted. */
export async function requestGeofencePermissions(): Promise<boolean> {
  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== 'granted') return false;
  const background = await Location.requestBackgroundPermissionsAsync();
  return background.status === 'granted';
}

/** Re-registers geofencing with the CURRENT zones from useMuteStore. Call after any
 *  zone add/update/remove, or the autoMuteEnabled toggle. Safe to call with zero
 *  zones (leaves geofencing stopped). */
export async function syncGeofences(): Promise<void> {
  const { zones, autoMuteEnabled } = useMuteStore.getState();

  if (!autoMuteEnabled || zones.length === 0) {
    await stopAllGeofences();
    return;
  }

  const regions: Location.LocationRegion[] = zones.map((zone) => ({
    identifier: zone.id,
    latitude: zone.latitude,
    longitude: zone.longitude,
    radius: zone.radiusMeters,
    notifyOnEnter: true,
    notifyOnExit: true,
  }));

  await Location.startGeofencingAsync(GEOFENCE_TASK_NAME, regions);
}

/** Stops geofence monitoring entirely (auto-mute disabled or no zones left). Also
 *  restores the ringer if the device is currently muted from a zone, so turning
 *  auto-mute off never leaves the phone stuck silent. */
export async function stopAllGeofences(): Promise<void> {
  const isRegistered = await TaskManager.isTaskRegisteredAsync(GEOFENCE_TASK_NAME).catch(() => false);
  if (isRegistered) {
    await Location.stopGeofencingAsync(GEOFENCE_TASK_NAME).catch(() => undefined);
  }

  const store = useMuteStore.getState();
  if (store.previousRingerMode !== null) {
    await restoreDevice(store.previousRingerMode);
    store.setPreviousRingerMode(null);
  }
  store.setActiveZoneIds([]);
}
