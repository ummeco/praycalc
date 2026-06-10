import 'dart:async';

import 'package:flutter/services.dart';

/// In-app purchase service for Ummat+ subscription.
///
/// Wraps platform-specific purchase APIs:
/// - iOS: StoreKit 2 via method channel
/// - Android: Google Play Billing via method channel
///
/// The actual native implementations are in:
/// - ios/Runner/IAPPlugin.swift (StoreKit 2)
/// - android/app/src/main/kotlin/.../IAPPlugin.kt (Play Billing)
///
/// Production flow:
/// 1. App calls [fetchProducts] to get product details from store
/// 2. User taps Subscribe → [purchase] shows native purchase sheet
/// 3. On success, receipt sent to backend [verifyReceipt] for server validation
/// 4. Backend activates subscription in umm_subscriptions table
/// 5. App refreshes subscription status from backend
class IAPService {
  IAPService._();
  static final instance = IAPService._();

  static const _channel = MethodChannel('com.praycalc.app/iap');

  static const productIdYearly = 'ummat_plus_yearly';
  bool _initialized = false;
  final _purchaseController = StreamController<PurchaseResult>.broadcast();
  Stream<PurchaseResult> get purchaseStream => _purchaseController.stream;

  /// Initialize the IAP service. Call once at app startup.
  Future<void> init() async {
    if (_initialized) return;

    try {
      _channel.setMethodCallHandler(_handlePlatformMessage);
      await _channel.invokeMethod<void>('initialize');
      _initialized = true;
    } on MissingPluginException {
      // Native plugin not registered (e.g., running on desktop/web)
    } on PlatformException catch (e) {
      _purchaseController.add(PurchaseResult.error(e.message ?? 'Init failed'));
    }
  }

  /// Fetch available products from the store.
  Future<List<ProductInfo>> fetchProducts() async {
    try {
      final result = await _channel.invokeMethod<List>('fetchProducts', {
        'productIds': [productIdYearly],
      });

      if (result == null) return [];

      return result.map((item) {
        final map = Map<String, dynamic>.from(item as Map);
        return ProductInfo(
          id: map['id'] as String,
          title: map['title'] as String,
          description: map['description'] as String,
          price: map['price'] as String,
          priceAmount: (map['priceAmount'] as num).toDouble(),
          currencyCode: map['currencyCode'] as String,
        );
      }).toList();
    } on PlatformException {
      return [];
    }
  }

  /// Initiate a purchase for the given product.
  Future<bool> purchase(String productId) async {
    try {
      final result = await _channel.invokeMethod<bool>('purchase', {
        'productId': productId,
      });
      return result ?? false;
    } on PlatformException catch (e) {
      _purchaseController.add(PurchaseResult.error(e.message ?? 'Purchase failed'));
      return false;
    }
  }

  /// Restore previous purchases (e.g., after reinstall).
  Future<bool> restorePurchases() async {
    try {
      final result = await _channel.invokeMethod<bool>('restorePurchases');
      return result ?? false;
    } on PlatformException catch (e) {
      _purchaseController.add(PurchaseResult.error(e.message ?? 'Restore failed'));
      return false;
    }
  }

  /// Handle incoming messages from native IAP plugin.
  Future<dynamic> _handlePlatformMessage(MethodCall call) async {
    switch (call.method) {
      case 'onPurchaseSuccess':
        final receipt = call.arguments as String?;
        if (receipt != null) {
          _purchaseController.add(PurchaseResult.success(receipt));
        }
        break;

      case 'onPurchaseFailed':
        final error = call.arguments as String? ?? 'Unknown error';
        _purchaseController.add(PurchaseResult.error(error));
        break;

      case 'onPurchaseCancelled':
        _purchaseController.add(PurchaseResult.cancelled());
        break;

      case 'onRestored':
        final receipt = call.arguments as String?;
        if (receipt != null) {
          _purchaseController.add(PurchaseResult.restored(receipt));
        }
        break;
    }
    return null;
  }

  void dispose() {
    _purchaseController.close();
  }
}

/// Result of a purchase attempt.
class PurchaseResult {
  final PurchaseStatus status;
  final String? receipt;
  final String? error;

  const PurchaseResult._({required this.status, this.receipt, this.error});

  factory PurchaseResult.success(String receipt) =>
      PurchaseResult._(status: PurchaseStatus.success, receipt: receipt);

  factory PurchaseResult.error(String error) =>
      PurchaseResult._(status: PurchaseStatus.error, error: error);

  factory PurchaseResult.cancelled() =>
      const PurchaseResult._(status: PurchaseStatus.cancelled);

  factory PurchaseResult.restored(String receipt) =>
      PurchaseResult._(status: PurchaseStatus.restored, receipt: receipt);
}

enum PurchaseStatus { success, error, cancelled, restored }

/// Product information from the app store.
class ProductInfo {
  final String id;
  final String title;
  final String description;
  final String price;
  final double priceAmount;
  final String currencyCode;

  const ProductInfo({
    required this.id,
    required this.title,
    required this.description,
    required this.price,
    required this.priceAmount,
    required this.currencyCode,
  });
}
