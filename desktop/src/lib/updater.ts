/**
 * Purpose: Seamless background auto-update — check GitHub Releases (via the
 *   `latest.json` manifest tauri-action publishes), silently download+install
 *   any newer signed build, and hand back a `ready` flag so the UI can offer a
 *   one-click restart. Never throws: a missing/offline update endpoint (e.g.
 *   dev builds, or before the first `desktop-v*` tag ships an updater
 *   manifest) must never crash or block the app.
 * Inputs: none (reads the `plugin.updater` config baked into tauri.conf.json).
 * Outputs: `checkForUpdate()` resolves an `UpdateOutcome`; `relaunchApp()`
 *   restarts into the newly-installed version.
 * Constraints: all plugin calls are wrapped in try/catch — network errors,
 *   missing endpoints, and signature failures all degrade to `{ status: 'none' }`
 *   rather than surfacing to the user as an error state.
 * SPORT: praycalc desktop — seamless auto-update.
 */
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export type UpdateOutcome =
  | { status: 'none' }
  | { status: 'ready'; version: string };

/**
 * Checks for a newer signed release and, if one exists, downloads and
 * installs it in the background. Returns `{ status: 'ready' }` once the
 * install has completed and only a relaunch is needed to apply it.
 */
export async function checkForUpdate(): Promise<UpdateOutcome> {
  try {
    const update = await check();
    if (!update?.available) return { status: 'none' };

    await update.downloadAndInstall();
    return { status: 'ready', version: update.version };
  } catch {
    // No endpoint reachable, no release published yet, dev build, offline, etc.
    // Auto-update is a nice-to-have — never let it disrupt the app.
    return { status: 'none' };
  }
}

/** Restarts the app to apply an already-installed update. */
export async function relaunchApp(): Promise<void> {
  try {
    await relaunch();
  } catch {
    // Best-effort — if relaunch fails the user can still quit/reopen manually.
  }
}
