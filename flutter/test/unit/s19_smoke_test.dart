// S19 end-to-end smoke test — PrayCalc v1.1
//
// Verifies that every v1.1 surface compiles, constructs, and produces valid
// output without requiring network, GPS, or native plugins.
//
// Run: flutter test test/unit/s19_smoke_test.dart

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:pray_calc_dart/pray_calc_dart.dart';

import 'package:praycalc_app/core/providers/feature_flags_provider.dart';
import 'package:praycalc_app/core/theme/app_theme.dart';
import 'package:praycalc_app/shared/widgets/prayer_timeline_bar.dart';
import 'package:praycalc_app/shared/widgets/ambient_overlay.dart';
import 'package:praycalc_app/features/home/prayer_card_fan.dart';

// ── Helpers ────────────────────────────────────────────────────────────────────

/// Fake PrayerTimes for Mecca on 2024-01-15 (deterministic, no network).
PrayerTimes _fakeTimes() {
  return getTimes(
    DateTime(2024, 1, 15),
    21.4225,  // Mecca lat
    39.8261,  // Mecca lng
    3.0,      // UTC+3
  );
}

// ── Feature Flags (T40) ────────────────────────────────────────────────────────

void _featureFlagsTests() {
  group('T40 — PrayCalcFeatureFlags', () {
    test('defaults have correct spec values', () {
      const flags = PrayCalcFeatureFlags();
      expect(flags.liveActivity,   isTrue,  reason: 'live_activity default = true');
      expect(flags.appleWatch,     isTrue,  reason: 'apple_watch default = true');
      expect(flags.wearOs,         isTrue,  reason: 'wearos default = true');
      expect(flags.desktopTray,    isTrue,  reason: 'desktop_tray default = true');
      expect(flags.tv,             isTrue,  reason: 'tv default = true');
      expect(flags.smartHome,      isFalse, reason: 'smart_home default = false (Ummat+ only)');
      expect(flags.alexa,          isTrue,  reason: 'alexa default = true');
      expect(flags.googleActions,  isTrue,  reason: 'google_actions default = true');
    });

    test('copyWith overrides individual flags without changing others', () {
      const base = PrayCalcFeatureFlags();
      final modified = base.copyWith(smartHome: true, tv: false);
      expect(modified.smartHome,    isTrue);
      expect(modified.tv,           isFalse);
      // Unchanged fields preserved:
      expect(modified.liveActivity,    isTrue);
      expect(modified.appleWatch,      isTrue);
      expect(modified.wearOs,          isTrue);
      expect(modified.desktopTray,     isTrue);
      expect(modified.alexa,           isTrue);
      expect(modified.googleActions,   isTrue);
    });

    test('PrayCalcFeatureFlags.defaults matches default constructor', () {
      const direct = PrayCalcFeatureFlags();
      const via = PrayCalcFeatureFlags.defaults;
      expect(via.liveActivity,    equals(direct.liveActivity));
      expect(via.appleWatch,      equals(direct.appleWatch));
      expect(via.wearOs,          equals(direct.wearOs));
      expect(via.desktopTray,     equals(direct.desktopTray));
      expect(via.tv,              equals(direct.tv));
      expect(via.smartHome,       equals(direct.smartHome));
      expect(via.alexa,           equals(direct.alexa));
      expect(via.googleActions,   equals(direct.googleActions));
    });

    testWidgets('featureFlagsProvider returns defaults synchronously', (tester) async {
      late PrayCalcFeatureFlags flags;
      await tester.pumpWidget(
        ProviderScope(
          child: Consumer(
            builder: (context, ref, _) {
              flags = ref.watch(featureFlagsProvider);
              return const SizedBox.shrink();
            },
          ),
        ),
      );
      expect(flags.liveActivity,  isTrue);
      expect(flags.smartHome,     isFalse);
    });
  });
}

// ── Theme / High Contrast (T41) ────────────────────────────────────────────────

void _themeTests() {
  group('T41 — PrayCalcColors high contrast', () {
    testWidgets('accentFor returns light (#C9F27A) in normal mode', (tester) async {
      late Color result;
      await tester.pumpWidget(
        MediaQuery(
          data: const MediaQueryData(highContrast: false),
          child: Builder(builder: (ctx) {
            result = PrayCalcColors.accentFor(ctx);
            return const SizedBox.shrink();
          }),
        ),
      );
      expect(result, equals(PrayCalcColors.light));
    });

    testWidgets('accentFor returns white in high-contrast mode (WCAG AA)', (tester) async {
      late Color result;
      await tester.pumpWidget(
        MediaQuery(
          data: const MediaQueryData(highContrast: true),
          child: Builder(builder: (ctx) {
            result = PrayCalcColors.accentFor(ctx);
            return const SizedBox.shrink();
          }),
        ),
      );
      expect(result, equals(PrayCalcColors.highContrastAccent));
      expect(result, equals(Colors.white));
    });
  });
}

// ── PrayerTimelineBar ─────────────────────────────────────────────────────────

