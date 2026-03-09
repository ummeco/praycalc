import 'dart:async';
import 'dart:io';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';
import 'package:wakelock_plus/wakelock_plus.dart';

import '../../core/providers/prayer_provider.dart';
import '../../core/providers/ramadan_provider.dart';
import '../../core/providers/screensaver_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/providers/tv_provider.dart';
import '../../core/theme/app_theme.dart';
import '../../shared/models/moon_phase.dart';

// ─── Calligraphy content ─────────────────────────────────────────────────────

class _CalligraphyEntry {
  final String arabic;
  final String transliteration;
  final String translation;
  final String source;

  const _CalligraphyEntry({
    required this.arabic,
    required this.transliteration,
    required this.translation,
    required this.source,
  });
}

const _kCalligraphyPhrases = [
  _CalligraphyEntry(
    arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
    transliteration: 'Bismillāhi r-raḥmāni r-raḥīm',
    translation: 'In the name of Allah, the Most Gracious, the Most Merciful',
    source: 'Quran 1:1',
  ),
  _CalligraphyEntry(
    arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
    transliteration: "Al-ḥamdu lillāhi rabbi l-'ālamīn",
    translation: 'All praise is due to Allah, Lord of all worlds',
    source: 'Quran 1:2',
  ),
  _CalligraphyEntry(
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'Subḥāna llāhi wa bi-ḥamdih',
    translation: 'Glory be to Allah and all praise is due to Him',
    source: 'Bukhari 6405',
  ),
  _CalligraphyEntry(
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    transliteration: 'Lā ilāha illā llāh',
    translation: 'There is no god worthy of worship but Allah',
    source: 'Bukhari 6403',
  ),
  _CalligraphyEntry(
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allāhu akbar',
    translation: 'Allah is the Greatest',
    source: 'Agreed upon',
  ),
  _CalligraphyEntry(
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'Lā ḥawla wa lā quwwata illā billāh',
    translation: 'There is no power nor strength except through Allah',
    source: 'Bukhari 6384',
  ),
  _CalligraphyEntry(
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    transliteration: "Ḥasbunā llāhu wa ni'ma l-wakīl",
    translation: 'Allah is sufficient for us and He is the best disposer of affairs',
    source: 'Quran 3:173',
  ),
  _CalligraphyEntry(
    arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
    transliteration: "Inna ma'a l-'usri yusrā",
    translation: 'Verily with hardship comes ease',
    source: 'Quran 94:6',
  ),
  _CalligraphyEntry(
    arabic: 'اللَّهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ',
    transliteration: 'Allāhumma ṣalli ʿalā Muḥammad',
    translation: 'O Allah, send blessings upon Muhammad ﷺ',
    source: 'Agreed upon',
  ),
  _CalligraphyEntry(
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً',
    transliteration: "Rabbanā ātinā fi d-dunyā ḥasanatan wa fi l-ākhirati ḥasanatan",
    translation: 'Our Lord, give us good in this world and good in the Hereafter',
    source: 'Quran 2:201',
  ),
  _CalligraphyEntry(
    arabic: 'اسْتَغْفِرِ اللَّهَ وَتُبْ إِلَيْهِ',
    transliteration: 'Istaghfiri llāha wa tub ilayh',
    translation: 'Seek forgiveness from Allah and repent to Him',
    source: 'Quran 11:90',
  ),
  _CalligraphyEntry(
    arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغِيثُ',
    transliteration: 'Yā ḥayyu yā qayyūmu bi-raḥmatika astaghīth',
    translation: 'O Living, O Self-Sustaining, by Your mercy I seek help',
    source: 'Tirmidhi 3524',
  ),
  _CalligraphyEntry(
    arabic: 'وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ',
    transliteration: "Wa 'alā llāhi falyatawakkali l-mu'minūn",
    translation: 'And upon Allah let the believers rely',
    source: 'Quran 3:122',
  ),
  _CalligraphyEntry(
    arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
    transliteration: "Inna llāha ma'a ṣ-ṣābirīn",
    translation: 'Indeed Allah is with those who are patient',
    source: 'Quran 2:153',
  ),
  _CalligraphyEntry(
    arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',
    transliteration: 'Wa man yattaqi llāha yajʿal lahu makhrajā',
    translation: 'And whoever fears Allah, He will make a way out for him',
    source: 'Quran 65:2',
  ),
  _CalligraphyEntry(
    arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي',
    transliteration: 'Rabbi shraḥ lī ṣadrī',
    translation: 'My Lord, expand for me my chest',
    source: 'Quran 20:25',
  ),
  _CalligraphyEntry(
    arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا',
    transliteration: 'Rabbanā lā tuzigh qulūbanā baʿda idh hadaytanā',
    translation: 'Our Lord, do not let our hearts deviate after You have guided us',
    source: 'Quran 3:8',
  ),
  _CalligraphyEntry(
    arabic: 'وَهُوَ الْغَفُورُ الْوَدُودُ',
    transliteration: 'Wa huwa l-ghafūru l-wadūd',
    translation: 'And He is the Forgiving, the Affectionate',
    source: 'Quran 85:14',
  ),
  _CalligraphyEntry(
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ',
    transliteration: "Allāhumma innī as'aluka l-'afwa wa l-'āfiyah",
    translation: 'O Allah, I ask You for pardon and well-being',
    source: 'Ibn Majah 3849',
  ),
  _CalligraphyEntry(
    arabic: 'إِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ',
    transliteration: 'Inna llāha lā yuḍīʿu ajra l-muḥsinīn',
    translation: 'Indeed Allah does not allow the reward of the doers of good to be lost',
    source: 'Quran 9:120',
  ),
];

