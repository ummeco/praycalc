/// S6-10 — Google Play Billing v6 IAP service.
///
/// Delegates to the native IAPPlugin.kt (BillingClient v6) via the existing
/// method channel [com.praycalc/iap].
///
/// Key design choices:
/// - Play Billing v6 backend via BillingClient.
/// - Purchases acknowledged via IAPPlugin.kt after server validation succeeds.
/// - Server validation via [praycalc.com/api/iap/google/validate].
/// - TEST MODE: sandbox license testers in Play Console until GOOGLE_IAP_SANDBOX=false.
library;

import 'dart:async';
import 'dart:io' show Platform;

import 'package:flutter/services.dart';

import 'products.dart';

/// Result of a Google Play purchase attempt.
class GooglePurchaseResult {
  final bool success;
  final bool cancelled;
  final String? purchaseToken;
  final String? orderId;
  final String? error;

  const GooglePurchaseResult._({
    required this.success,
    required this.cancelled,
    this.purchaseToken,
    this.orderId,
    this.error,
  });

  factory GooglePurchaseResult.purchased({
    required String purchaseToken,
    String? orderId,
  }) =>
      GooglePurchaseResult._(
        success: true,
        cancelled: false,
        purchaseToken: purchaseToken,
        orderId: orderId,
      );

  factory GooglePurchaseResult.userCancelled() =>
      const GooglePurchaseResult._(success: false, cancelled: true);

  factory GooglePurchaseResult.failed(String error) =>
      GooglePurchaseResult._(success: false, cancelled: false, error: error);
}

/// Google Play Billing v6 IAP service for PrayCalc.
///
/// Only operational on Android. On other platforms, all methods return
/// [GooglePurchaseResult.failed] immediately.
class GoogleIAPService {
  GoogleIAPService._();
  static final instance = GoogleIAPService._();

  static const _channel = MethodChannel('com.praycalc/iap');

  bool get isAvailable => Platform.isAndroid;

  /// Load available products from Google Play.
  Future<List<Map<String, dynamic>>> loadProducts() async {
    if (!isAvailable) return [];
    try {
      final result = await _channel.invokeMethod<List>('getProducts', {
        'productIds': kAllSubscriptionProductIds,
      });
      if (result == null) return [];
      return result
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList();
    } on MissingPluginException {
      return [];
    } on PlatformException {
      return [];
    }
  }

  /// Initiate purchase of [kUmmatPlusYearlyProductId].
  ///
  /// After the Play billing flow completes, the purchase must be acknowledged
  /// via the server (IAPPlugin.kt handles acknowledgement after server validation
  /// returns success in the validate route).
  Future<GooglePurchaseResult> purchase() async {
    if (!isAvailable) {
      return GooglePurchaseResult.failed('Play Billing not available on this platform');
    }

    try {
      final result = await _channel.invokeMethod<Map>('purchase', {
        'productId': kUmmatPlusYearlyProductId,
      });

      if (result == null) {
        return GooglePurchaseResult.failed('No response from Play Billing');
      }

      final status = result['status'] as String?;
      switch (status) {
        case 'purchased':
          final token = result['purchaseToken'] as String? ?? '';
          final orderId = result['orderId'] as String?;
          return GooglePurchaseResult.purchased(
            purchaseToken: token,
            orderId: orderId,
          );

        case 'cancelled':
          return GooglePurchaseResult.userCancelled();

        case 'pending':
          return GooglePurchaseResult.failed('Purchase is pending');

        default:
          return GooglePurchaseResult.failed('Unknown billing status: $status');
      }
    } on MissingPluginException {
      return GooglePurchaseResult.failed('IAP plugin not registered');
    } on PlatformException catch (e) {
      return GooglePurchaseResult.failed(e.message ?? 'Play Billing error');
    }
  }

  /// Restore previous purchases (e.g., after reinstall or new device).
  ///
  /// Returns list of active purchase maps from Play Billing queryPurchasesAsync.
  Future<List<Map<String, dynamic>>> restorePurchases() async {
    if (!isAvailable) return [];
    try {
      final result = await _channel.invokeMethod<List>('restorePurchases');
      if (result == null) return [];
      return result
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList();
    } on MissingPluginException {
      return [];
    } on PlatformException {
      return [];
    }
  }

  /// Get current subscription status from Play Billing.
  Future<List<Map<String, dynamic>>> getSubscriptionStatus() async {
    if (!isAvailable) return [];
    try {
      final result = await _channel.invokeMethod<List>('getSubscriptionStatus');
      if (result == null) return [];
      return result
          .map((e) => Map<String, dynamic>.from(e as Map))
          .toList();
    } on MissingPluginException {
      return [];
    } on PlatformException {
      return [];
    }
  }
}
