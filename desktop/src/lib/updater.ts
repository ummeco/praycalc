/**
 * Purpose: Seamless background auto-update — check GitHub Releases (via the
 *   `latest.json` manifest published to the `desktop-latest` rolling tag),
 *   silently DOWNLOAD (never auto-install) any newer signed build, and hand
 *   back a `ready` flag so the UI can offer a one-click restart. Install only
 *   happens when the user clicks that restart — never automatically — because
 *   an automatic `downloadAndInstall()` on Windows kills the running app
 *   mid-use as soon as the installer runs (UPD-2). Never throws: a missing/
 *   offline update endpoint (e.g. dev builds, or before the first
 *   `desktop-latest` tag ships a manifest) must never crash or block the app.
 * Inputs: none (reads the `plugin.updater` config baked into tauri.conf.json).
 * Outputs: `checkForUpdate()` resolves an `UpdateOutcome`; `installUpdateAndRelaunch()`
 *   installs the already-downloaded update and restarts into it.
 * Constraints: all plugin calls are wrapped in try/catch — network errors,
 *   missing endpoints, and signature failures all degrade to `{ status: 'none' }`
 *   rather than surfacing to the user as an error state. A downloaded-but-not-
 *   yet-installed update is held in module state (`pendingUpdate`) so a
 *   later hourly poll (UPD-3) short-circuits instead of re-downloading.
 * SPORT: praycalc desktop — seamless auto-update.
 */
import { check, type Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { invoke } from '@tauri-apps/api/core';

export type UpdateOutcome =
  | { status: 'none' }
  | { status: 'ready'; version: string };

/** The most recently downloaded-and-ready-to-install update, if any. Holding
 * the actual `Update` resource (not just its version string) is what lets
 * `installUpdateAndRelaunch` call `.install()` on it later without a second
 * network round-trip. */
let pendingUpdate: Update | null = null;

/**
 * Checks for a newer signed release and, if found, downloads it in the
 * background — but never installs it (see module doc for why). Returns
 * `{ status: 'ready' }` once the download has finished and only a
 * user-initiated install+relaunch is needed to apply it.
 *
 * If an update was already downloaded by a previous call and is still
 * waiting for the user to click "Restart", this short-circuits and returns
 * that same `ready` result immediately rather than re-checking/re-downloading
 * (UPD-3) — otherwise the hourly poll in `useUpdater` would re-download the
 * same update indefinitely until the user acts on it.
 */
export async function checkForUpdate(): Promise<UpdateOutcome> {
  if (pendingUpdate) {
    return { status: 'ready', version: pendingUpdate.version };
  }
  try {
    const update = await check();
    if (!update?.available) return { status: 'none' };

    await update.download();
    pendingUpdate = update;
    return { status: 'ready', version: update.version };
  } catch {
    // No endpoint reachable, no release published yet, dev build, offline, etc.
    // Auto-update is a nice-to-have — never let it disrupt the app.
    return { status: 'none' };
  }
}

/**
 * Installs the already-downloaded update and restarts into it. User-initiated
 * only (the "Restart" banner button) — never called from the background poll.
 * On Windows the installer replaces the running executable as part of
 * `install()` itself, which terminates/restarts the app on its own; calling
 * `relaunch()` afterward there would race an already-exiting process, so it's
 * skipped there and only run on macOS/Linux (UPD-2).
 */
export async function installUpdateAndRelaunch(): Promise<void> {
  const update = pendingUpdate;
  if (!update) return;
  try {
    await update.install();
    const platform = await invoke<string>('get_platform').catch(() => '');
    if (platform !== 'windows') {
      await relaunch();
    }
  } catch {
    // Best-effort — if install/relaunch fails the user can still quit/reopen manually.
  } finally {
    pendingUpdate = null;
  }
}