// ─── Star data for starfield mode ────────────────────────────────────────────

class _StarData {
  final double x; // normalized 0.0–1.0
  final double y; // normalized 0.0–1.0
  final double size; // 1.0–4.0
  final double baseAlpha; // 0.3–1.0
  final double twinklePhase; // 0.0–2π
  final double twinkleSpeed; // 0.5–2.0
  final double parallaxDepth; // 0.0–1.0 (0=far, 1=near)

  const _StarData({
    required this.x,
    required this.y,
    required this.size,
    required this.baseAlpha,
    required this.twinklePhase,
    required this.twinkleSpeed,
    required this.parallaxDepth,
  });
}

// ─── Shooting star data ──────────────────────────────────────────────────────

class _ShootingStarData {
  final double startX; // normalized
  final double startY;
  final double endX;
  final double endY;

  const _ShootingStarData({
    required this.startX,
    required this.startY,
    required this.endX,
    required this.endY,
  });
}

/// Ambient / screensaver mode for TV.
///
/// Shows current time, next prayer countdown, Qibla direction, and moon phase
/// over full-screen photos from MinIO storage (with crossfade transitions) or
/// an Islamic geometric pattern fallback. Text drifts slowly for OLED burn-in
/// prevention. Wakes on any remote button press.
///
/// New modes (P-15): 'starfield' (300 stars, parallax, shooting star) and
/// 'calligraphy' (20 Arabic phrases, Amiri font, 60s rotation).
class TvAmbientScreen extends ConsumerStatefulWidget {
  const TvAmbientScreen({super.key});

  @override
  ConsumerState<TvAmbientScreen> createState() => _TvAmbientScreenState();
}

