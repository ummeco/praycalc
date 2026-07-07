/**
 * Purpose: Background audio service for Adhan playback using react-native-track-player.
 * Inputs: AdhanVoice, PrayerName.
 * Outputs: play/pause/stop controls + lock-screen media controls.
 * Constraints: Requires react-native-track-player native plugin in app.json.
 *   Lock-screen controls via TrackPlayer.updateOptions.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-adhan-service
 */

import TrackPlayer, { Capability } from 'react-native-track-player';

let isSetUp = false;

/**
 * Initialize TrackPlayer once per app session.
 * Safe to call multiple times — noops after first call.
 */
export async function setupAdhanPlayer(): Promise<void> {
  if (isSetUp) return;
  await TrackPlayer.setupPlayer({
    maxCacheSize: 1024 * 10, // 10 MB
  });
  await TrackPlayer.updateOptions({
    capabilities: [Capability.Play, Capability.Pause, Capability.Stop],
    compactCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
    notificationCapabilities: [Capability.Play, Capability.Pause, Capability.Stop],
  });
  isSetUp = true;
}

interface PlayAdhanParams {
  audioUrl: string;
  prayerName: string;
  reciterName: string;
}

/**
 * Play an adhan audio track, stopping any currently-playing track first.
 */
export async function playAdhan({ audioUrl, prayerName, reciterName }: PlayAdhanParams): Promise<void> {
  if (!audioUrl.startsWith('https://')) {
    throw new Error('adhan audio must be https');
  }
  await setupAdhanPlayer();
  await TrackPlayer.reset();
  await TrackPlayer.add({
    url: audioUrl,
    title: `${prayerName} Adhan`,
    artist: reciterName,
    artwork: undefined,
  });
  await TrackPlayer.play();
}

/**
 * Pause currently-playing adhan.
 */
export async function pauseAdhan(): Promise<void> {
  await TrackPlayer.pause();
}

/**
 * Stop and clear the adhan queue.
 */
export async function stopAdhan(): Promise<void> {
  await TrackPlayer.stop();
  await TrackPlayer.reset();
}