void _prayerTimelineBarTests() {
  group('PrayerTimelineBar', () {
    const items = [
      PrayerTimelineItem(name: 'Fajr',    displayTime: '5:30 AM',  isNext: false, isCompleted: true),
      PrayerTimelineItem(name: 'Dhuhr',   displayTime: '12:10 PM', isNext: false, isCompleted: true),
      PrayerTimelineItem(name: 'Asr',     displayTime: '3:30 PM',  isNext: true,  isCompleted: false),
      PrayerTimelineItem(name: 'Maghrib', displayTime: '6:20 PM',  isNext: false, isCompleted: false),
      PrayerTimelineItem(name: 'Isha',    displayTime: '7:45 PM',  isNext: false, isCompleted: false),
    ];

    testWidgets('renders without throwing', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: PrayerTimelineBar(prayers: items, currentProgress: 0.43),
          ),
        ),
      );
      expect(tester.takeException(), isNull);
    });

    testWidgets('has a non-empty Semantics label', (tester) async {
      tester.ensureSemantics();
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: PrayerTimelineBar(prayers: items, currentProgress: 0.43),
          ),
        ),
      );
      final semantics = tester.getSemantics(find.byType(PrayerTimelineBar));
      expect(semantics.label, isNotEmpty);
    });
  });
}

// ── AmbientOverlay ────────────────────────────────────────────────────────────

void _ambientOverlayTests() {
  group('AmbientOverlay', () {
    testWidgets('renders without throwing', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AmbientOverlay(
              nextPrayer: 'Asr',
              nextPrayerTime: '3:47 PM',
              countdownSeconds: 4020,
              progress: 0.6,
              locationName: 'Mecca',
              hijriDate: '5 Rajab 1446',
            ),
          ),
        ),
      );
      expect(tester.takeException(), isNull);
    });

    testWidgets('shows next prayer name', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AmbientOverlay(
              nextPrayer: 'Maghrib',
              nextPrayerTime: '6:22 PM',
              countdownSeconds: 900,
              progress: 0.85,
            ),
          ),
        ),
      );
      expect(find.text('Maghrib'), findsOneWidget);
    });

    testWidgets('contains a Semantics widget with liveRegion=true for countdown', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: AmbientOverlay(
              nextPrayer: 'Isha',
              nextPrayerTime: '7:45 PM',
              countdownSeconds: 300,
              progress: 0.95,
            ),
          ),
        ),
      );

      // Find all Semantics widgets with liveRegion: true.
      final liveRegionWidgets = tester.widgetList<Semantics>(find.byType(Semantics)).where(
        (s) => s.properties.liveRegion == true,
      );
      expect(
        liveRegionWidgets,
        isNotEmpty,
        reason: 'AmbientOverlay must contain a Semantics(liveRegion: true) for countdown announcements',
      );
    });
  });
}

// ── PrayerCardFan (T41) ────────────────────────────────────────────────────────

void _prayerCardFanTests() {
  group('T41 — PrayerCardFan accessibility', () {
    late PrayerTimes times;

    setUp(() {
      times = _fakeTimes();
    });

    testWidgets('renders without throwing', (tester) async {
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: PrayerCardFan(
                times: times,
                use24h: false,
                nextPrayerIndex: 2, // Asr
              ),
            ),
          ),
        ),
      );
      expect(tester.takeException(), isNull);
    });

    testWidgets('collapsed state has "Prayer times" semantics label', (tester) async {
      tester.ensureSemantics();
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: PrayerCardFan(
                times: times,
                use24h: false,
                nextPrayerIndex: 0,
              ),
            ),
          ),
        ),
      );

      // bySemanticsLabel matches substring — "Prayer times" must appear somewhere
      expect(
        find.bySemanticsLabel(RegExp('Prayer times')),
        findsOneWidget,
        reason: 'Collapsed fan must announce "Prayer times" to screen readers',
      );
    });

    testWidgets('collapsed label includes "(next)" for the upcoming prayer', (tester) async {
      tester.ensureSemantics();
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: Center(
              child: PrayerCardFan(
                times: times,
                use24h: false,
                nextPrayerIndex: 3, // Maghrib is next
              ),
            ),
          ),
        ),
      );

      expect(
        find.bySemanticsLabel(RegExp(r'\(next\)')),
        findsOneWidget,
        reason: 'Fan collapsed label must include "(next)" for the upcoming prayer',
      );
    });
  });
}

// ── AppTheme ──────────────────────────────────────────────────────────────────

void _appThemeTests() {
  group('AppTheme', () {
    test('light() produces a valid ThemeData', () {
      final theme = AppTheme.light();
      expect(theme.brightness, equals(Brightness.light));
      expect(theme.useMaterial3, isTrue);
    });

    test('dark() produces a valid ThemeData', () {
      final theme = AppTheme.dark();
      expect(theme.brightness, equals(Brightness.dark));
      expect(theme.useMaterial3, isTrue);
    });

    test('dark() scaffold background matches PrayCalcColors.canvas', () {
      final theme = AppTheme.dark();
      expect(theme.scaffoldBackgroundColor, equals(PrayCalcColors.canvas));
    });
  });
}

// ── Entry point ────────────────────────────────────────────────────────────────

void main() {
  _featureFlagsTests();
  _themeTests();
  _prayerTimelineBarTests();
  _ambientOverlayTests();
  _prayerCardFanTests();
  _appThemeTests();
}
