import Flutter
import StoreKit

@available(iOS 15.0, *)
class IAPPlugin: NSObject, FlutterPlugin {
    private var transactionObserverTask: Task<Void, Never>?

    static func register(with registrar: FlutterPluginRegistrar) {
        let channel = FlutterMethodChannel(
            name: "com.praycalc/iap",
            binaryMessenger: registrar.messenger()
        )
        let instance = IAPPlugin()
        registrar.addMethodCallDelegate(instance, channel: channel)
    }

    func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        switch call.method {
        case "getProducts":
            guard let args = call.arguments as? [String: Any],
                  let productIds = args["productIds"] as? [String] else {
                result(FlutterError(code: "INVALID_ARGS", message: "productIds required", details: nil))
                return
            }
            Task { await getProducts(productIds: productIds, result: result) }

        case "purchase":
            guard let args = call.arguments as? [String: Any],
                  let productId = args["productId"] as? String else {
                result(FlutterError(code: "INVALID_ARGS", message: "productId required", details: nil))
                return
            }
            Task { await purchase(productId: productId, result: result) }

        case "restorePurchases":
            Task { await restorePurchases(result: result) }

        case "getSubscriptionStatus":
            Task { await getSubscriptionStatus(result: result) }

        default:
            result(FlutterMethodNotImplemented)
        }
    }

    private func getProducts(productIds: [String], result: @escaping FlutterResult) async {
        do {
            let products = try await Product.products(for: Set(productIds))
            let mapped = products.map { product -> [String: Any] in
                return [
                    "productId": product.id,
                    "displayName": product.displayName,
                    "description": product.description,
                    "price": product.price.description,
                    "displayPrice": product.displayPrice,
                    "type": product.type == .autoRenewable ? "subscription" : "other",
                ]
            }
            result(mapped)
        } catch {
            result(FlutterError(code: "PRODUCT_FETCH_FAILED", message: error.localizedDescription, details: nil))
        }
    }

    private func purchase(productId: String, result: @escaping FlutterResult) async {
        do {
            let products = try await Product.products(for: [productId])
            guard let product = products.first else {
                result(FlutterError(code: "PRODUCT_NOT_FOUND", message: "Product \(productId) not found", details: nil))
                return
            }

            let purchaseResult = try await product.purchase()

            switch purchaseResult {
            case .success(let verification):
                switch verification {
                case .verified(let transaction):
                    await transaction.finish()
                    let receiptData = self.receiptData()
                    result([
                        "status": "purchased",
                        "transactionId": String(transaction.id),
                        "originalTransactionId": String(transaction.originalID),
                        "productId": transaction.productID,
                        "receipt": receiptData ?? "",
                    ])
                case .unverified(_, let error):
                    result(FlutterError(code: "VERIFICATION_FAILED", message: error.localizedDescription, details: nil))
                }
            case .userCancelled:
                result(["status": "cancelled"])
            case .pending:
                result(["status": "pending"])
            @unknown default:
                result(["status": "unknown"])
            }
        } catch {
            result(FlutterError(code: "PURCHASE_FAILED", message: error.localizedDescription, details: nil))
        }
    }

    private func restorePurchases(result: @escaping FlutterResult) async {
        var restoredTransactions: [[String: Any]] = []

        for await verificationResult in Transaction.currentEntitlements {
            if case .verified(let transaction) = verificationResult {
                restoredTransactions.append([
                    "transactionId": String(transaction.id),
                    "originalTransactionId": String(transaction.originalID),
                    "productId": transaction.productID,
                    "expirationDate": transaction.expirationDate?.timeIntervalSince1970 ?? 0,
                ])
            }
        }

        result(restoredTransactions)
    }

    private func getSubscriptionStatus(result: @escaping FlutterResult) async {
        var activeSubscriptions: [[String: Any]] = []

        for await verificationResult in Transaction.currentEntitlements {
            if case .verified(let transaction) = verificationResult,
               transaction.productType == .autoRenewable {
                let isActive: Bool
                if let expirationDate = transaction.expirationDate {
                    isActive = expirationDate > Date()
                } else {
                    isActive = false
                }

                activeSubscriptions.append([
                    "productId": transaction.productID,
                    "transactionId": String(transaction.id),
                    "originalTransactionId": String(transaction.originalID),
                    "isActive": isActive,
                    "expirationDate": transaction.expirationDate?.timeIntervalSince1970 ?? 0,
                    "receipt": receiptData() ?? "",
                ])
            }
        }

        result(activeSubscriptions)
    }

    private func receiptData() -> String? {
        guard let receiptURL = Bundle.main.appStoreReceiptURL,
              let receiptData = try? Data(contentsOf: receiptURL) else {
            return nil
        }
        return receiptData.base64EncodedString()
    }
}
