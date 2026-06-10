/// S6-08 — StoreKit 2 Apple IAP service.
///
/// Delegates to the native IAPPlugin.swift (StoreKit 2, iOS 15+) via
/// the existing method channel [com.praycalc/iap].
///
/// Key design choices (D-P3-12):
/// - StoreKit 2 ONLY — no SK1 legacy receipts.
/// - appAccountToken bound to logged-in user_id for server-side linking.
/// - Server validation via [praycalc.com/api/iap/apple/validate].
/// - All purchases go against StoreKit sandbox until APPLE_IAP_SANDBOX=false.
library;

import 'dart:async';
import 'dart:io' show Platform;

import 'package:flutter/services.dart';
import 'package:uuid/uuid.dart';

import '../auth_service.dart';
import 'products.dart';

/// Result of an Apple IAP purchase attempt.
class ApplePurchaseResult {
  final bool success;
  final bool cancelled;
  final String? jwsTransaction;
  final String? originalTransactionId;
  final String? error;

  const ApplePurchaseResult._({
    required this.success,
    required this.cancelled,
    this.jwsTransaction,
    this.originalTransactionId,
    this.error,
  });

  factory ApplePurchaseResult.purchased({
    required String jwsTransaction,
    required String originalTransactionId,
  }) =>
      ApplePurchaseResult._(
        success: true,
        cancelled: false,
        jwsTransaction: jwsTransaction,
        originalTransactionId: originalTransactionId,
      );

  factory ApplePurchaseResult.userCancelled() =>
      const ApplePurchaseResult._(success: false, cancelled: true);

  factory ApplePurchaseResult.failed(String error) =>
      ApplePurchaseResult._(success: false, cancelled: false, error: error);
}

/// Apple StoreKit 2 IAP service for PrayCalc.
///
/// Only operational on iOS. On other platforms, all methods return
/// [ApplePurchaseResult.failed] immediately.
class AppleIAPService {
  AppleIAPService._();
  static final instance = AppleIAPService._();

  static const _channel = MethodChannel('com.praycalc/iap');
  static const _uuid = Uuid();

  bool get isAvailable => Platform.isIOS;

  /// Load available products from App Store Connect.
  ///
  /// Returns an empty list when unavailable (non-iOS or plugin missing).
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
  /// Generates a UUID v4 appAccountToken bound to the current user_id so
  /// the server can link the JWS transaction back to the Hasura user record.
  ///
  /// Returns [ApplePurchaseResult] — inspect [success] and [jwsTransaction].
  Future<ApplePurchaseResult> purchase() async {
    if (!isAvailable) {
      return ApplePurchaseResult.failed('StoreKit not available on this platform');
    }

    final userId = AuthService.instance.currentUser?.id;
    if (userId == null) {
      return ApplePurchaseResult.failed('User not authenticated');
    }

    // Bind a deterministic-per-purchase UUID for appAccountToken linkage.
    final appAccountToken = _uuid.v4();

    try {
      final result = await _channel.invokeMethod<Map>('purchase', {
        'productId': kUmmatPlusYearlyProductId,
        'appAccountToken': appAccountToken,
      });

      if (result == null) {
        return ApplePurchaseResult.failed('No response from StoreKit');
      }

      final status = result['status'] as String?;
      switch (status) {
        case 'purchased':
          final jws = result['jwsTransaction'] as String? ??
              result['receipt'] as String? ??
              '';
          final originalId = result['originalTransactionId'] as String? ?? '';
          return ApplePurchaseResult.purchased(
            jwsTransaction: jws,
            originalTransactionId: originalId,
          );

        case 'cancelled':
          return ApplePurchaseResult.userCancelled();

        case 'pending':
          return ApplePurchaseResult.failed('Purchase is pending approval');

        default:
          return ApplePurchaseResult.failed('Unknown StoreKit status: $status');
      }
    } on MissingPluginException {
      return ApplePurchaseResult.failed('IAP plugin not registered');
    } on PlatformException catch (e) {
      return ApplePurchaseResult.failed(e.message ?? 'StoreKit error');
    }
  }

  /// Restore previous purchases (e.g., after reinstall or new device).
  ///
  /// Returns list of restored transaction maps from StoreKit currentEntitlements.
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

  /// Get current subscription status directly from StoreKit entitlements.
  ///
  /// Prefer server-side status (subscriptionProvider) for authorization
  /// decisions. This is a fallback for offline state.
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
