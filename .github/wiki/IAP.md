# In-App Purchases (IAP)

PrayCalc uses native in-app purchase APIs on iOS and Android. The implementation uses StoreKit 2 on iOS and Google Play Billing on Android, both via native Flutter plugins.

## iOS — StoreKit 2

Plugin: `flutter/ios/PrayCalcApp/IAPPlugin.swift`

StoreKit 2 is used for all purchase flows. It provides async/await APIs, automatic transaction verification, and built-in receipt validation.

**Product IDs** are defined in App Store Connect and referenced via `StoreKit/Products.storekit` in the Xcode project.

### Purchase flow

1. App calls `IAPPlugin.loadProducts()` — returns available `Product` objects from StoreKit
2. User taps purchase — app calls `IAPPlugin.purchase(productId)`
3. StoreKit presents the payment sheet
4. On success, `Transaction.currentEntitlement(for:)` is polled to verify entitlement
5. App unlocks the feature and calls `Transaction.finish()` to clear the queue

### Restore purchases

Call `IAPPlugin.restorePurchases()` — this calls `AppStore.sync()` which re-fetches the signed transaction history from Apple. Works across device reinstalls.

### Subscription management

Users manage subscriptions from the iOS Settings app or via the App Store subscriptions page. The app links there directly from the account screen.

### Sandbox testing

Use a Sandbox test account (App Store Connect > Users and Access > Sandbox) to test purchases without real payment. Sandbox purchases expire rapidly (e.g. 1-month subscription = 5 minutes in sandbox).

## Android — Google Play Billing

Plugin: `flutter/android/app/src/main/kotlin/com/praycalc/app/IAPPlugin.kt`

Uses Google Play Billing Library (latest stable). All billing operations run on the main thread via the BillingClient.

### Purchase flow

1. App initialises `BillingClient` and calls `queryProductDetailsAsync()` to load SKUs
2. User taps purchase — app calls `launchBillingFlow()` with a `BillingFlowParams`
3. Google Play presents the payment sheet
4. On purchase result, app calls `queryPurchasesAsync()` and acknowledges the purchase server-side
5. Feature is unlocked and `BillingClient.acknowledgePurchase()` is called within 3 days (Google requirement)

### Restore purchases

Call `BillingClient.queryPurchasesAsync(ProductType.SUBS)` — returns all active subscriptions tied to the Google account.

### Testing

Use the Google Play License Testing accounts (configured in Google Play Console > Setup > License Testing). The test account bypasses real payment and allows testing all purchase states including `PURCHASED`, `CANCELED`, `PENDING`, and `ITEM_ALREADY_OWNED`.

## Ummat+ Features

The following features require an active Ummat+ subscription:

- Smart home prayer automations
- TV Command Center (manage connected TVs)
- Priority adhan notifications
- Premium adhan voices
- Ad-free experience

See [[Smart-Home]] for the full smart home feature list.

## See Also

- [[Features]] — full feature list with status
- [[Account-Deletion]] — deleting an account cancels active subscriptions
- Apple documentation: [StoreKit 2](https://developer.apple.com/storekit/)
- Google documentation: [Play Billing Library](https://developer.android.com/google/play/billing)