class _TvAmbientScreenState extends ConsumerState<TvAmbientScreen>
    with TickerProviderStateMixin {
  late Timer _ticker;
  late AnimationController _patternController;
  late AnimationController _crossfadeController;
  // P-15: starfield controllers
  late AnimationController _twinkleController;
  late AnimationController _shootingStarController;
  List<_StarData> _stars = [];
  _ShootingStarData? _shootingStar;
  Timer? _shootingStarTimer;
  // P-15: calligraphy controllers
  late AnimationController _calligraphyFadeController;
  int _calligraphyIdx = 0;
  Timer? _calligraphyTimer;

  final _focusNode = FocusNode();
  DateTime _now = DateTime.now();
  Timer? _photoTimer;

  // Drift offsets for burn-in prevention (pixels from center).
  double _driftX = 0;
  double _driftY = 0;
  static const _maxDrift = 150.0; // max px from center
  static const _driftCycleSec = 1800.0; // 30 min full cycle

  @override
  void initState() {
    super.initState();
    WakelockPlus.enable();

    _patternController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 120),
    )..repeat();

    _crossfadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
    );

    // P-15: starfield — twinkle loop + shooting star
    _twinkleController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 4),
    )..repeat();

    _shootingStarController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    );
    _shootingStarController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        setState(() => _shootingStar = null);
      }
    });

    // P-15: calligraphy — fade controller
    _calligraphyFadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..forward();

    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() {
        _now = DateTime.now();
        _updateDrift();
      });
    });

    // Start photo rotation timer after first frame.
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _startPhotoRotation();
      _generateStars();
      _startShootingStarTimer();
      _startCalligraphyTimer();
    });
  }

  void _generateStars() {
    final rng = math.Random();
    _stars = List.generate(300, (_) => _StarData(
      x: rng.nextDouble(),
      y: rng.nextDouble(),
      size: 1.0 + rng.nextDouble() * 3.0,
      baseAlpha: 0.3 + rng.nextDouble() * 0.7,
      twinklePhase: rng.nextDouble() * 2 * math.pi,
      twinkleSpeed: 0.5 + rng.nextDouble() * 1.5,
      parallaxDepth: rng.nextDouble(),
    ));
    setState(() {});
  }

  void _startShootingStarTimer() {
    _shootingStarTimer?.cancel();
    _shootingStarTimer = Timer.periodic(
      Duration(seconds: 20 + math.Random().nextInt(20)),
      (_) {
        if (!mounted) return;
        final rng = math.Random();
        final startX = rng.nextDouble() * 0.5;
        final startY = rng.nextDouble() * 0.4;
        setState(() {
          _shootingStar = _ShootingStarData(
            startX: startX,
            startY: startY,
            endX: startX + 0.2 + rng.nextDouble() * 0.3,
            endY: startY + 0.1 + rng.nextDouble() * 0.2,
          );
        });
        _shootingStarController.forward(from: 0);
        // Reset timer with new random interval
        _startShootingStarTimer();
      },
    );
  }

  void _startCalligraphyTimer() {
    _calligraphyTimer?.cancel();
    _calligraphyTimer = Timer.periodic(const Duration(seconds: 60), (_) {
      if (!mounted) return;
      _calligraphyFadeController.reverse().then((_) {
        if (!mounted) return;
        setState(() {
          _calligraphyIdx =
              (_calligraphyIdx + 1) % _kCalligraphyPhrases.length;
        });
        _calligraphyFadeController.forward();
      });
    });
  }

  void _startPhotoRotation() {
    final tvSettings = ref.read(tvSettingsProvider);
    final intervalSec = tvSettings.ambientIntervalSeconds;

    _photoTimer?.cancel();
    _photoTimer = Timer.periodic(Duration(seconds: intervalSec), (_) async {
      final mode = ref.read(tvSettingsProvider).screensaverMode;
      if (mode == 'pattern') return;

      // Advance to next photo.
      await ref.read(screensaverProvider.notifier).next();

      // Trigger crossfade animation.
      _crossfadeController.forward(from: 0);
    });
  }

  void _updateDrift() {
    // Sinusoidal drift over 30 minutes.
    final elapsed = _now.millisecondsSinceEpoch / 1000.0;
    final phase = (elapsed % _driftCycleSec) / _driftCycleSec * 2 * math.pi;
    _driftX = math.sin(phase) * _maxDrift;
    _driftY = math.cos(phase * 0.7) * _maxDrift * 0.6;
  }

  @override
  void dispose() {
    _ticker.cancel();
    _photoTimer?.cancel();
    _shootingStarTimer?.cancel();
    _calligraphyTimer?.cancel();
    _focusNode.dispose();
    _patternController.dispose();
    _crossfadeController.dispose();
    _twinkleController.dispose();
    _shootingStarController.dispose();
    _calligraphyFadeController.dispose();
    WakelockPlus.disable();
    super.dispose();
  }

  double get _nowH =>
      _now.hour + _now.minute / 60.0 + _now.second / 3600.0;

  @override
  Widget build(BuildContext context) {
    final settings = ref.watch(settingsProvider);
    final tvSettings = ref.watch(tvSettingsProvider);
    final timesAsync = ref.watch(prayerTimesProvider);
    final city = ref.watch(cityProvider);
    final moonResult = MoonPhase.calculate(_now);
    final ssState = ref.watch(screensaverProvider);
    final ramadan = ref.watch(ramadanProvider);
    final screensaverMode = tvSettings.screensaverMode;

    final showPhotos = screensaverMode == 'photo' &&
        ssState.isReady &&
        ssState.currentFile != null;
    final isStarfield = screensaverMode == 'starfield';
    final isCalligraphy = screensaverMode == 'calligraphy';

    return Scaffold(
      backgroundColor: Colors.black,
      body: KeyboardListener(
        focusNode: _focusNode,
        autofocus: true,
        onKeyEvent: (event) {
          if (event is KeyDownEvent) {
            context.pop();
          }
        },
        child: GestureDetector(
          behavior: HitTestBehavior.opaque,
          onTap: () => context.pop(),
          child: Stack(
            children: [
              // ── Background ──
              if (showPhotos)
                _PhotoBackground(
                  currentFile: ssState.currentFile!,
                  crossfadeAnimation: _crossfadeController,
                )
              else if (isStarfield)
                Positioned.fill(
                  child: AnimatedBuilder(
                    animation: _twinkleController,
                    builder: (context, child) {
                      return CustomPaint(
                        painter: _StarfieldPainter(
                          stars: _stars,
                          twinkleTime: _twinkleController.value,
                          driftX: _driftX,
                          driftY: _driftY,
                          shootingStar: _shootingStar,
                          shootingStarProgress:
                              _shootingStarController.value,
                        ),
                      );
                    },
                  ),
                )
              else if (isCalligraphy)
                Positioned.fill(
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: RadialGradient(
                        center: Alignment.center,
                        radius: 1.0,
                        colors: [
                          const Color(0xFF0D2F17).withAlpha(255),
                          Colors.black,
                        ],
                      ),
                    ),
                  ),
                )
              else
                Positioned.fill(
                  child: AnimatedBuilder(
                    animation: _patternController,
                    builder: (context, child) {
                      return CustomPaint(
                        painter: _IslamicPatternPainter(
                          rotation: _patternController.value * 2 * math.pi,
                        ),
                      );
                    },
                  ),
                ),

              // ── Dark overlay for text readability over photos ──
              if (showPhotos)
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          Colors.black.withAlpha(80),
                          Colors.black.withAlpha(30),
                          Colors.black.withAlpha(30),
                          Colors.black.withAlpha(140),
                        ],
                        stops: const [0.0, 0.3, 0.7, 1.0],
                      ),
                    ),
                  ),
                ),

              // ── Calligraphy mode overlay ──
              if (isCalligraphy)
                Positioned.fill(
                  child: FadeTransition(
                    opacity: _calligraphyFadeController,
                    child: _CalligraphyDisplay(
                      entry: _kCalligraphyPhrases[_calligraphyIdx],
                      driftX: _driftX * 0.3,
                      driftY: _driftY * 0.3,
                    ),
                  ),
                ),

              // ── Ramadan day counter (bottom-left) ──
              if (ramadan.isRamadan)
                Positioned(
                  left: 40,
                  bottom: 40,
                  child: Transform.translate(
                    offset: Offset(_driftX * 0.3, _driftY * 0.3),
                    child: _RamadanBadge(day: ramadan.hDay),
                  ),
                ),

              // ── Photo description (bottom-right) ──
              if (showPhotos && ssState.currentPhoto != null)
                Positioned(
                  right: 40,
                  bottom: 40,
                  child: Transform.translate(
                    offset: Offset(_driftX * 0.3, _driftY * 0.3),
                    child: Text(
                      ssState.currentPhoto!.description,
                      style: TextStyle(
                        color: Colors.white.withAlpha(100),
                        fontSize: 16,
                      ),
                    ),
                  ),
                ),

              // ── Drifting content ──
              Center(
                child: Transform.translate(
                  offset: Offset(_driftX, _driftY),
                  child: timesAsync.when(
                    loading: () => const SizedBox.shrink(),
                    error: (_, _) => const SizedBox.shrink(),
                    data: (times) => _AmbientContent(
                      now: _now,
                      nowH: _nowH,
                      times: times,
                      use24h: settings.use24h,
                      moonResult: moonResult,
                      cityLat: city?.lat,
                      cityLng: city?.lng,
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

// ─── Photo background with crossfade ─────────────────────────────────────────

class _PhotoBackground extends StatelessWidget {
  const _PhotoBackground({
    required this.currentFile,
    required this.crossfadeAnimation,
  });

  final File currentFile;
  final Animation<double> crossfadeAnimation;

  @override
  Widget build(BuildContext context) {
    return Positioned.fill(
      child: AnimatedBuilder(
        animation: crossfadeAnimation,
        builder: (context, child) {
          return Opacity(
            opacity: crossfadeAnimation.value.clamp(0.0, 1.0),
            child: Image.file(
              currentFile,
              fit: BoxFit.cover,
              width: double.infinity,
              height: double.infinity,
              errorBuilder: (_, _, _) => const ColoredBox(color: Colors.black),
            ),
          );
        },
      ),
    );
  }
}

// ─── Ramadan day counter badge ───────────────────────────────────────────────

class _RamadanBadge extends StatelessWidget {
  const _RamadanBadge({required this.day});

  final int day;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFFD4A017).withAlpha(50),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: const Color(0xFFD4A017).withAlpha(80),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          const Text('🌙', style: TextStyle(fontSize: 24)),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'Ramadan',
                style: TextStyle(
                  color: Color(0xFFD4A017),
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                'Day $day',
                style: TextStyle(
                  color: const Color(0xFFD4A017).withAlpha(180),
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ─── Ambient content ─────────────────────────────────────────────────────────

class _AmbientContent extends StatelessWidget {
  const _AmbientContent({
    required this.now,
    required this.nowH,
    required this.times,
    required this.use24h,
    required this.moonResult,
    this.cityLat,
    this.cityLng,
  });

  final DateTime now;
  final double nowH;
  final PrayerTimes times;
  final bool use24h;
  final MoonPhaseResult moonResult;
  final double? cityLat;
  final double? cityLng;

  @override
  Widget build(BuildContext context) {
    final nextLabel = _nextPrayerLabel();
    final countdown = _countdownString();

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // Current time
        Text(
          _formatCurrentTime(),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 80,
            fontWeight: FontWeight.w300,
            fontFeatures: [FontFeature.tabularFigures()],
          ),
        ),
        const SizedBox(height: 24),

        // Next prayer countdown
        if (nextLabel.isNotEmpty)
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 10),
            decoration: BoxDecoration(
              color: PrayCalcColors.dark.withAlpha(100),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Text(
              '$nextLabel in $countdown',
              style: const TextStyle(
                color: PrayCalcColors.light,
                fontSize: 32,
                fontWeight: FontWeight.w400,
                fontFeatures: [FontFeature.tabularFigures()],
              ),
            ),
          ),
        const SizedBox(height: 32),

        // Moon phase + Qibla row
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Moon phase
            Text(
              MoonPhase.phaseEmoji(moonResult.phase),
              style: const TextStyle(fontSize: 36),
            ),
            const SizedBox(width: 8),
            Text(
              '${moonResult.illuminationPct.round()}%',
              style: const TextStyle(color: Colors.white38, fontSize: 22),
            ),

            // Qibla direction
            if (cityLat != null && cityLng != null) ...[
              const SizedBox(width: 32),
              Icon(Icons.explore, color: PrayCalcColors.mid.withAlpha(150), size: 28),
              const SizedBox(width: 6),
              Text(
                'Qibla ${_qiblaDirection()}',
                style: TextStyle(
                  color: PrayCalcColors.mid.withAlpha(150),
                  fontSize: 22,
                ),
              ),
            ],
          ],
        ),
      ],
    );
  }

  String _formatCurrentTime() {
    final hh = now.hour;
    final mm = now.minute.toString().padLeft(2, '0');
    if (use24h) return '${hh.toString().padLeft(2, '0')}:$mm';
    final period = hh >= 12 ? 'PM' : 'AM';
    final h12 = hh % 12 == 0 ? 12 : hh % 12;
    return '$h12:$mm $period';
  }

  String _nextPrayerLabel() {
    const labels = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    final getters = [
      times.fajr, times.sunrise, times.dhuhr,
      times.asr, times.maghrib, times.isha,
    ];
    for (int i = 0; i < getters.length; i++) {
      if (getters[i].isFinite && getters[i] > nowH) return labels[i];
    }
    return labels[0]; // wrap to Fajr
  }

  String _countdownString() {
    final getters = [
      times.fajr, times.sunrise, times.dhuhr,
      times.asr, times.maghrib, times.isha,
    ];
    double target = getters[0]; // default: Fajr
    for (final h in getters) {
      if (h.isFinite && h > nowH) {
        target = h;
        break;
      }
    }
    double diff = target - nowH;
    if (diff < 0) diff += 24;
    final totalSec = (diff * 3600).round();
    final hh = totalSec ~/ 3600;
    final mm = (totalSec % 3600) ~/ 60;
    final ss = totalSec % 60;
    return '${hh.toString().padLeft(2, '0')}:'
        '${mm.toString().padLeft(2, '0')}:'
        '${ss.toString().padLeft(2, '0')}';
  }

  /// Simple Qibla bearing as compass direction string.
  String _qiblaDirection() {
    if (cityLat == null || cityLng == null) return '';
    // Kaaba coordinates
    const kaabaLat = 21.4225;
    const kaabaLng = 39.8262;

    final lat1 = cityLat! * math.pi / 180;
    final lng1 = cityLng! * math.pi / 180;
    const lat2 = kaabaLat * math.pi / 180;
    const lng2 = kaabaLng * math.pi / 180;

    final dLng = lng2 - lng1;
    final y = math.sin(dLng) * math.cos(lat2);
    final x = math.cos(lat1) * math.sin(lat2) -
        math.sin(lat1) * math.cos(lat2) * math.cos(dLng);
    var bearing = math.atan2(y, x) * 180 / math.pi;
    bearing = (bearing + 360) % 360;

    // Convert to compass direction
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    final idx = ((bearing + 22.5) / 45).floor() % 8;
    return '${bearing.round()}° ${directions[idx]}';
  }
}

