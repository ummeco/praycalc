/**
 * Purpose: LEFT dashboard pane (~2/3). Shows a live video stream (react-native-video)
 *   with a rotating Islamic-content overlay; degrades to full-pane content rotation when
 *   the stream is off, errors, or is a YouTube-only source that RN video cannot play.
 * Inputs: streamSource id (from settings), rotateMinutes.
 * Outputs: the Display pane view.
 * Constraints:
 *   - HLS (.m3u8) streams play via react-native-video (native module — required lazily so
 *     tsc/jest don't need the native binary; on-device only).
 *   - 'medina' is a YouTube URL: RN video cannot play YouTube directly and
 *     react-native-webview is NOT a dependency, so v1 shows a labeled fallback card
 *     ("Live stream available on YouTube") + content rotation full-pane.
 *   - On stream error → fall back to full-pane content rotation (no black screen).
 * SPORT: praycalc/tv components/dashboard
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import ContentRotation from './ContentRotation';
import { getStreamById, STREAM_NONE } from '../../lib/streams/streamLibrary';

interface DisplayPaneProps {
  streamSource: string;
  rotateMinutes: number;
}

/**
 * Lazily resolve react-native-video's default export. Returns null when the native
 * module is unavailable (test env / not yet linked) so the pane falls back gracefully
 * to full-pane content rotation instead of crashing.
 */
function loadVideoComponent(): React.ComponentType<Record<string, unknown>> | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = require('react-native-video');
    return (mod?.default ?? mod) as React.ComponentType<Record<string, unknown>>;
  } catch {
    return null;
  }
}

export default function DisplayPane({
  streamSource,
  rotateMinutes,
}: DisplayPaneProps): React.JSX.Element {
  const [streamFailed, setStreamFailed] = useState(false);

  const stream =
    streamSource === STREAM_NONE ? undefined : getStreamById(streamSource);

  // Playable = an HLS stream that hasn't errored. YouTube + unknown + 'none' are not.
  const isPlayableHls = !!stream && stream.kind === 'hls' && !streamFailed;
  const VideoComponent = isPlayableHls ? loadVideoComponent() : null;
  const canRenderVideo = isPlayableHls && VideoComponent !== null;

  return (
    <View style={styles.root}>
      {canRenderVideo && stream && VideoComponent ? (
        <>
          <VideoComponent
            source={{ uri: stream.url }}
            style={StyleSheet.absoluteFillObject}
            resizeMode="cover"
            repeat
            muted={false}
            playInBackground={false}
            onError={() => setStreamFailed(true)}
            accessibilityLabel={`Live stream: ${stream.name}`}
          />
          {/* Content rotation as a translucent overlay atop the video. */}
          <ContentRotation rotateMinutes={rotateMinutes} overlay />
        </>
      ) : (
        <>
          {/* YouTube-only source (e.g. medina): labeled fallback card. */}
          {stream && stream.kind === 'youtube' ? (
            <View style={styles.youtubeCard}>
              <Text style={styles.youtubeEmoji}>{stream.emoji}</Text>
              <Text style={styles.youtubeName}>{stream.name}</Text>
              <Text style={styles.youtubeNote}>Live stream available on YouTube</Text>
            </View>
          ) : null}
          {/* Full-pane content rotation (stream off / errored / not playable). */}
          <ContentRotation rotateMinutes={rotateMinutes} overlay={false} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0D2F17',
    overflow: 'hidden',
  },
  youtubeCard: {
    position: 'absolute',
    top: 40,
    left: 40,
    right: 40,
    backgroundColor: 'rgba(30, 94, 47, 0.9)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#79C24C',
    padding: 28,
    alignItems: 'center',
    zIndex: 2,
  },
  youtubeEmoji: { fontSize: 48, marginBottom: 8 },
  youtubeName: {
    color: '#C9F27A',
    fontSize: 32,
    fontWeight: '700',
    textAlign: 'center',
  },
  youtubeNote: {
    color: '#FFFFFF',
    fontSize: 26,
    marginTop: 8,
    textAlign: 'center',
  },
});
