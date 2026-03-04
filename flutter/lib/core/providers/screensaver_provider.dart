import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/screensaver_photo_service.dart';
import 'ramadan_provider.dart';

/// State for the screensaver photo slideshow.
class ScreensaverState {
  final bool isReady;
  final List<ScreensaverPhoto> photos;
  final int currentIndex;
  final File? currentFile;
  final File? nextFile;

  const ScreensaverState({
    this.isReady = false,
    this.photos = const [],
    this.currentIndex = 0,
    this.currentFile,
    this.nextFile,
  });

  ScreensaverPhoto? get currentPhoto =>
      photos.isNotEmpty ? photos[currentIndex % photos.length] : null;

  ScreensaverState copyWith({
    bool? isReady,
    List<ScreensaverPhoto>? photos,
    int? currentIndex,
    File? currentFile,
    File? nextFile,
  }) {
    return ScreensaverState(
      isReady: isReady ?? this.isReady,
      photos: photos ?? this.photos,
      currentIndex: currentIndex ?? this.currentIndex,
      currentFile: currentFile ?? this.currentFile,
      nextFile: nextFile ?? this.nextFile,
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

  /// Advance to the next photo in the shuffled sequence.
  Future<void> next() async {
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
