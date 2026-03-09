import 'dart:async';

import 'package:flutter/material.dart';

// ---------------------------------------------------------------------------
// TvImamMode (P-20)
// ---------------------------------------------------------------------------
// Imam/congregation mode. Displayed on the masjid TV during jama'ah. Shows a
// large iqamah countdown for the current prayer, a congregation counter pushed
// from the imam's phone via SSE, and an announcement strip. When the countdown
// reaches zero a full-screen green flash fires and onIqamahStart is called.
//
// The iqamah button is intentionally absent on the TV — it is controlled from
// the mobile remote. The TV is a pure display surface.
// ---------------------------------------------------------------------------

class TvImamMode extends StatefulWidget {
  /// When iqamah will start.
  final DateTime iqamahTime;

  /// English name of the current prayer, e.g. "Dhuhr".
  final String prayerName;

  /// Arabic name of the current prayer, e.g. "الظهر".
  final String prayerNameArabic;

  /// Called once when the countdown reaches zero.
  final VoidCallback onIqamahStart;

  /// Number of people in the congregation, pushed from the imam's phone.
  final int congregationCount;

  /// Optional announcement text scrolled in the bottom strip. When empty the
  /// default duaa message is shown instead.
  final String announcementText;

  const TvImamMode({
    super.key,
    required this.iqamahTime,
    required this.prayerName,
    this.prayerNameArabic = '',
    required this.onIqamahStart,
    this.congregationCount = 0,
    this.announcementText = '',
  });

  @override
  State<TvImamMode> createState() => _TvImamModeState();
}

