/// S6-13 — Riverpod subscription state provider with Hasura GraphQL subscription.
///
/// Replaces the old smart-service HTTP polling approach with:
/// 1. Initial HTTP check against the Hasura admin endpoint.
/// 2. Live Hasura GraphQL subscription on umm_subscriptions (WebSocket).
/// 3. Foreground refresh on app lifecycle resume.
///
/// Exposes [isUmmatPlus] bool to gate premium feature widgets.
library;

import 'dart:async';
import 'dart:convert';
import 'dart:io' show Platform;

import 'package:flutter/widgets.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:graphql/client.dart';
import 'package:http/http.dart' as http;

import '../services/auth_service.dart';
import '../services/iap/apple_iap_service.dart';
import '../services/iap/google_iap_service.dart';
import '../services/iap/products.dart';

// ── Constants ─────────────────────────────────────────────────────────────────

/// Hasura GraphQL HTTP URL — used for one-shot status query.
const _kHasuraUrl = String.fromEnvironment(
  'HASURA_GRAPHQL_URL',
  defaultValue: 'https://api.praycalc.com/v1/graphql',
);

/// Hasura GraphQL WebSocket URL — used for live subscription.
/// Converts http(s) → ws(s) automatically.
String get _kHasuraWsUrl => _kHasuraUrl
    .replaceFirst('https://', 'wss://')
    .replaceFirst('http://', 'ws://');

/// Server-side IAP validation routes on praycalc.com.
const _kAppleValidateUrl = String.fromEnvironment(
  'IAP_APPLE_VALIDATE_URL',
  defaultValue: 'https://praycalc.com/api/iap/apple/validate',
);
const _kGoogleValidateUrl = String.fromEnvironment(
  'IAP_GOOGLE_VALIDATE_URL',
  defaultValue: 'https://praycalc.com/api/iap/google/validate',
);

// ── Query / Subscription documents ───────────────────────────────────────────

const _kSubscriptionStatusQuery = '''
  query GetSubscriptionStatus(\$userId: uuid!) {
    umm_subscriptions(
      where: {
        user_id: { _eq: \$userId }
        expires_at: { _gt: "now()" }
        is_active: { _eq: true }
      }
      limit: 1
    ) {
      product_id
      expires_at
      store
      is_active
    }
  }
''';

const _kSubscriptionStatusSubscription = '''
  subscription WatchSubscriptionStatus(\$userId: uuid!) {
    umm_subscriptions(
      where: {
        user_id: { _eq: \$userId }
        expires_at: { _gt: "now()" }
        is_active: { _eq: true }
      }
      limit: 1
    ) {
      product_id
      expires_at
      store
      is_active
    }
  }
''';

// ── State models ──────────────────────────────────────────────────────────────

/// Subscription plan tiers.
enum SubscriptionPlan { free, plus }

/// Subscription state exposed to the UI.
class SubscriptionState {
  final SubscriptionPlan plan;
  final bool isActive;
  final DateTime? expiresAt;
  final String? store; // 'apple' | 'google' | null
  final bool isLoading;
  final String? error;

  const SubscriptionState({
    this.plan = SubscriptionPlan.free,
    this.isActive = false,
    this.expiresAt,
    this.store,
    this.isLoading = false,
    this.error,
  });

  /// True when the user has an active Ummat+ subscription.
  bool get isPlus => plan == SubscriptionPlan.plus && isActive;

  SubscriptionState copyWith({
    SubscriptionPlan? plan,
    bool? isActive,
    DateTime? expiresAt,
    String? store,
    bool? isLoading,
    String? error,
  }) =>
      SubscriptionState(
        plan: plan ?? this.plan,
        isActive: isActive ?? this.isActive,
        expiresAt: expiresAt ?? this.expiresAt,
        store: store ?? this.store,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );
}

// ── Notifier ──────────────────────────────────────────────────────────────────

