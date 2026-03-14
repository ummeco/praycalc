import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:http/http.dart' as http;

import '../../core/theme/app_theme.dart';
import '../../core/services/tv_quran_service.dart';
import 'tv_reciter_selector.dart';
import 'tv_sky_background.dart';

// ---------------------------------------------------------------------------
// Route path
// ---------------------------------------------------------------------------

/// Route path for go_router: `/tv/quran-player`
///
/// Accept optional `extra` map with:
///   - `surah` (int)
///   - `ayah` (int)
///   - `reciterId` (String)
///   - `backgroundMode` (String): `'gradient'` | `'geometric'` | `'artSlideshow'`
const kTvQuranPlayerRoute = '/tv/quran-player';

// ---------------------------------------------------------------------------
// Background mode enum
// ---------------------------------------------------------------------------

enum TvQuranBackgroundMode { gradient, geometric, artSlideshow }

TvQuranBackgroundMode _parseBackgroundMode(String? raw) {
  switch (raw) {
    case 'geometric':
      return TvQuranBackgroundMode.geometric;
    case 'artSlideshow':
      return TvQuranBackgroundMode.artSlideshow;
    default:
      return TvQuranBackgroundMode.gradient;
  }
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

class TvQuranPlayerScreen extends StatefulWidget {
  const TvQuranPlayerScreen({
    super.key,
    this.initialSurah = 1,
    this.initialAyah = 1,
    this.reciterId = 'sudais',
    this.backgroundMode = 'gradient',
  });

  final int initialSurah;
  final int initialAyah;
  final String reciterId;
  final String backgroundMode;

  @override
  State<TvQuranPlayerScreen> createState() => _TvQuranPlayerScreenState();
}

class _TvQuranPlayerScreenState extends State<TvQuranPlayerScreen>
    with SingleTickerProviderStateMixin {
  // ── Service reference ────────────────────────────────────────────────────
  final _svc = TvQuranService.instance;

  // ── Stream subscription ──────────────────────────────────────────────────
  StreamSubscription<QuranPlaybackState>? _sub;

  // ── Current display state ────────────────────────────────────────────────
  QuranPlaybackState? _state;

  // ── Verse text cache  key: "surah:ayah" ─────────────────────────────────
  final Map<String, Map<String, String>> _verseCache = {};

  // ── Current verse text (shown on screen) ─────────────────────────────────
  String _arabic = '';
  String _english = '';
  bool _verseLoading = false;

  // ── Crossfade animation ──────────────────────────────────────────────────
  late final AnimationController _fadeCtrl;
  late final Animation<double> _fadeAnim;

  // ── Overlay flag ─────────────────────────────────────────────────────────
  bool _showReciterOverlay = false;

  // ── HUD (controls hint, bottom-right, auto-hides after 3s) ───────────────
  bool _hudVisible = false;
  Timer? _hudTimer;

  // ── Focus node ───────────────────────────────────────────────────────────
  final FocusNode _focusNode = FocusNode();

  @override
  void initState() {
    super.initState();

    _fadeCtrl = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
      value: 1.0,
    );
    _fadeAnim = CurvedAnimation(parent: _fadeCtrl, curve: Curves.easeInOut);

    _sub = _svc.playbackStream.listen(_onPlaybackState);

    // Start playback
    final reciter = kQuranReciters.firstWhere(
      (r) => r.id == widget.reciterId,
      orElse: () => kQuranReciters.first,
    );
    _svc.startPlayback(
      surah: widget.initialSurah,
      ayah: widget.initialAyah,
      reciter: reciter,
    );
  }

  @override
  void dispose() {
    _sub?.cancel();
    _fadeCtrl.dispose();
    _focusNode.dispose();
    _hudTimer?.cancel();
    super.dispose();
  }

  // ── HUD ──────────────────────────────────────────────────────────────────

  void _showHud() {
    _hudTimer?.cancel();
    if (!_hudVisible) setState(() => _hudVisible = true);
    _hudTimer = Timer(const Duration(seconds: 3), () {
      if (mounted) setState(() => _hudVisible = false);
    });
  }

  // ── Playback stream handler ──────────────────────────────────────────────

  void _onPlaybackState(QuranPlaybackState state) {
    if (!mounted) return;
    final prev = _state;

    setState(() => _state = state);

    // Only refetch verse text when the surah/ayah changes.
    if (prev == null ||
        prev.surah != state.surah ||
        prev.ayah != state.ayah) {
      _crossfadeToVerse(state.surah, state.ayah);
    }
  }

  // ── Verse text fetch ─────────────────────────────────────────────────────

  Future<void> _crossfadeToVerse(int surah, int ayah) async {
    // Fade out.
    await _fadeCtrl.animateTo(0.0);

    final key = '$surah:$ayah';
    if (_verseCache.containsKey(key)) {
      _applyVerse(_verseCache[key]!);
    } else {
      if (mounted) setState(() => _verseLoading = true);
      final texts = await _fetchVerse(surah, ayah);
      _verseCache[key] = texts;
      if (mounted) setState(() => _verseLoading = false);
      _applyVerse(texts);
    }

    // Fade back in.
    if (mounted) await _fadeCtrl.animateTo(1.0);
  }

  void _applyVerse(Map<String, String> texts) {
    if (!mounted) return;
    setState(() {
      _arabic = texts['arabic'] ?? '-';
      _english = texts['english'] ?? '';
    });
  }

  Future<Map<String, String>> _fetchVerse(int surah, int ayah) async {
    try {
      final uri = Uri.parse(
        'https://api.alquran.cloud/v1/ayah/$surah:$ayah'
        '/editions/quran-simple,en.transliteration,en.sahih',
      );
      final response = await http.get(uri).timeout(const Duration(seconds: 8));
      if (response.statusCode != 200) return _fallback();

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final data = body['data'] as List<dynamic>?;
      if (data == null || data.isEmpty) return _fallback();

      final arabicEntry = data[0] as Map<String, dynamic>?;
      // Prefer sahih (index 2) over transliteration (index 1).
      final englishEntry = (data.length > 2 ? data[2] : data.length > 1 ? data[1] : null)
          as Map<String, dynamic>?;

      return {
        'arabic': (arabicEntry?['text'] as String?) ?? '-',
        'english': (englishEntry?['text'] as String?) ?? '',
      };
    } catch (e, st) {
      return _fallback();
    }
  }

  Map<String, String> _fallback() => {'arabic': '-', 'english': ''};

  // ── D-pad key handling ───────────────────────────────────────────────────

  KeyEventResult _handleKeyEvent(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent) return KeyEventResult.ignored;

    _showHud();

    final key = event.logicalKey;

    if (key == LogicalKeyboardKey.arrowLeft) {
      _svc.prevVerse();
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.arrowRight) {
      _svc.nextVerse();
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.arrowUp) {
      _svc.nextSurah();
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.arrowDown) {
      _svc.prevSurah();
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.select ||
        key == LogicalKeyboardKey.enter ||
        key == LogicalKeyboardKey.mediaPlayPause) {
      _svc.togglePlayPause();
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.goBack ||
        key == LogicalKeyboardKey.escape ||
        key == LogicalKeyboardKey.browserBack) {
      _svc.stopGapless();
      Navigator.of(context).pop();
      return KeyEventResult.handled;
    }

    return KeyEventResult.ignored;
  }

  void _onLongPressOk() {
    setState(() => _showReciterOverlay = !_showReciterOverlay);
  }

  // ── Build ────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final bgMode = _parseBackgroundMode(widget.backgroundMode);
    final state = _state;

    return PopScope(
      onPopInvokedWithResult: (didPop, _) {
        if (didPop) _svc.stopGapless();
      },
      child: Scaffold(
        backgroundColor: PrayCalcColors.deep,
        body: Focus(
          focusNode: _focusNode,
          autofocus: true,
          onKeyEvent: _handleKeyEvent,
          child: GestureDetector(
            onLongPress: _onLongPressOk,
            child: Stack(
              children: [
                // Background layer
                Positioned.fill(child: _buildBackground(bgMode)),

                // Main content
                Positioned.fill(child: _buildContent(state)),

                // Surah announcement overlay
                if (state?.isSurahAnnouncement == true)
                  Positioned.fill(
                    child: _TvQuranSurahAnnouncementCard(
                      surahName: state!.announcementSurahName ?? '',
                      countdown: state.announcementCountdown ?? 5,
                    ),
                  ),

                // Reciter selector overlay
                if (_showReciterOverlay)
                  Positioned.fill(
                    child: _buildReciterOverlay(),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildBackground(TvQuranBackgroundMode mode) {
    switch (mode) {
      case TvQuranBackgroundMode.gradient:
        return Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [PrayCalcColors.deep, Color(0xFF071A0D)],
            ),
          ),
        );
      case TvQuranBackgroundMode.geometric:
        return Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [Color(0xFF0D2F17), Color(0xFF050F08)],
            ),
          ),
          child: const _GeometricPattern(),
        );
      case TvQuranBackgroundMode.artSlideshow:
        // Falls back to sky background — art slideshow requires asset bundles
        // that are loaded separately; TvSkyBackground gives a living feel.
        return TvSkyBackground(
          hour: DateTime.now().hour.toDouble(),
          child: const SizedBox.expand(),
        );
    }
  }

  Widget _buildContent(QuranPlaybackState? state) {
    return SafeArea(
      child: Column(
        children: [
          const SizedBox(height: 24),

          // Reference pill
          _buildReferencePill(state),

          const SizedBox(height: 16),

          // Arabic text — 60% of remaining height
          Expanded(
            flex: 6,
            child: Center(
              child: _verseLoading
                  ? const CircularProgressIndicator(
                      valueColor: AlwaysStoppedAnimation(PrayCalcColors.mid),
                    )
                  : FadeTransition(
                      opacity: _fadeAnim,
                      child: Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 64),
                        child: Text(
                          _arabic,
                          textDirection: TextDirection.rtl,
                          textAlign: TextAlign.center,
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 72,
                            fontFamily: 'Amiri',
                            height: 1.7,
                          ),
                        ),
                      ),
                    ),
            ),
          ),

          // English text — 30% of remaining height
          Expanded(
            flex: 3,
            child: FadeTransition(
              opacity: _fadeAnim,
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 80),
                child: Text(
                  _english,
                  textAlign: TextAlign.center,
                  maxLines: 4,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.white.withAlpha(204), // 80% opacity
                    fontSize: 24,
                    height: 1.5,
                  ),
                ),
              ),
            ),
          ),

          const SizedBox(height: 32),
        ],
      ),
    );
  }

  Widget _buildReferencePill(QuranPlaybackState? state) {
    final surah = state?.surah ?? widget.initialSurah;
    final ayah = state?.ayah ?? widget.initialAyah;
    final name = _surahName(surah);

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
      decoration: BoxDecoration(
        border: Border.all(color: PrayCalcColors.mid.withAlpha(100)),
        borderRadius: BorderRadius.circular(20),
        color: PrayCalcColors.deep.withAlpha(180),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            'Surah $name',
            style: const TextStyle(
              color: PrayCalcColors.light,
              fontSize: 16,
              letterSpacing: 0.5,
            ),
          ),
          const Text(
            '  ·  ',
            style: TextStyle(color: PrayCalcColors.mid, fontSize: 16),
          ),
          Text(
            '$surah:$ayah',
            style: const TextStyle(
              color: Colors.white70,
              fontSize: 16,
            ),
          ),
          if (state?.isPlaying == false) ...[
            const SizedBox(width: 10),
            const Icon(Icons.pause_rounded,
                size: 16, color: PrayCalcColors.mid),
          ],
        ],
      ),
    );
  }

  Widget _buildReciterOverlay() {
    return GestureDetector(
      onTap: () => setState(() => _showReciterOverlay = false),
      child: Container(
        color: Colors.black54,
        child: Center(
          child: Container(
            width: 440,
            padding: const EdgeInsets.all(32),
            decoration: BoxDecoration(
              color: PrayCalcColors.deep,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: PrayCalcColors.dark),
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Select Reciter',
                  style: TextStyle(
                    color: PrayCalcColors.light,
                    fontSize: 22,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 20),
                TvReciterSelector(
                  selectedId: _svc.reciter.id,
                  onSelected: (reciter) {
                    _svc.setReciter(reciter);
                    setState(() => _showReciterOverlay = false);
                    // Restart playback with new reciter at current position
                    if (_state != null) {
                      _svc.startPlayback(
                        surah: _state!.surah,
                        ayah: _state!.ayah,
                        reciter: reciter,
                      );
                    }
                  },
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Surah names helper (114 entries, mirrors tv_quran_display.dart)
// ---------------------------------------------------------------------------

String _surahName(int surah) {
  const names = [
    'Al-Fatihah', 'Al-Baqarah', "Ali 'Imran", "An-Nisa'", "Al-Ma'idah",
    "Al-An'am", "Al-A'raf", 'Al-Anfal', 'At-Tawbah', 'Yunus',
    'Hud', 'Yusuf', "Ar-Ra'd", 'Ibrahim', 'Al-Hijr',
    'An-Nahl', 'Al-Isra', 'Al-Kahf', 'Maryam', 'Ta-Ha',
    "Al-Anbiya'", 'Al-Hajj', "Al-Mu'minun", 'An-Nur', 'Al-Furqan',
    "Ash-Shu'ara'", 'An-Naml', 'Al-Qasas', "Al-'Ankabut", 'Ar-Rum',
    'Luqman', 'As-Sajdah', 'Al-Ahzab', 'Saba', 'Fatir',
    'Ya-Sin', 'As-Saffat', 'Sad', 'Az-Zumar', 'Ghafir',
    'Fussilat', 'Ash-Shura', 'Az-Zukhruf', 'Ad-Dukhan', 'Al-Jathiyah',
    'Al-Ahqaf', 'Muhammad', 'Al-Fath', 'Al-Hujurat', 'Qaf',
    'Adh-Dhariyat', 'At-Tur', 'An-Najm', 'Al-Qamar', 'Ar-Rahman',
    "Al-Waqi'ah", 'Al-Hadid', 'Al-Mujadila', 'Al-Hashr', 'Al-Mumtahanah',
    'As-Saf', "Al-Jumu'ah", 'Al-Munafiqun', 'At-Taghabun', 'At-Talaq',
    'At-Tahrim', 'Al-Mulk', 'Al-Qalam', 'Al-Haqqah', "Al-Ma'arij",
    'Nuh', 'Al-Jinn', 'Al-Muzzammil', 'Al-Muddaththir', 'Al-Qiyamah',
    'Al-Insan', 'Al-Mursalat', "An-Naba'", "An-Nazi'at", "'Abasa",
    'At-Takwir', 'Al-Infitar', 'Al-Mutaffifin', 'Al-Inshiqaq', 'Al-Buruj',
    'At-Tariq', "Al-A'la", 'Al-Ghashiyah', 'Al-Fajr', 'Al-Balad',
    'Ash-Shams', 'Al-Layl', 'Ad-Duha', 'Ash-Sharh', 'At-Tin',
    "Al-'Alaq", 'Al-Qadr', 'Al-Bayyinah', 'Az-Zalzalah', "Al-'Adiyat",
    "Al-Qari'ah", 'At-Takathur', "Al-'Asr", 'Al-Humazah', 'Al-Fil',
    'Quraysh', "Al-Ma'un", 'Al-Kawthar', 'Al-Kafirun', 'An-Nasr',
    'Al-Masad', 'Al-Ikhlas', 'Al-Falaq', 'An-Nas',
  ];
  final idx = surah - 1;
  if (idx >= 0 && idx < names.length) return names[idx];
  return 'Surah $surah';
}

// ---------------------------------------------------------------------------
// Surah announcement card
// ---------------------------------------------------------------------------

class _TvQuranSurahAnnouncementCard extends StatelessWidget {
  const _TvQuranSurahAnnouncementCard({
    required this.surahName,
    required this.countdown,
  });

  final String surahName;
  final int countdown;

  @override
  Widget build(BuildContext context) {
    return Container(
      color: Colors.black.withAlpha(178), // 70% opacity dimmer
      child: Center(
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 56, vertical: 40),
          decoration: BoxDecoration(
            color: PrayCalcColors.deep,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: PrayCalcColors.mid.withAlpha(120),
              width: 1.5,
            ),
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Next',
                style: TextStyle(
                  color: PrayCalcColors.mid,
                  fontSize: 18,
                  letterSpacing: 2,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                surahName,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 36,
                  fontWeight: FontWeight.w600,
                ),
              ),
              const SizedBox(height: 24),
              // Countdown circle
              Container(
                width: 56,
                height: 56,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                      color: PrayCalcColors.mid.withAlpha(180), width: 2),
                ),
                child: Center(
                  child: Text(
                    '$countdown',
                    style: const TextStyle(
                      color: PrayCalcColors.light,
                      fontSize: 26,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Geometric pattern background (used for 'geometric' mode)
// ---------------------------------------------------------------------------

class _GeometricPattern extends StatelessWidget {
  const _GeometricPattern();

  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      painter: _GeometricPatternPainter(),
      child: const SizedBox.expand(),
    );
  }
}

class _GeometricPatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = PrayCalcColors.dark.withAlpha(40)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1.0;

    const spacing = 80.0;
    // Draw a simple diagonal grid of diamonds for a subtle Islamic geometric feel.
    for (double x = -spacing; x < size.width + spacing; x += spacing) {
      for (double y = -spacing; y < size.height + spacing; y += spacing) {
        final path = Path()
          ..moveTo(x, y - spacing / 2)
          ..lineTo(x + spacing / 2, y)
          ..lineTo(x, y + spacing / 2)
          ..lineTo(x - spacing / 2, y)
          ..close();
        canvas.drawPath(path, paint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