class _TvImamModeState extends State<TvImamMode>
    with TickerProviderStateMixin {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  Timer? _countdownTimer;
  Duration _remaining = Duration.zero;
  bool _iqamahFired = false;

  // Flash animation on iqamah start.
  late AnimationController _flashController;
  late Animation<double> _flashOpacity;

  // Pulsing ring shown in the last 60 seconds.
  late AnimationController _pulseController;
  late Animation<double> _pulseScale;
  late Animation<double> _pulseOpacity;

  // Ticker scroll for the announcement strip.
  late AnimationController _tickerController;
  late Animation<Offset> _tickerOffset;

  // ---------------------------------------------------------------------------
  // Lifecycle
  // ---------------------------------------------------------------------------

  @override
  void initState() {
    super.initState();

    // Green flash controller — 300 ms, fires once at iqamah.
    _flashController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _flashOpacity = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _flashController, curve: Curves.easeIn),
    );

    // Pulse ring controller — repeating 1.2 s cycle.
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _pulseScale = Tween<double>(begin: 1.0, end: 1.18).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
    _pulseOpacity = Tween<double>(begin: 0.6, end: 0.0).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeOut),
    );

    // Ticker controller — repeating 20 s scroll.
    _tickerController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat();
    _tickerOffset = Tween<Offset>(
      begin: const Offset(1, 0),
      end: const Offset(-1, 0),
    ).animate(_tickerController);

    _updateRemaining();
    _countdownTimer = Timer.periodic(const Duration(seconds: 1), (_) {
      _updateRemaining();
    });
  }

  void _updateRemaining() {
    final now = DateTime.now();
    final diff = widget.iqamahTime.difference(now);

    setState(() {
      if (diff.isNegative) {
        _remaining = Duration.zero;
        if (!_iqamahFired) {
          _iqamahFired = true;
          _triggerIqamah();
        }
      } else {
        _remaining = diff;
        // Start pulsing ring in the last 60 seconds.
        if (diff.inSeconds <= 60 && !_pulseController.isAnimating) {
          _pulseController.repeat(reverse: true);
        }
      }
    });
  }

  void _triggerIqamah() {
    _flashController.forward().then((_) {
      if (mounted) widget.onIqamahStart();
    });
  }

  @override
  void dispose() {
    _countdownTimer?.cancel();
    _flashController.dispose();
    _pulseController.dispose();
    _tickerController.dispose();
    super.dispose();
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /// Formats the countdown as MM:SS.
  String get _countdownText {
    final m = _remaining.inMinutes.remainder(60).toString().padLeft(2, '0');
    final s = _remaining.inSeconds.remainder(60).toString().padLeft(2, '0');
    return '$m:$s';
  }

  bool get _isPulsing => _remaining.inSeconds <= 60 && !_iqamahFired;

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Base layout.
        Container(
          color: const Color(0xFF0A1A0C),
          child: Column(
            children: [
              // Main centred content.
              Expanded(child: _buildMainContent()),
              // Congregation counter strip.
              _buildCongregationBar(),
              // Announcement / duaa strip.
              _buildAnnouncementStrip(),
            ],
          ),
        ),
        // Full-screen green flash overlay — animated.
        FadeTransition(
          opacity: _flashOpacity,
          child: Container(
            color: const Color(0xFF1E5E2F),
          ),
        ),
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Main content
  // ---------------------------------------------------------------------------

  Widget _buildMainContent() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          // Arabic prayer name.
          Text(
            widget.prayerNameArabic.isNotEmpty
                ? widget.prayerNameArabic
                : widget.prayerName,
            style: const TextStyle(
              fontFamily: 'Amiri',
              fontSize: 80,
              color: Colors.white,
              height: 1.1,
            ),
          ),
          const SizedBox(height: 4),
          // English prayer name.
          Text(
            widget.prayerName.toUpperCase(),
            style: TextStyle(
              fontSize: 24,
              color: Colors.white.withValues(alpha: 0.70),
              letterSpacing: 3,
              fontWeight: FontWeight.w300,
            ),
          ),
          const SizedBox(height: 40),
          // Countdown with optional pulse ring.
          _buildCountdown(),
          const SizedBox(height: 12),
          Text(
            'Iqamah',
            style: TextStyle(
              fontSize: 18,
              color: Colors.white.withValues(alpha: 0.50),
              letterSpacing: 1.5,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCountdown() {
    final countdownWidget = Text(
      _countdownText,
      style: const TextStyle(
        fontSize: 96,
        fontWeight: FontWeight.bold,
        color: Color(0xFFC9F27A),
        fontFeatures: [FontFeature.tabularFigures()],
        height: 1.0,
      ),
    );

    if (!_isPulsing) return countdownWidget;

    // Wrap in a pulsing ring when under 60 seconds.
    return Stack(
      alignment: Alignment.center,
      children: [
        // Animated ring.
        AnimatedBuilder(
          animation: _pulseController,
          builder: (context, child) {
            return Transform.scale(
              scale: _pulseScale.value,
              child: Opacity(
                opacity: _pulseOpacity.value,
                child: Container(
                  width: 260,
                  height: 160,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(
                      color: const Color(0xFFC9F27A),
                      width: 3,
                    ),
                  ),
                ),
              ),
            );
          },
        ),
        countdownWidget,
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Congregation bar
  // ---------------------------------------------------------------------------

  Widget _buildCongregationBar() {
    if (widget.congregationCount <= 0) return const SizedBox.shrink();

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Text(
            'Congregation',
            style: TextStyle(
              fontSize: 14,
              color: Colors.white.withValues(alpha: 0.40),
              letterSpacing: 0.8,
            ),
          ),
          const SizedBox(width: 16),
          Icon(
            Icons.group,
            size: 24,
            color: Colors.white.withValues(alpha: 0.70),
          ),
          const SizedBox(width: 8),
          Text(
            '${widget.congregationCount}',
            style: const TextStyle(
              fontSize: 48,
              fontWeight: FontWeight.bold,
              color: Colors.white,
              height: 1.0,
            ),
          ),
        ],
      ),
    );
  }

  // ---------------------------------------------------------------------------
  // Announcement strip
  // ---------------------------------------------------------------------------

  Widget _buildAnnouncementStrip() {
    final text = widget.announcementText.isNotEmpty
        ? widget.announcementText
        : 'May Allah accept your prayer  ·  تقبل الله صلاتك';

    return Container(
      height: 44,
      color: Colors.black.withValues(alpha: 0.40),
      clipBehavior: Clip.hardEdge,
      child: SlideTransition(
        position: _tickerOffset,
        child: Center(
          child: Text(
            text,
            style: TextStyle(
              fontSize: 15,
              color: Colors.white.withValues(alpha: 0.40),
              letterSpacing: 0.5,
            ),
            maxLines: 1,
            softWrap: false,
            overflow: TextOverflow.visible,
          ),
        ),
      ),
    );
  }
}
