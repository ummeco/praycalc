import 'dart:async';
import 'dart:convert';
import 'dart:io' show Platform;

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:http/http.dart' as http;

import '../services/auth_service.dart';
import '../services/iap_service.dart';

/// Smart service URL for billing endpoints.
/// Billing runs on praycalc-smart (port 4010), NOT the Hasura Auth service.
const _kSmartUrl = String.fromEnvironment(
  'SMART_SERVICE_URL',
  defaultValue: 'http://127.0.0.1:4010',
);

/// Subscription plan tiers.
enum SubscriptionPlan { free, plus }

/// Subscription state exposed to the UI.
class SubscriptionState {
  final SubscriptionPlan plan;
  final bool isActive;
  final DateTime? expiresAt;
  final bool isLoading;
  final String? error;

  const SubscriptionState({
    this.plan = SubscriptionPlan.free,
    this.isActive = false,
    this.expiresAt,
    this.isLoading = false,
    this.error,
  });

  bool get isPlus => plan == SubscriptionPlan.plus && isActive;

  SubscriptionState copyWith({
    SubscriptionPlan? plan,
    bool? isActive,
    DateTime? expiresAt,
    bool? isLoading,
    String? error,
  }) =>
      SubscriptionState(
        plan: plan ?? this.plan,
        isActive: isActive ?? this.isActive,
        expiresAt: expiresAt ?? this.expiresAt,
        isLoading: isLoading ?? this.isLoading,
        error: error,
      );
}

/// Manages subscription status and purchase flow.
///
/// Fetches billing status from the shared Ummat backend and delegates
/// purchases to StoreKit 2 (iOS) and Play Billing (Android) via
/// [IAPService].
class SubscriptionNotifier extends Notifier<SubscriptionState> {
  @override
  SubscriptionState build() {
    // Auto-check status if the user is authenticated.
    if (AuthService.instance.isAuthenticated) {
      Future.microtask(checkStatus);
    }
    return const SubscriptionState();
  }

  /// Fetch the current subscription status from the backend.
  Future<void> checkStatus() async {
    final token = AuthService.instance.accessToken;
    if (token == null) {
      state = const SubscriptionState();
      return;
    }

    state = state.copyWith(isLoading: true, error: null);

    try {
      final response = await http.get(
        Uri.parse('$_kSmartUrl/billing/status'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode != 200) {
        // Backend may not have billing endpoint yet. Default to free.
        state = const SubscriptionState();
        return;
      }

      final body = jsonDecode(response.body) as Map<String, dynamic>;
      final planStr = body['plan'] as String? ?? 'free';
      // Server returns 'status' (string) and 'currentPeriodEnd', not 'isActive'/'expiresAt'.
      final statusStr = body['status'] as String? ?? 'none';
      final active = statusStr == 'active' || statusStr == 'trialing';
      final expiresStr = (body['currentPeriodEnd'] ?? body['expiresAt']) as String?;

      state = SubscriptionState(
        plan: planStr == 'plus' ? SubscriptionPlan.plus : SubscriptionPlan.free,
        isActive: active,
        expiresAt:
            expiresStr != null ? DateTime.tryParse(expiresStr) : null,
      );
    } catch (e) {
      // Network error or backend unavailable. Keep current state.
      state = state.copyWith(isLoading: false, error: e.toString());
    }
  }

  StreamSubscription<PurchaseResult>? _purchaseSub;

  /// Initiate an in-app purchase for Ummat+.
  ///
  /// Flow:
  /// 1. Show native purchase sheet (StoreKit 2 / Play Billing)
  /// 2. On success, send receipt to backend for server-side validation
  /// 3. Backend validates with Apple/Google and activates subscription
  /// 4. Refresh local state from backend
  Future<bool> purchase() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final iap = IAPService.instance;
      await iap.init();

      // Listen for purchase result from native platform.
      final completer = Completer<bool>();
      _purchaseSub?.cancel();
      _purchaseSub = iap.purchaseStream.listen((result) async {
        switch (result.status) {
          case PurchaseStatus.success:
          case PurchaseStatus.restored:
            if (result.receipt != null) {
              await _verifyReceipt(result.receipt!);
            }
            await checkStatus();
            completer.complete(state.isPlus);
          case PurchaseStatus.cancelled:
            state = state.copyWith(isLoading: false);
            completer.complete(false);
          case PurchaseStatus.error:
            state = state.copyWith(isLoading: false, error: result.error);
            completer.complete(false);
        }
        _purchaseSub?.cancel();
      });

      final started = await iap.purchase(IAPService.productIdYearly);
      if (!started) {
        _purchaseSub?.cancel();
        state = state.copyWith(
          isLoading: false,
          error: 'Could not start purchase. Check your device settings.',
        );
        return false;
      }

      return await completer.future;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  /// Restore a previous purchase (e.g., after reinstall or new device).
  Future<bool> restore() async {
    state = state.copyWith(isLoading: true, error: null);

    try {
      final iap = IAPService.instance;
      await iap.init();

      final completer = Completer<bool>();
      _purchaseSub?.cancel();
      _purchaseSub = iap.purchaseStream.listen((result) async {
        if (result.status == PurchaseStatus.restored && result.receipt != null) {
          await _verifyReceipt(result.receipt!);
        }
        await checkStatus();
        completer.complete(state.isPlus);
        _purchaseSub?.cancel();
      });

      final started = await iap.restorePurchases();
      if (!started) {
        _purchaseSub?.cancel();
        // Fallback: just re-check backend status.
        await checkStatus();
        return state.isPlus;
      }

      return await completer.future;
    } catch (e) {
      state = state.copyWith(isLoading: false, error: e.toString());
      return false;
    }
  }

  /// Send receipt to backend for server-side validation.
  Future<void> _verifyReceipt(String receipt) async {
    final token = AuthService.instance.accessToken;
    if (token == null) return;

    try {
      await http.post(
        Uri.parse('$_kSmartUrl/billing/verify-receipt'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
        body: jsonEncode({
          'platform': Platform.isIOS ? 'ios' : 'android',
          'receipt': receipt,
          'productId': IAPService.productIdYearly,
        }),
      );
    } catch (_) {
      // Backend verification failure is non-fatal; status check will catch it.
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
final subscriptionProvider =
    NotifierProvider<SubscriptionNotifier, SubscriptionState>(
  SubscriptionNotifier.new,
);
