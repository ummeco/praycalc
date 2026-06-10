package com.praycalc.app

import android.app.Activity
import com.android.billingclient.api.*
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel

class IAPPlugin(
    private val activity: Activity,
    flutterEngine: FlutterEngine,
) : MethodChannel.MethodCallHandler, PurchasesUpdatedListener {

    private val channel = MethodChannel(
        flutterEngine.dartExecutor.binaryMessenger,
        "com.praycalc/iap"
    )

    private var billingClient: BillingClient
    private var pendingPurchaseResult: MethodChannel.Result? = null

    init {
        channel.setMethodCallHandler(this)
        billingClient = BillingClient.newBuilder(activity)
            .setListener(this)
            .enablePendingPurchases()
            .build()
    }

    override fun onMethodCall(call: MethodCall, result: MethodChannel.Result) {
        when (call.method) {
            "getProducts" -> {
                val productIds = call.argument<List<String>>("productIds")
                if (productIds == null) {
                    result.error("INVALID_ARGS", "productIds required", null)
                    return
                }
                getProducts(productIds, result)
            }
            "purchase" -> {
                val productId = call.argument<String>("productId")
                if (productId == null) {
                    result.error("INVALID_ARGS", "productId required", null)
                    return
                }
                purchase(productId, result)
            }
            "restorePurchases" -> restorePurchases(result)
            "getSubscriptionStatus" -> getSubscriptionStatus(result)
            else -> result.notImplemented()
        }
    }

    private fun ensureConnected(onConnected: () -> Unit, onError: (String) -> Unit) {
        if (billingClient.isReady) {
            onConnected()
            return
        }
        billingClient.startConnection(object : BillingClientStateListener {
            override fun onBillingSetupFinished(billingResult: BillingResult) {
                if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                    onConnected()
                } else {
                    onError("Billing setup failed: ${billingResult.debugMessage}")
                }
            }

            override fun onBillingServiceDisconnected() {
                // Will reconnect on next call
            }
        })
    }

    private fun getProducts(productIds: List<String>, result: MethodChannel.Result) {
        ensureConnected(
            onConnected = {
                val productList = productIds.map { id ->
                    QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(id)
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build()
                }
                val params = QueryProductDetailsParams.newBuilder()
                    .setProductList(productList)
                    .build()

                billingClient.queryProductDetailsAsync(params) { billingResult, productDetailsList ->
                    if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                        val mapped = productDetailsList.map { details ->
                            val offerDetails = details.subscriptionOfferDetails?.firstOrNull()
                            val pricingPhase = offerDetails?.pricingPhases
                                ?.pricingPhaseList?.firstOrNull()
                            mapOf(
                                "productId" to details.productId,
                                "displayName" to details.name,
                                "description" to details.description,
                                "price" to (pricingPhase?.priceAmountMicros?.let {
                                    (it / 1_000_000.0).toString()
                                } ?: "0"),
                                "displayPrice" to (pricingPhase?.formattedPrice ?: ""),
                                "type" to "subscription",
                            )
                        }
                        activity.runOnUiThread { result.success(mapped) }
                    } else {
                        activity.runOnUiThread {
                            result.error(
                                "PRODUCT_FETCH_FAILED",
                                billingResult.debugMessage,
                                null
                            )
                        }
                    }
                }
            },
            onError = { msg -> result.error("CONNECTION_FAILED", msg, null) }
        )
    }

    private fun purchase(productId: String, result: MethodChannel.Result) {
        ensureConnected(
            onConnected = {
                val productList = listOf(
                    QueryProductDetailsParams.Product.newBuilder()
                        .setProductId(productId)
                        .setProductType(BillingClient.ProductType.SUBS)
                        .build()
                )
                val params = QueryProductDetailsParams.newBuilder()
                    .setProductList(productList)
                    .build()

                billingClient.queryProductDetailsAsync(params) { billingResult, productDetailsList ->
                    if (billingResult.responseCode != BillingClient.BillingResponseCode.OK ||
                        productDetailsList.isEmpty()
                    ) {
                        activity.runOnUiThread {
                            result.error(
                                "PRODUCT_NOT_FOUND",
                                "Product $productId not found",
                                null
                            )
                        }
                        return@queryProductDetailsAsync
                    }

                    val productDetails = productDetailsList.first()
                    val offerToken = productDetails.subscriptionOfferDetails
                        ?.firstOrNull()?.offerToken

                    if (offerToken == null) {
                        activity.runOnUiThread {
                            result.error("NO_OFFER", "No offer available", null)
                        }
                        return@queryProductDetailsAsync
                    }

                    val flowParams = BillingFlowParams.newBuilder()
                        .setProductDetailsParamsList(
                            listOf(
                                BillingFlowParams.ProductDetailsParams.newBuilder()
                                    .setProductDetails(productDetails)
                                    .setOfferToken(offerToken)
                                    .build()
                            )
                        )
                        .build()

                    pendingPurchaseResult = result
                    activity.runOnUiThread {
                        billingClient.launchBillingFlow(activity, flowParams)
                    }
                }
            },
            onError = { msg -> result.error("CONNECTION_FAILED", msg, null) }
        )
    }

    override fun onPurchasesUpdated(
        billingResult: BillingResult,
        purchases: MutableList<Purchase>?
    ) {
        val result = pendingPurchaseResult ?: return
        pendingPurchaseResult = null

        when (billingResult.responseCode) {
            BillingClient.BillingResponseCode.OK -> {
                val purchase = purchases?.firstOrNull()
                if (purchase != null) {
                    // Acknowledge the purchase
                    if (purchase.purchaseState == Purchase.PurchaseState.PURCHASED &&
                        !purchase.isAcknowledged
                    ) {
                        val ackParams = AcknowledgePurchaseParams.newBuilder()
                            .setPurchaseToken(purchase.purchaseToken)
                            .build()
                        billingClient.acknowledgePurchase(ackParams) { /* fire and forget */ }
                    }
                    activity.runOnUiThread {
                        result.success(
                            mapOf(
                                "status" to "purchased",
                                "purchaseToken" to purchase.purchaseToken,
                                "orderId" to (purchase.orderId ?: ""),
                                "productId" to (purchase.products.firstOrNull() ?: ""),
                            )
                        )
                    }
                } else {
                    activity.runOnUiThread {
                        result.error("PURCHASE_FAILED", "No purchase returned", null)
                    }
                }
            }
            BillingClient.BillingResponseCode.USER_CANCELED -> {
                activity.runOnUiThread {
                    result.success(mapOf("status" to "cancelled"))
                }
            }
            else -> {
                activity.runOnUiThread {
                    result.error(
                        "PURCHASE_FAILED",
                        billingResult.debugMessage,
                        null
                    )
                }
            }
        }
    }

    private fun restorePurchases(result: MethodChannel.Result) {
        ensureConnected(
            onConnected = {
                val params = QueryPurchasesParams.newBuilder()
                    .setProductType(BillingClient.ProductType.SUBS)
                    .build()
                billingClient.queryPurchasesAsync(params) { billingResult, purchases ->
                    if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                        val mapped = purchases
                            .filter { it.purchaseState == Purchase.PurchaseState.PURCHASED }
                            .map { purchase ->
                                mapOf(
                                    "purchaseToken" to purchase.purchaseToken,
                                    "orderId" to (purchase.orderId ?: ""),
                                    "productId" to (purchase.products.firstOrNull() ?: ""),
                                )
                            }
                        activity.runOnUiThread { result.success(mapped) }
                    } else {
                        activity.runOnUiThread {
                            result.error(
                                "RESTORE_FAILED",
                                billingResult.debugMessage,
                                null
                            )
                        }
                    }
                }
            },
            onError = { msg -> result.error("CONNECTION_FAILED", msg, null) }
        )
    }

    private fun getSubscriptionStatus(result: MethodChannel.Result) {
        ensureConnected(
            onConnected = {
                val params = QueryPurchasesParams.newBuilder()
                    .setProductType(BillingClient.ProductType.SUBS)
                    .build()
                billingClient.queryPurchasesAsync(params) { billingResult, purchases ->
                    if (billingResult.responseCode == BillingClient.BillingResponseCode.OK) {
                        val active = purchases
                            .filter { it.purchaseState == Purchase.PurchaseState.PURCHASED }
                            .map { purchase ->
                                mapOf(
                                    "productId" to (purchase.products.firstOrNull() ?: ""),
                                    "purchaseToken" to purchase.purchaseToken,
                                    "orderId" to (purchase.orderId ?: ""),
                                    "isActive" to true,
                                    "isAutoRenewing" to purchase.isAutoRenewing,
                                )
                            }
                        activity.runOnUiThread { result.success(active) }
                    } else {
                        activity.runOnUiThread {
                            result.error(
                                "STATUS_FAILED",
                                billingResult.debugMessage,
                                null
                            )
                        }
                    }
                }
            },
            onError = { msg -> result.error("CONNECTION_FAILED", msg, null) }
        )
    }
}
