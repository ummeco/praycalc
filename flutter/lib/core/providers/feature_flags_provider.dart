// Feature flags provider — T40 (S19)
//
// Reads platform feature flags from `up_feature_flag` Hasura table.
// Falls back to spec-defined defaults when offline or unauthenticated.
//
// All 8 PrayCalc v1.1 flags:
//   praycalc.live_activity   — iOS Live Activity (default: true)
//   praycalc.apple_watch     — Apple Watch companion (default: true)
//   praycalc.wearos          — WearOS companion (default: true)
//   praycalc.desktop_tray    — Desktop tray app (default: true)
//   praycalc.tv              — TV app (default: true)
//   praycalc.smart_home      — Smart home integration (default: false, Ummat+)
//   praycalc.alexa           — Alexa skill (default: true)
//   praycalc.google_actions  — Google Actions skill (default: true)

import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/auth_service.dart';
import '../services/graphql_service.dart';

// ─── Model ────────────────────────────────────────────────────────────────────

/// Snapshot of all PrayCalc feature flags.
class PrayCalcFeatureFlags {
  const PrayCalcFeatureFlags({
    this.liveActivity = true,
    this.appleWatch = true,
    this.wearOs = true,
    this.desktopTray = true,
    this.tv = true,
    this.smartHome = false,
    this.alexa = true,
    this.googleActions = true,
  });

  /// iOS Live Activity (iOS 16.1+).
  final bool liveActivity;

  /// Apple Watch companion (watchOS 9+).
  final bool appleWatch;

  /// WearOS companion (WearOS 3+).
  final bool wearOs;

  /// Desktop tray app (macOS 12+ / Windows 10+).
  final bool desktopTray;

  /// TV app (Android TV 9+ / tvOS 15+).
  final bool tv;

  /// Smart home integration — Ummat+ subscription required.
  final bool smartHome;

  /// Alexa skill.
  final bool alexa;

  /// Google Actions skill.
  final bool googleActions;

  /// Spec-defined defaults — used when offline or unauthenticated.
  static const defaults = PrayCalcFeatureFlags();

  PrayCalcFeatureFlags copyWith({
    bool? liveActivity,
    bool? appleWatch,
    bool? wearOs,
    bool? desktopTray,
    bool? tv,
    bool? smartHome,
    bool? alexa,
    bool? googleActions,
  }) {
    return PrayCalcFeatureFlags(
      liveActivity: liveActivity ?? this.liveActivity,
      appleWatch: appleWatch ?? this.appleWatch,
      wearOs: wearOs ?? this.wearOs,
      desktopTray: desktopTray ?? this.desktopTray,
      tv: tv ?? this.tv,
      smartHome: smartHome ?? this.smartHome,
      alexa: alexa ?? this.alexa,
      googleActions: googleActions ?? this.googleActions,
    );
  }
}

// ─── GraphQL query ────────────────────────────────────────────────────────────

const _kFetchFlagsQuery = r'''
  query FetchPrayCalcFlags {
    up_feature_flag(
      where: { name: { _like: "praycalc.%" } }
    ) {
      name
      enabled
    }
  }
''';

// ─── Notifier ─────────────────────────────────────────────────────────────────

class _FeatureFlagsNotifier extends AsyncNotifier<PrayCalcFeatureFlags> {
  @override
  Future<PrayCalcFeatureFlags> build() async {
    // Always return defaults immediately; fetch in background.
    _fetchAndUpdate();
    return PrayCalcFeatureFlags.defaults;
  }

  Future<void> _fetchAndUpdate() async {
    try {
      final result = await GraphQLService.instance.query(
        _kFetchFlagsQuery,
        authenticated: AuthService.instance.isAuthenticated,
        fetchPolicy: null, // uses default (networkOnly)
      );

      if (result.hasException || result.data == null) return;

      final rows = (result.data!['up_feature_flag'] as List?)
              ?.cast<Map<String, dynamic>>() ??
          [];

      // Build a name→enabled map from the rows.
      final map = <String, bool>{
        for (final row in rows)
          (row['name'] as String): (row['enabled'] as bool? ?? true),
      };

      var flags = PrayCalcFeatureFlags.defaults;
      flags = flags.copyWith(
        liveActivity: map['praycalc.live_activity'] ?? flags.liveActivity,
        appleWatch: map['praycalc.apple_watch'] ?? flags.appleWatch,
        wearOs: map['praycalc.wearos'] ?? flags.wearOs,
        desktopTray: map['praycalc.desktop_tray'] ?? flags.desktopTray,
        tv: map['praycalc.tv'] ?? flags.tv,
        smartHome: map['praycalc.smart_home'] ?? flags.smartHome,
        alexa: map['praycalc.alexa'] ?? flags.alexa,
        googleActions: map['praycalc.google_actions'] ?? flags.googleActions,
      );

      state = AsyncData(flags);
    } catch (_) {
      // Keep defaults on any error — fail open.
    }
  }

  /// Refresh flags (e.g., called after sign-in).
  Future<void> refresh() => _fetchAndUpdate();
}

// ─── Provider ─────────────────────────────────────────────────────────────────

/// Async provider exposing [PrayCalcFeatureFlags].
///
/// Defaults to spec values immediately; hydrates from Hasura in the background.
/// Consumers should use `ref.watch(featureFlagsProvider).valueOrNull ?? PrayCalcFeatureFlags.defaults`
/// to get a synchronous value.
final _featureFlagsAsyncProvider =
    AsyncNotifierProvider<_FeatureFlagsNotifier, PrayCalcFeatureFlags>(
  _FeatureFlagsNotifier.new,
);

/// Synchronous convenience provider — never null, returns defaults when loading.
final featureFlagsProvider = Provider<PrayCalcFeatureFlags>((ref) {
  return ref.watch(_featureFlagsAsyncProvider).valueOrNull ??
      PrayCalcFeatureFlags.defaults;
});
