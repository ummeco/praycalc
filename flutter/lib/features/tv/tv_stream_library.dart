import 'dart:async';
import 'dart:io';

import 'package:flutter/foundation.dart';

enum TvStreamType { video, audio }

@immutable
class TvStream {
  final String id;
  final String name;
  final String url;
  final TvStreamType type;
  final String? thumbnailEmoji; // emoji fallback when no thumbnail URL
  final String category;

  /// True for streams added by the user via the custom URL dialog.
  final bool isCustom;

  /// Backup URLs tried in order when the primary [url] is unavailable.
  /// Each entry is a complete YouTube watch URL or direct stream URL.
  final List<String> fallbackUrls;

  const TvStream({
    required this.id,
    required this.name,
    required this.url,
    required this.type,
    this.thumbnailEmoji,
    required this.category,
    this.isCustom = false,
    this.fallbackUrls = const [],
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'url': url,
        'type': type.name,
        'thumbnailEmoji': thumbnailEmoji,
        'category': category,
        'isCustom': isCustom,
        'fallbackUrls': fallbackUrls,
      };

  factory TvStream.fromJson(Map<String, dynamic> j) => TvStream(
        id: j['id'] as String,
        name: j['name'] as String,
        url: j['url'] as String,
        type: TvStreamType.values.firstWhere(
          (e) => e.name == j['type'],
          orElse: () => TvStreamType.audio,
        ),
        thumbnailEmoji: j['thumbnailEmoji'] as String?,
        category: j['category'] as String? ?? 'custom',
        isCustom: j['isCustom'] as bool? ?? false,
        fallbackUrls: (j['fallbackUrls'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            const [],
      );

  /// All URLs in priority order: primary first, then fallbacks.
  List<String> get allUrls => [url, ...fallbackUrls];
}

// ---------------------------------------------------------------------------
// TvStreamHealthChecker
// ---------------------------------------------------------------------------

/// Periodically checks whether each stream URL responds successfully.
///
/// Results are cached in [_healthCache]. Use [isHealthy] to query the cached
/// state. Call [startMonitoring] once when the stream list is known, and
/// [dispose] when the player is torn down.
class TvStreamHealthChecker {
  static final Map<String, bool> _healthCache = {};
  static Timer? _timer;

  /// Performs a single HEAD request to [url] and returns true if the server
  /// responds with a status below 400 within 5 seconds.
  static Future<bool> checkStream(String url) async {
    try {
      final client = HttpClient();
      client.connectionTimeout = const Duration(seconds: 5);
      final req = await client.headUrl(Uri.parse(url));
      final res = await req.close();
      await res.drain<void>();
      return res.statusCode < 400;
    } catch (e) {
      debugPrint('[TvStreamLibrary] Health check failed for $url: $e');
      return false;
    }
  }

  /// Start a periodic 5-minute health check for all [streams].
  ///
  /// [onUpdate] is called with the stream id and its current health state
  /// after each check completes. An initial check is run immediately.
  static void startMonitoring(
    List<TvStream> streams,
    void Function(String id, bool ok) onUpdate,
  ) {
    _timer?.cancel();
    _doCheck(streams, onUpdate);
    _timer = Timer.periodic(
      const Duration(minutes: 5),
      (_) => _doCheck(streams, onUpdate),
    );
  }

  static void _doCheck(
    List<TvStream> streams,
    void Function(String id, bool ok) onUpdate,
  ) {
    for (final s in streams) {
      checkStream(s.url).then((ok) {
        _healthCache[s.id] = ok;
        onUpdate(s.id, ok);
      });
    }
  }

  /// Returns the cached health state for [id]. Defaults to true when unknown.
  static bool isHealthy(String id) => _healthCache[id] ?? true;

  /// Cancel the periodic check timer.
  static void dispose() => _timer?.cancel();
}

/// Built-in curated stream list.
/// HLS video streams play via HLS.js (no embedding restrictions, no YouTube).
/// Audio streams are direct HLS/MP3 endpoints playable via just_audio.
const List<TvStream> kBuiltInStreams = [
  TvStream(
    // Al Quran Al Kareem TV — Saudi state channel, 24/7 Quran from Mecca/Kaaba.
    // Akamai CDN HLS — stable, no embedding restrictions, works on Android TV.
    id: 'mecca',
    name: 'Mecca — Al Quran Al Kareem TV',
    url: 'https://cdn-globecast.akamaized.net/live/eds/saudi_quran/hls_roku/index.m3u8',
    type: TvStreamType.video,
    thumbnailEmoji: '🕋',
    category: 'masjid',
  ),
  TvStream(
    // Makkah TV — alternate HLS stream from Mecca.
    id: 'makkah-tv',
    name: 'Makkah TV — Live',
    url: 'https://media2.streambrothers.com:1936/8122/8122/playlist.m3u8',
    type: TvStreamType.video,
    thumbnailEmoji: '🕌',
    category: 'masjid',
  ),
  TvStream(
    id: 'medina',
    name: 'Medina — Al-Masjid An-Nabawi',
    url: 'https://www.youtube.com/watch?v=9A1S0xAPVIs',
    type: TvStreamType.video,
    thumbnailEmoji: '🕌',
    category: 'masjid',
  ),
  TvStream(
    id: 'aqsa',
    name: 'Al-Aqsa — Dome of the Rock view',
    url: 'https://www.youtube.com/watch?v=2lGCVF8CfeA',
    type: TvStreamType.video,
    thumbnailEmoji: '🏛️',
    category: 'masjid',
  ),
  TvStream(
    id: 'quran-mishary',
    name: 'Quran Radio — Mishary Al-Afasy',
    url: 'https://stream.radiojar.com/mishary-afasy',
    type: TvStreamType.audio,
    thumbnailEmoji: '📖',
    category: 'quran',
  ),
  TvStream(
    id: 'quran-sudais',
    name: 'Quran Radio — Sheikh Sudais',
    url: 'https://stream.radiojar.com/quran-sudais',
    type: TvStreamType.audio,
    thumbnailEmoji: '📿',
    category: 'quran',
  ),
  TvStream(
    id: 'quran-islamweb',
    name: 'IslamWeb Quran Radio',
    url: 'https://quranlive.islamweb.net:8000/quran128.mp3',
    type: TvStreamType.audio,
    thumbnailEmoji: '🎵',
    category: 'quran',
  ),
];