// ─── Islamic geometric pattern painter ───────────────────────────────────────

class _IslamicPatternPainter extends CustomPainter {
  final double rotation;

  _IslamicPatternPainter({required this.rotation});

  @override
  void paint(Canvas canvas, Size size) {
    final cx = size.width / 2;
    final cy = size.height / 2;

    // Subtle rotating geometric pattern
    final paint = Paint()
      ..style = PaintingStyle.stroke
      ..strokeWidth = 0.5;

    // Layer 1: green octagonal grid
    paint.color = PrayCalcColors.dark.withAlpha(30);
    _drawOctagonalGrid(canvas, cx, cy, size, paint, rotation * 0.3);

    // Layer 2: gold star pattern (slower rotation)
    paint.color = const Color(0xFFD4A017).withAlpha(15);
    paint.strokeWidth = 0.8;
    _drawStarPattern(canvas, cx, cy, size, paint, -rotation * 0.15);
  }

  void _drawOctagonalGrid(
    Canvas canvas,
    double cx,
    double cy,
    Size size,
    Paint paint,
    double angle,
  ) {
    canvas.save();
    canvas.translate(cx, cy);
    canvas.rotate(angle);

    final maxR = math.sqrt(cx * cx + cy * cy);
    const spacing = 120.0;
    final count = (maxR / spacing).ceil() + 1;

    for (int i = -count; i <= count; i++) {
      for (int j = -count; j <= count; j++) {
        final x = i * spacing;
        final y = j * spacing;
        _drawOctagon(canvas, x, y, spacing * 0.4, paint);
      }
    }

    canvas.restore();
  }

