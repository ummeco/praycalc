import 'dart:convert';
import 'dart:io';
import 'dart:math';

import 'package:http/http.dart' as http;
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

/// Storage base URL injected at build time via --dart-define.
///
/// Production: `https://storage.ummat.dev`
/// Local dev:  `http://127.0.0.1:9000`
const _kStorageBaseUrl = String.fromEnvironment(
  'STORAGE_BASE_URL',
  defaultValue: 'http://127.0.0.1:9000',
);

const _kBucket = 'praycalc-screensaver';
const _kManifestPath = '$_kBucket/manifest.json';

/// Photo category for filtering.
enum PhotoCategory {
  all('All'),
  masjidExterior('Masjids'),
  masjidInterior('Interiors'),
  geometric('Geometric'),
  calligraphy('Calligraphy'),
  landscape('Landscapes'),
  ramadan('Ramadan');

  final String label;
  const PhotoCategory(this.label);

  /// Match category string from manifest JSON.
  static PhotoCategory fromString(String s) {
    switch (s) {
      case 'masjid-exterior':
        return PhotoCategory.masjidExterior;
      case 'masjid-interior':
        return PhotoCategory.masjidInterior;
      case 'geometric':
        return PhotoCategory.geometric;
      case 'calligraphy':
        return PhotoCategory.calligraphy;
      case 'landscape':
        return PhotoCategory.landscape;
      case 'ramadan':
        return PhotoCategory.ramadan;
      default:
        return PhotoCategory.all;
    }
  }
}

/// A screensaver photo entry with metadata.
class ScreensaverPhoto {
  final String fileName;
  final String pack; // 'general' or 'ramadan'
  final PhotoCategory category;
  final String description;

  const ScreensaverPhoto({
    required this.fileName,
    required this.pack,
    required this.category,
    required this.description,
  });

  /// Remote URL for this photo on MinIO storage.
  String get remoteUrl => '$_kStorageBaseUrl/$_kBucket/$pack/$fileName';

  factory ScreensaverPhoto.fromJson(Map<String, dynamic> json, String pack) {
    return ScreensaverPhoto(
      fileName: json['file'] as String,
      pack: pack,
      category: PhotoCategory.fromString(json['category'] as String),
      description: json['description'] as String,
    );
  }
}

/// Photo manifest fetched from MinIO.
class PhotoManifest {
  final int version;
  final DateTime updatedAt;
  final List<ScreensaverPhoto> generalPhotos;
  final List<ScreensaverPhoto> ramadanPhotos;

  const PhotoManifest({
    required this.version,
    required this.updatedAt,
    required this.generalPhotos,
    required this.ramadanPhotos,
  });

  List<ScreensaverPhoto> get allPhotos => [...generalPhotos, ...ramadanPhotos];

  factory PhotoManifest.fromJson(Map<String, dynamic> json) {
    final general = (json['general'] as List<dynamic>)
        .map((e) =>
            ScreensaverPhoto.fromJson(e as Map<String, dynamic>, 'general'))
        .toList();
    final ramadan = (json['ramadan'] as List<dynamic>)
        .map((e) =>
            ScreensaverPhoto.fromJson(e as Map<String, dynamic>, 'ramadan'))
        .toList();
    return PhotoManifest(
      version: json['version'] as int? ?? 1,
      updatedAt: DateTime.tryParse(json['updatedAt'] as String? ?? '') ??
          DateTime.now(),
      generalPhotos: general,
      ramadanPhotos: ramadan,
    );
  }
}

/// Service managing the screensaver photo library.
///
/// Fetches a manifest from MinIO, downloads photos to local cache,
/// and serves them for the ambient screensaver.
class ScreensaverPhotoService {
  ScreensaverPhotoService._();
  static final instance = ScreensaverPhotoService._();

  final _random = Random();
  PhotoManifest? _manifest;
  String? _cacheDir;
  bool _initialized = false;

  /// Whether the service has been initialized and has photos.
  bool get isReady => _initialized && _manifest != null;

  /// The current manifest.
  PhotoManifest? get manifest => _manifest;

  /// Initialize: fetch manifest and ensure cache directory exists.
  Future<void> init() async {
    if (_initialized) return;

    final appDir = await getApplicationCacheDirectory();
    _cacheDir = p.join(appDir.path, 'screensaver_photos');
    await Directory(_cacheDir!).create(recursive: true);

    await refreshManifest();
    _initialized = true;
  }

