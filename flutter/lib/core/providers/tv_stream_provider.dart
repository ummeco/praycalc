import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/tv_stream_health_service.dart';
import 'tv_provider.dart';

// ---------------------------------------------------------------------------
// streamHealthProvider (TV2-3.3)
// ---------------------------------------------------------------------------

/// Provides the live [StreamHealthStatus] for the currently selected stream
/// URL.
///
/// Emits [StreamHealthStatus.unknown] as the initial value, then fires the
/// first real check almost immediately. Subsequent checks happen every 5
/// minutes automatically via [TvStreamHealthService.startPeriodicCheck].
///
/// When the selected stream URL changes (e.g. user picks a different stream),
/// the provider is rebuilt and monitoring restarts for the new URL.
final streamHealthProvider =
    StreamProvider.autoDispose<StreamHealthStatus>((ref) {
  final tvSettings = ref.watch(tvSettingsProvider);

  // Resolve the active stream URL: prefer the selected built-in stream id,
  // but fall back to any user-defined custom stream URL.
  String url = '';
  if (tvSettings.tvAudioMode == 'stream') {
    // Check custom streams first.
    final custom = tvSettings.customStreams
        .where((s) => s.id == tvSettings.selectedStreamId)
        .firstOrNull;
    if (custom != null) {
      url = custom.url;
    }
    // Built-in stream URLs are resolved elsewhere (tv_stream_library.dart).
    // We store the raw ID here; if no custom match, leave url empty so the
    // health checker returns unknown (built-in streams are always healthy
    // until an offline event is detected by TvStreamPlayer itself).
  }

  final service = TvStreamHealthService();
  service.startPeriodicCheck(url);

  ref.onDispose(service.dispose);

  return service.statusStream;
});