  void _drawOctagon(Canvas canvas, double cx, double cy, double r, Paint paint) {
    final path = Path();
    for (int i = 0; i < 8; i++) {
      final angle = (i * math.pi / 4) - math.pi / 8;
      final x = cx + r * math.cos(angle);
      final y = cy + r * math.sin(angle);
      if (i == 0) {
        path.moveTo(x, y);
      } else {
        path.lineTo(x, y);
      }
    }
    path.close();
    canvas.drawPath(path, paint);
  }

  void _drawStarPattern(
    Canvas canvas,
    double cx,
    double cy,
    Size size,
    Paint paint,
    double angle,
  ) {
    canvas.save();
    canvas.translate(cx, cy);
    canvas.rotate(angle);

    final maxR = math.sqrt(cx * cx + cy * cy);
    const spacing = 200.0;
    final count = (maxR / spacing).ceil() + 1;

    for (int i = -count; i <= count; i++) {
      for (int j = -count; j <= count; j++) {
        final x = i * spacing;
        final y = j * spacing;
        _drawSixPointStar(canvas, x, y, spacing * 0.3, paint);
      }
    }

    canvas.restore();
  }

  void _drawSixPointStar(
      Canvas canvas, double cx, double cy, double r, Paint paint) {
    // Two overlapping triangles
    for (int t = 0; t < 2; t++) {
      final offset = t * math.pi / 6;
      final path = Path();
      for (int i = 0; i < 3; i++) {
        final angle = offset + (i * 2 * math.pi / 3) - math.pi / 2;
        final x = cx + r * math.cos(angle);
        final y = cy + r * math.sin(angle);
        if (i == 0) {
          path.moveTo(x, y);
        } else {
          path.lineTo(x, y);
        }
      }
      path.close();
      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(_IslamicPatternPainter oldDelegate) =>
      oldDelegate.rotation != rotation;
}

// ─── P-15: Starfield painter ──────────────────────────────────────────────────

class _StarfieldPainter extends CustomPainter {
  final List<_StarData> stars;
  final double twinkleTime; // 0.0–1.0 from repeating 4s controller
  final double driftX;
  final double driftY;
  final _ShootingStarData? shootingStar;
  final double shootingStarProgress; // 0.0–1.0

  _StarfieldPainter({
    required this.stars,
    required this.twinkleTime,
    required this.driftX,
    required this.driftY,
    this.shootingStar,
    required this.shootingStarProgress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()..style = PaintingStyle.fill;
    final t = twinkleTime * 2 * math.pi;

    for (final star in stars) {
      // Parallax: closer stars drift more
      final px = star.x * size.width + driftX * star.parallaxDepth * 0.08;
      final py = star.y * size.height + driftY * star.parallaxDepth * 0.08;

      // Twinkle
      final twinkle =
          0.7 + 0.3 * math.sin(t * star.twinkleSpeed + star.twinklePhase);
      final alpha = (star.baseAlpha * twinkle * 255).round().clamp(0, 255);

      paint.color = Colors.white.withAlpha(alpha);
      canvas.drawCircle(Offset(px, py), star.size * 0.5, paint);
    }

    // Shooting star
    if (shootingStar != null && shootingStarProgress > 0) {
      _paintShootingStar(canvas, size, shootingStar!, shootingStarProgress);
    }
  }

  void _paintShootingStar(
    Canvas canvas,
    Size size,
    _ShootingStarData data,
    double progress,
  ) {
    final sx = data.startX * size.width;
    final sy = data.startY * size.height;
    final ex = data.endX * size.width;
    final ey = data.endY * size.height;

    // Trail: head advances with progress, tail lags 0.3
    final headProgress = progress;
    final tailProgress = (progress - 0.3).clamp(0.0, 1.0);

    final hx = sx + (ex - sx) * headProgress;
    final hy = sy + (ey - sy) * headProgress;
    final tx = sx + (ex - sx) * tailProgress;
    final ty = sy + (ey - sy) * tailProgress;

    // Fade out in last 20% of animation
    final alpha = progress > 0.8 ? ((1.0 - progress) / 0.2) : 1.0;

    final paint = Paint()
      ..shader = LinearGradient(
        colors: [
          Colors.white.withAlpha((255 * alpha).round()),
          Colors.white.withAlpha(0),
        ],
      ).createShader(Rect.fromPoints(Offset(hx, hy), Offset(tx, ty)))
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2.5
      ..strokeCap = StrokeCap.round;

    canvas.drawLine(Offset(hx, hy), Offset(tx, ty), paint);

    // Bright head dot
    final headPaint = Paint()
      ..color = Colors.white.withAlpha((220 * alpha).round())
      ..style = PaintingStyle.fill;
    canvas.drawCircle(Offset(hx, hy), 3, headPaint);
  }

  @override
  bool shouldRepaint(_StarfieldPainter old) =>
      old.twinkleTime != twinkleTime ||
      old.driftX != driftX ||
      old.driftY != driftY ||
      old.shootingStarProgress != shootingStarProgress;
}

// ─── P-15: Calligraphy display ────────────────────────────────────────────────

class _CalligraphyDisplay extends StatelessWidget {
  const _CalligraphyDisplay({
    required this.entry,
    required this.driftX,
    required this.driftY,
  });

  final _CalligraphyEntry entry;
  final double driftX;
  final double driftY;

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Transform.translate(
        offset: Offset(driftX, driftY),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 80),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Arabic text — large Amiri
              Text(
                entry.arabic,
                textAlign: TextAlign.center,
                textDirection: TextDirection.rtl,
                style: const TextStyle(
                  fontFamily: 'Amiri',
                  fontSize: 72,
                  height: 1.8,
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 24),

              // Horizontal rule
              Container(
                height: 1,
                width: 200,
                color: PrayCalcColors.mid.withAlpha(80),
              ),
              const SizedBox(height: 20),

              // Transliteration
              Text(
                entry.transliteration,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20,
                  height: 1.6,
                  color: Colors.white.withAlpha(160),
                  fontStyle: FontStyle.italic,
                  letterSpacing: 0.5,
                ),
              ),
              const SizedBox(height: 12),

              // English translation
              Text(
                '"${entry.translation}"',
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 22,
                  height: 1.5,
                  color: Colors.white,
                  fontWeight: FontWeight.w300,
                ),
              ),
              const SizedBox(height: 16),

              // Source pill
              Container(
                padding:
                    const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                decoration: BoxDecoration(
                  color: PrayCalcColors.dark.withAlpha(120),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: PrayCalcColors.mid.withAlpha(60),
                  ),
                ),
                child: Text(
                  entry.source,
                  style: TextStyle(
                    fontSize: 14,
                    color: PrayCalcColors.light.withAlpha(180),
                    fontWeight: FontWeight.w500,
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
