import 'dart:convert';
import 'dart:io';
import 'dart:math' as math;

import 'package:flutter/foundation.dart' show debugPrint, kDebugMode, kIsWeb;
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;
import 'package:shared_preferences/shared_preferences.dart';

import '../services/screensaver_photo_service.dart';
import 'ramadan_provider.dart';
import 'tv_provider.dart';

// ── Smart server URL ──────────────────────────────────────────────────────────

String get _kSmartTvBase =>
    kDebugMode ? 'http://localhost:4010/api/v1/tv' : 'https://smart.praycalc.com/api/v1/tv';

// ── JWT helper ────────────────────────────────────────────────────────────────

String? _parseDeviceId(String token) {
  try {
    final parts = token.split('.');
    if (parts.length != 3) return null;
    final padding = '=' * ((4 - parts[1].length % 4) % 4);
    final payloadJson = utf8.decode(base64Url.decode(parts[1] + padding));
    final payload = jsonDecode(payloadJson) as Map<String, dynamic>;
    return payload['device_id'] as String?;
  } catch (e, st) {
    return null;
  }
}

/// State for the screensaver photo slideshow.
class ScreensaverState {
  final bool isReady;
  final List<ScreensaverPhoto> photos;
  final int currentIndex;
  final File? currentFile;
  final File? nextFile;
  // P-16: bundled wallpaper mode
  final List<File> bundledFiles;
  final int bundledIndex;

  const ScreensaverState({
    this.isReady = false,
    this.photos = const [],
    this.currentIndex = 0,
    this.currentFile,
    this.nextFile,
    this.bundledFiles = const [],
    this.bundledIndex = 0,
  });

  bool get isBundledMode => bundledFiles.isNotEmpty;

  ScreensaverPhoto? get currentPhoto =>
      photos.isNotEmpty ? photos[currentIndex % photos.length] : null;

  ScreensaverState copyWith({
    bool? isReady,
    List<ScreensaverPhoto>? photos,
    int? currentIndex,
    File? currentFile,
    File? nextFile,
    List<File>? bundledFiles,
    int? bundledIndex,
  }) {
    return ScreensaverState(
      isReady: isReady ?? this.isReady,
      photos: photos ?? this.photos,
      currentIndex: currentIndex ?? this.currentIndex,
      currentFile: currentFile ?? this.currentFile,
      nextFile: nextFile ?? this.nextFile,
      bundledFiles: bundledFiles ?? this.bundledFiles,
      bundledIndex: bundledIndex ?? this.bundledIndex,
    );
  }
}

/// Notifier managing the screensaver photo slideshow.
///
/// Initializes the photo service, fetches manifest from MinIO,
/// shuffles photos, and preloads the first few for smooth display.
class ScreensaverNotifier extends Notifier<ScreensaverState> {
  @override
  ScreensaverState build() {
    _init();
    return const ScreensaverState();
  }

  ScreensaverPhotoService get _service => ScreensaverPhotoService.instance;

  Future<void> _init() async {
    // File I/O is not available on Flutter web — skip silently.
    if (kIsWeb) {
      state = state.copyWith(isReady: true);
      return;
    }

    // P-16: Check if bundled wallpapers are enabled.
    final tvSettings = ref.read(tvSettingsProvider);
    if (tvSettings.useBundledWallpapers) {
      await _initBundled();
      return;
    }

    // MINIO-3: Check for user-uploaded photos (from Google Photos picker).
    // These take priority over curated MinIO photos.
    final prefs = await SharedPreferences.getInstance();
    final userKeys = prefs.getStringList('tv_minio_photo_keys') ?? [];
    if (userKeys.isNotEmpty) {
      await _initUserPhotos(userKeys, prefs);
      // If user photos loaded successfully, skip curated photos.
      if (state.isReady) return;
    }

    await _service.init();

    final ramadan = ref.read(ramadanProvider);
    final photos = _service.shuffled(isRamadan: ramadan.isRamadan);

    if (photos.isEmpty) return;

    // Preload first 3 photos.
    await _service.preload(
      isRamadan: ramadan.isRamadan,
      count: 3,
    );

    final firstFile = await _service.getPhotoFile(photos[0]);
    File? secondFile;
    if (photos.length > 1) {
      secondFile = await _service.getPhotoFile(photos[1]);
    }

    state = state.copyWith(
      isReady: true,
      photos: photos,
      currentIndex: 0,
      currentFile: firstFile,
      nextFile: secondFile,
    );
  }