/// Manages subscription status via Hasura GraphQL subscription (WebSocket).
///
/// Architecture:
/// 1. On build: one-shot HTTP query to get initial state quickly.
/// 2. Then: opens a Hasura WebSocket subscription for live updates.
/// 3. On foreground resume (AppLifecycleListener): re-queries to catch
///    any updates that occurred while the app was in background.
///
/// Purchase flow delegates to [AppleIAPService] or [GoogleIAPService]
/// depending on the current platform, then validates server-side via
/// the IAP validate routes.
class SubscriptionNotifier extends Notifier<SubscriptionState> {
  StreamSubscription<QueryResult>? _wsSub;
  AppLifecycleListener? _lifecycleListener;

  @override
  SubscriptionState build() {
    // Register lifecycle observer for foreground refresh.
    _lifecycleListener = AppLifecycleListener(
      onResume: _onAppResumed,
    );

    // Auto-load if authenticated.
    if (AuthService.instance.isAuthenticated) {
      Future.microtask(() async {
        await checkStatus();
        _startWebSocketSubscription();
      });
    }

    ref.onDispose(() {
      _wsSub?.cancel();
      _lifecycleListener?.dispose();
    });

    return const SubscriptionState();
  }

  void _onAppResumed() {
    if (AuthService.instance.isAuthenticated) {
      checkStatus();
    }
  }

  // ── WebSocket subscription ──────────────────────────────────────────────────

  void _startWebSocketSubscription() {
    final userId = AuthService.instance.currentUser?.id;
    final token = AuthService.instance.accessToken;
    if (userId == null || token == null) return;

    _wsSub?.cancel();

    final wsLink = WebSocketLink(
      _kHasuraWsUrl,
      config: SocketClientConfig(
        initialPayload: () => {
          'headers': {'Authorization': 'Bearer $token'},
        },
      ),
    );

    final client = GraphQLClient(
      link: wsLink,
      cache: GraphQLCache(store: InMemoryStore()),
    );

    final options = SubscriptionOptions(
      document: gql(_kSubscriptionStatusSubscription),
      variables: {'userId': userId},
    );

    _wsSub = client.subscribe(options).listen((result) {
      if (result.hasException) return; // Keep last known state on WS error.
      _applyQueryResult(result.data);
    });
  }

  // ── HTTP query ──────────────────────────────────────────────────────────────

