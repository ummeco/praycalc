/**
 * Purpose: Built-in TV video stream library — ported verbatim from the already-shipped
 *   flutter/lib/features/tv/tv_stream_library.dart (kBuiltInStreams). Same ids, names,
 *   and URLs so the TV app reuses the exact curated, embedding-safe stream set.
 * Inputs: none (static list) + a lookup helper by id.
 * Outputs: TvStream[] and getStreamById().
 * Constraints: HLS (.m3u8) streams play directly via react-native-video. The 'medina'
 *   entry is a YouTube watch URL — react-native-video CANNOT play YouTube directly, so
 *   the Display pane shows a labeled fallback card for it (v1) instead of attempting
 *   playback (react-native-webview is NOT a dependency, so no embed path). NO fabricated
 *   sources — only the three ids the product spec names are exposed here.
 * SPORT: praycalc/tv lib/streams
 */

export type TvStreamKind = 'hls' | 'youtube';

export interface TvStream {
  /** Stable id used by the stream_source setting. */
  id: string;
  /** Human-readable label shown in the Display pane header. */
  name: string;
  /** Stream URL (HLS .m3u8 for kind 'hls', YouTube watch URL for kind 'youtube'). */
  url: string;
  /** Playback kind — 'hls' plays via react-native-video, 'youtube' shows a fallback card. */
  kind: TvStreamKind;
  /** Emoji shown on the fallback/label card. */
  emoji: string;
}

/**
 * Curated built-in streams — the three ids the product spec names, reused exactly from
 * flutter/lib/features/tv/tv_stream_library.dart (kBuiltInStreams). 'makkah-tv' is the
 * default. 'medina' is a YouTube URL and is intentionally kind 'youtube' (fallback card).
 */
export const BUILT_IN_STREAMS: TvStream[] = [
  {
    id: 'saudi-quran',
    name: 'Mecca — Al Quran Al Kareem TV',
    url: 'https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8',
    kind: 'hls',
    emoji: '🕋',
  },
  {
    id: 'makkah-tv',
    name: 'Makkah TV — Live',
    url: 'https://media2.streambrothers.com:1936/8122/8122/playlist.m3u8',
    kind: 'hls',
    emoji: '🕌',
  },
  {
    id: 'medina',
    name: 'Medina — Al-Masjid An-Nabawi',
    // YouTube watch URL — react-native-video cannot play this; Display pane shows a
    // labeled fallback card ("Live stream available on YouTube") for v1.
    url: 'https://www.youtube.com/watch?v=9A1S0xAPVIs',
    kind: 'youtube',
    emoji: '🕌',
  },
];

/** Sentinel id meaning "no stream — show the content rotation full-pane". */
export const STREAM_NONE = 'none';

/** Default stream id per the product spec. */
export const DEFAULT_STREAM_ID = 'makkah-tv';

/** Returns the stream for [id], or undefined when [id] is unknown/`none`. */
export function getStreamById(id: string): TvStream | undefined {
  return BUILT_IN_STREAMS.find((s) => s.id === id);
}
