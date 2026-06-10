import 'dart:async';

import 'package:flutter/material.dart';

import '../../shared/models/tv_settings_model.dart';

// ---------------------------------------------------------------------------
// TvContentCyclerController
// ---------------------------------------------------------------------------

/// Programmatic control over a mounted [TvContentCycler].
class TvContentCyclerController {
  _TvContentCyclerState? _state;

  void _attach(_TvContentCyclerState state) => _state = state;
  void _detach() => _state = null;

  void next() => _state?._advance(1);
  void prev() => _state?._advance(-1);
  void jumpTo(int index) => _state?._jumpTo(index);
}

// ---------------------------------------------------------------------------
// TvContentCycler
// ---------------------------------------------------------------------------

/// Rotates through a list of [TvContentType] items on a fixed interval,
/// animating between them with a cross-fade transition.
class TvContentCycler extends StatefulWidget {
  const TvContentCycler({
    super.key,
    required this.cycle,
    this.itemDuration = const Duration(seconds: 30),
    this.controller,
  });

  final List<TvContentType> cycle;
  final Duration itemDuration;
  final TvContentCyclerController? controller;

  @override
  State<TvContentCycler> createState() => _TvContentCyclerState();
}

class _TvContentCyclerState extends State<TvContentCycler> {
  late final PageController _pageController;
  Timer? _timer;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _pageController = PageController();
    widget.controller?._attach(this);
    _startTimer();
  }

  @override
  void didUpdateWidget(TvContentCycler oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.controller != widget.controller) {
      oldWidget.controller?._detach();
      widget.controller?._attach(this);
    }
    if (oldWidget.itemDuration != widget.itemDuration) {
      _startTimer();
    }
  }

  @override
  void dispose() {
    widget.controller?._detach();
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  void _startTimer() {
    _timer?.cancel();
    if (widget.cycle.isEmpty) return;
    _timer = Timer.periodic(widget.itemDuration, (_) => _advance(1));
  }

  void _advance(int delta) {
    if (widget.cycle.isEmpty) return;
    final next =
        (_currentIndex + delta).remainder(widget.cycle.length).abs();
    _jumpTo(next);
  }

  void _jumpTo(int index) {
    if (widget.cycle.isEmpty) return;
    final clamped = index.clamp(0, widget.cycle.length - 1);
    setState(() => _currentIndex = clamped);
    if (_pageController.hasClients) {
      _pageController.animateToPage(
        clamped,
        duration: const Duration(milliseconds: 800),
        curve: Curves.easeInOut,
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.cycle.isEmpty) {
      return const SizedBox.expand();
    }

    return LayoutBuilder(
      builder: (context, constraints) {
        return PageView.builder(
          controller: _pageController,
          physics: const NeverScrollableScrollPhysics(),
          itemCount: widget.cycle.length,
          itemBuilder: (context, index) {
            return AnimatedSwitcher(
              duration: const Duration(milliseconds: 800),
              switchInCurve: Curves.easeIn,
              switchOutCurve: Curves.easeOut,
              child: _ContentPlaceholder(
                key: ValueKey(widget.cycle[index]),
                type: widget.cycle[index],
              ),
            );
          },
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// _ContentPlaceholder
// ---------------------------------------------------------------------------

/// Placeholder rendering for each [TvContentType].
/// Replace individual cases with real widgets as content is wired in.
class _ContentPlaceholder extends StatelessWidget {
  const _ContentPlaceholder({super.key, required this.type});

  final TvContentType type;

  String get _label {
    switch (type) {
      case TvContentType.liveStream:
        return 'Live Stream';
      case TvContentType.artSlideshow:
        return 'Art Slideshow';
      case TvContentType.quranDisplay:
        return 'Quran Display';
      case TvContentType.weather:
        return 'Weather';
      case TvContentType.ayahOfHour:
        return 'Ayah of the Hour';
      case TvContentType.clock:
        return 'Clock';
      case TvContentType.hadithDisplay:
        return 'Hadith Display';
      case TvContentType.multiCity:
        return 'Multi-City';
      case TvContentType.googlePhotos:
        return 'Google Photos';
    }
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox.expand(
      child: Center(
        child: Text(
          _label,
          style: const TextStyle(
            color: Colors.white54,
            fontSize: 18,
            fontWeight: FontWeight.w400,
          ),
        ),
      ),
    );
  }
}