  /// Fetch subscription status via HTTP (one-shot, no WebSocket).
  Future<void> checkStatus() async {
    final userId = AuthService.instance.currentUser?.id;
    final token = AuthService.instance.accessToken;
    if (userId == null || token == null) {
      state = const SubscriptionState();
      return;
    }

    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await http.post(
        Uri.parse(_kHasuraUrl),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'query': _kSubscriptionStatusQuery,
          'variables': {'userId': userId},
        }),
      );

      if (response.statusCode != 200) {
        state = const SubscriptionState();
        return;
      }

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      _applyQueryResult(body['data'] as Map<String, dynamic>?);
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  void _applyQueryResult(Map<String, dynamic>? data) {
    if (data == null) {
      state = const SubscriptionState();
      return;
    }

    final subs = data['umm_subscriptions'] as List<dynamic>? ?? [];
    if (subs.isEmpty) {
      state = const SubscriptionState();
      return;
    }

    final sub = subs.first as Map<String, dynamic>;
    final productId = sub['product_id'] as String? ?? '';
    final expiresStr = sub['expires_at'] as String?;
    final store = sub['store'] as String?;
    final isActive = sub['is_active'] as bool? ?? false;

    final isPlus = productId == kUmmatPlusYearlyProductId && isActive;

    state = SubscriptionState(
      plan: isPlus ? SubscriptionPlan.plus : SubscriptionPlan.free,
      isActive: isActive,
      expiresAt: expiresStr != null ? DateTime.tryParse(expiresStr) : null,
      store: store,
    );
  }

  // ── Purchase flow ───────────────────────────────────────────────────────────

  /// Initiate an in-app purchase for Ummat+.
  ///
  /// Dispatches to [AppleIAPService] on iOS and [GoogleIAPService] on Android,
  /// then sends the receipt to the server-side validate route, and finally
  /// refreshes subscription state from Hasura.
  Future<bool> purchase() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      if (Platform.isIOS) {
        return await _purchaseApple();
      } else if (Platform.isAndroid) {
        return await _purchaseGoogle();
      } else {
        state = state.copyWith(
          isLoading: false,
          error: 'In-app purchases are not supported on this platform.',
        );
        return false;
      }
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  Future<bool> _purchaseApple() async {
    final result = await AppleIAPService.instance.purchase();
    if (result.cancelled) {
      state = state.copyWith(isLoading: false);
      return false;
    }
    if (!result.success || result.jwsTransaction == null) {
      state = state.copyWith(isLoading: false, error: result.error);
      return false;
    }

    final userId = AuthService.instance.currentUser?.id;
    final token = AuthService.instance.accessToken;
    if (userId == null || token == null) {
      state = state.copyWith(isLoading: false, error: 'Not authenticated');
      return false;
    }

    final validated = await _callValidateRoute(_kAppleValidateUrl, {
      'jwsTransaction': result.jwsTransaction,
      'userId': userId,
      'appAccountToken': null,
    }, token);

    await checkStatus();
    return validated;
  }

  Future<bool> _purchaseGoogle() async {
    final result = await GoogleIAPService.instance.purchase();
    if (result.cancelled) {
      state = state.copyWith(isLoading: false);
      return false;
    }
    if (!result.success || result.purchaseToken == null) {
      state = state.copyWith(isLoading: false, error: result.error);
      return false;
    }

    final userId = AuthService.instance.currentUser?.id;
    final token = AuthService.instance.accessToken;
    if (userId == null || token == null) {
      state = state.copyWith(isLoading: false, error: 'Not authenticated');
      return false;
    }

    final validated = await _callValidateRoute(_kGoogleValidateUrl, {
      'purchaseToken': result.purchaseToken,
      'productId': kUmmatPlusYearlyProductId,
      'userId': userId,
    }, token);

    await checkStatus();
    return validated;
  }

  Future<bool> _callValidateRoute(
    String url,
    Map<String, dynamic> body,
    String token,
  ) async {
    try {
      final response = await http.post(
        Uri.parse(url),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode(body),
      );

      if (response.statusCode != 200) return false;
      final responseBody = jsonDecode(response.body) as Map<String, dynamic>;
      return responseBody['valid'] == true;
    } catch (_) {
      return false;
    }
  }

  // ── Restore flow ────────────────────────────────────────────────────────────

  /// Restore previous purchases (after reinstall or new device).
  Future<bool> restore() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      if (Platform.isIOS) {
        final restored = await AppleIAPService.instance.restorePurchases();
        // If there are restored transactions, validate the most recent one.
        if (restored.isNotEmpty) {
          final recent = restored.first;
          final receipt = recent['receipt'] as String? ?? '';
          final userId = AuthService.instance.currentUser?.id;
          final token = AuthService.instance.accessToken;
          if (userId != null && token != null && receipt.isNotEmpty) {
            await _callValidateRoute(_kAppleValidateUrl, {
              'jwsTransaction': receipt,
              'userId': userId,
              'appAccountToken': null,
            }, token);
          }
        }
      } else if (Platform.isAndroid) {
        final restored = await GoogleIAPService.instance.restorePurchases();
        if (restored.isNotEmpty) {
          final recent = restored.first;
          final tokenStr = recent['purchaseToken'] as String? ?? '';
          final userId = AuthService.instance.currentUser?.id;
          final token = AuthService.instance.accessToken;
          if (userId != null && token != null && tokenStr.isNotEmpty) {
            await _callValidateRoute(_kGoogleValidateUrl, {
              'purchaseToken': tokenStr,
              'productId': kUmmatPlusYearlyProductId,
              'userId': userId,
            }, token);
          }
        }
      }

      await checkStatus();
      return state.isPlus;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  /// Clear any displayed error.
  void clearError() {
    if (state.error != null) {
      state = state.copyWith(error: null);
    }
  }

}

/// Provider for subscription state.
///
/// Watch [subscriptionProvider] in any widget to react to Ummat+ status changes.
/// Use [subscriptionProvider.notifier] to call [purchase], [restore], or [checkStatus].
final subscriptionProvider =
    NotifierProvider<SubscriptionNotifier, SubscriptionState>(
  SubscriptionNotifier.new,
);