  /// MINIO-3: Load user-uploaded photos from MinIO via smart server presigned URLs.
  ///
  /// Fetches presigned download URLs from `GET /api/v1/tv/{deviceId}/photos`,
  /// downloads each photo to local cache, and uses them as bundled-style files.
  Future<void> _initUserPhotos(List<String> keys, SharedPreferences prefs) async {
    final tvJwt = prefs.getString('tv_session_jwt');
    if (tvJwt == null) return;

    final deviceId = _parseDeviceId(tvJwt);
    if (deviceId == null) return;

    try {
      final response = await http.get(
        Uri.parse('$_kSmartTvBase/$deviceId/photos'),
        headers: {'Authorization': 'Bearer $tvJwt'},
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode != 200) return;

      final data = jsonDecode(response.body) as Map<String, dynamic>;
      final photos = (data['photos'] as List? ?? [])
          .cast<Map<String, dynamic>>();

      if (photos.isEmpty) return;

      final appDir = await getApplicationCacheDirectory();
      final cacheDir = Directory(p.join(appDir.path, 'user_photos'));
      await cacheDir.create(recursive: true);

      final files = <File>[];
      for (final photo in photos) {
        final downloadUrl = photo['downloadUrl'] as String?;
        final key = photo['key'] as String?;
        if (downloadUrl == null || key == null) continue;

        try {
          final filename = p.basename(key);
          final cacheFile = File(p.join(cacheDir.path, filename));

          if (!await cacheFile.exists()) {
            final photoResp = await http
                .get(Uri.parse(downloadUrl))
                .timeout(const Duration(seconds: 20));
            if (photoResp.statusCode == 200) {
              await cacheFile.writeAsBytes(photoResp.bodyBytes);
            }
          }

          if (await cacheFile.exists()) files.add(cacheFile);
        } catch (e, st) {
          if (kDebugMode) debugPrint('[Screensaver] Photo download failed: $e\n$st');
        }
      }

      if (files.isEmpty) return;

      // Shuffle for variety
      files.shuffle(math.Random());
      state = state.copyWith(
        isReady: true,
        bundledFiles: files,
        bundledIndex: 0,
        currentFile: files[0],
        nextFile: files.length > 1 ? files[1] : null,
      );
    } catch (e, st) {
      // Network failure — fall through to curated photos
    }
  }

  /// P-16: Initialize from bundled asset wallpapers.
  ///
  /// Loads each JPEG from assets/tv/wallpapers/ and copies to a temp file.
  /// Silently skips missing files (so manifest entries ship before real JPEGs).
  Future<void> _initBundled() async {
    const manifestAsset = 'assets/tv/wallpapers/manifest.json';
    try {
      final manifestData = await rootBundle.loadString(manifestAsset);
      final rng = math.Random();
      final entries = (List<Map<String, dynamic>>.from(
        jsonDecode(manifestData) as List,
      ))..shuffle(rng);

      final tmpDir = await getTemporaryDirectory();
      final files = <File>[];

      for (final entry in entries) {
        final assetPath = 'assets/tv/wallpapers/${entry['file']}';
        try {
          final data = await rootBundle.load(assetPath);
          final file = File('${tmpDir.path}/wallpaper_${entry['file']}');
          await file.writeAsBytes(data.buffer.asUint8List(), flush: true);
          files.add(file);
        } catch (e, st) {
          // Asset not bundled yet — skip gracefully.
        }
      }

      if (files.isEmpty) {
        // No bundled JPEGs available — fall through to MinIO.
        await _service.init();
        return;
      }

      state = state.copyWith(
        isReady: true,
        bundledFiles: files,
        bundledIndex: 0,
        currentFile: files[0],
        nextFile: files.length > 1 ? files[1] : null,
      );
    } catch (e, st) {
      // Manifest missing — fall through to MinIO.
      await _service.init();
    }
  }

  /// Advance to the next photo in the shuffled sequence.
  Future<void> next() async {
    // P-16: bundled mode cycling
    if (state.isBundledMode) {
      final nextIdx = (state.bundledIndex + 1) % state.bundledFiles.length;
      final afterIdx = (nextIdx + 1) % state.bundledFiles.length;
      state = state.copyWith(
        bundledIndex: nextIdx,
        currentFile: state.bundledFiles[nextIdx],
        nextFile: state.bundledFiles[afterIdx],
      );
      return;
    }

    if (state.photos.isEmpty) return;

    final nextIndex = (state.currentIndex + 1) % state.photos.length;

    // The "next" file was already preloaded — promote it to current.
    final newCurrent = state.nextFile;

    // Start preloading the one after that.
    final preloadIndex = (nextIndex + 1) % state.photos.length;
    final preloadFile =
        await _service.getPhotoFile(state.photos[preloadIndex]);

    state = state.copyWith(
      currentIndex: nextIndex,
      currentFile: newCurrent,
      nextFile: preloadFile,
    );
  }

  /// Reshuffle with a specific category filter.
  Future<void> filterByCategory(PhotoCategory category) async {
    final ramadan = ref.read(ramadanProvider);
    final photos = _service.shuffled(
      isRamadan: ramadan.isRamadan,
      category: category,
    );

    if (photos.isEmpty) {
      state = const ScreensaverState(isReady: true);
      return;
    }

    final firstFile = await _service.getPhotoFile(photos[0]);
    File? secondFile;
    if (photos.length > 1) {
      secondFile = await _service.getPhotoFile(photos[1]);
    }

    state = state.copyWith(
      photos: photos,
      currentIndex: 0,
      currentFile: firstFile,
      nextFile: secondFile,
    );
  }

  /// Clear cache and re-fetch manifest.
  Future<void> refresh() async {
    await _service.clearCache();
    state = const ScreensaverState();
    await _init();
  }
}

/// Provider for screensaver photo slideshow state.
final screensaverProvider =
    NotifierProvider<ScreensaverNotifier, ScreensaverState>(
  ScreensaverNotifier.new,
);