  /// Fetch the latest manifest from MinIO.
  Future<void> refreshManifest() async {
    try {
      final uri = Uri.parse('$_kStorageBaseUrl/$_kManifestPath');
      final response = await http.get(uri).timeout(
        const Duration(seconds: 10),
      );
      if (response.statusCode == 200) {
        _manifest = PhotoManifest.fromJson(
          jsonDecode(response.body) as Map<String, dynamic>,
        );
      }
    } catch (_) {
      // Use cached manifest if network fails.
      await _loadCachedManifest();
    }

    // Persist manifest locally for offline use.
    if (_manifest != null && _cacheDir != null) {
      try {
        final file = File(p.join(_cacheDir!, 'manifest.json'));
        await file.writeAsString(jsonEncode({
          'version': _manifest!.version,
          'updatedAt': _manifest!.updatedAt.toIso8601String(),
          'general': _manifest!.generalPhotos
              .map((ph) => {
                    'file': ph.fileName,
                    'category': ph.category == PhotoCategory.masjidExterior
                        ? 'masjid-exterior'
                        : ph.category == PhotoCategory.masjidInterior
                            ? 'masjid-interior'
                            : ph.category.name,
                    'description': ph.description,
                  })
              .toList(),
          'ramadan': _manifest!.ramadanPhotos
              .map((ph) => {
                    'file': ph.fileName,
                    'category': 'ramadan',
                    'description': ph.description,
                  })
              .toList(),
        }));
      } catch (_) {
        // Non-critical: cache write failure.
      }
    }
  }

  Future<void> _loadCachedManifest() async {
    if (_cacheDir == null) return;
    try {
      final file = File(p.join(_cacheDir!, 'manifest.json'));
      if (await file.exists()) {
        final json = jsonDecode(await file.readAsString());
        _manifest = PhotoManifest.fromJson(json as Map<String, dynamic>);
      }
    } catch (_) {
      // No cached manifest available.
    }
  }

  /// Get the local file path for a photo, downloading if needed.
  ///
  /// Returns null if the photo cannot be loaded.
  Future<File?> getPhotoFile(ScreensaverPhoto photo) async {
    if (_cacheDir == null) return null;

    final localPath = p.join(_cacheDir!, photo.pack, photo.fileName);
    final file = File(localPath);

    if (await file.exists()) return file;

    // Download from MinIO.
    try {
      await Directory(p.dirname(localPath)).create(recursive: true);
      final response = await http.get(Uri.parse(photo.remoteUrl)).timeout(
        const Duration(seconds: 30),
      );
      if (response.statusCode == 200 && response.bodyBytes.length > 1000) {
        await file.writeAsBytes(response.bodyBytes);
        return file;
      }
    } catch (_) {
      // Download failed.
    }
    return null;
  }

  /// Get photos for the current context.
  ///
  /// During Ramadan, returns Ramadan photos mixed with general.
  /// Otherwise returns general photos only.
  /// Optionally filter by [category].
  List<ScreensaverPhoto> getPhotos({
    bool isRamadan = false,
    PhotoCategory category = PhotoCategory.all,
  }) {
    if (_manifest == null) return [];

    List<ScreensaverPhoto> pool;

    if (isRamadan) {
      pool = [..._manifest!.ramadanPhotos, ..._manifest!.generalPhotos];
    } else if (category == PhotoCategory.ramadan) {
      pool = _manifest!.ramadanPhotos;
    } else {
      pool = _manifest!.generalPhotos;
    }

    if (category != PhotoCategory.all && category != PhotoCategory.ramadan) {
      pool = pool.where((p) => p.category == category).toList();
    }

    return pool;
  }

  /// Get a shuffled sequence of photos (no repeats until exhausted).
  List<ScreensaverPhoto> shuffled({
    bool isRamadan = false,
    PhotoCategory category = PhotoCategory.all,
  }) {
    final pool = List<ScreensaverPhoto>.from(
      getPhotos(isRamadan: isRamadan, category: category),
    );
    pool.shuffle(_random);
    return pool;
  }

  /// Preload the first N photos into cache for smooth initial display.
  Future<int> preload({
    bool isRamadan = false,
    PhotoCategory category = PhotoCategory.all,
    int count = 5,
  }) async {
    final photos = getPhotos(isRamadan: isRamadan, category: category);
    int loaded = 0;
    for (int i = 0; i < photos.length && loaded < count; i++) {
      final file = await getPhotoFile(photos[i]);
      if (file != null) loaded++;
    }
    return loaded;
  }

  /// Clear the local photo cache.
  Future<void> clearCache() async {
    if (_cacheDir == null) return;
    final dir = Directory(_cacheDir!);
    if (await dir.exists()) {
      await dir.delete(recursive: true);
      await dir.create(recursive: true);
    }
  }

  /// Total photo count.
  int get generalCount => _manifest?.generalPhotos.length ?? 0;
  int get ramadanCount => _manifest?.ramadanPhotos.length ?? 0;
  int get totalCount => generalCount + ramadanCount;
}
