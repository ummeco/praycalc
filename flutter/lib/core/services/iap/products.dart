/// S6-07 — StoreKit 2 / Play Billing product constants.
///
/// Product IDs must match exactly what is configured in:
/// - App Store Connect (Ummat+ in-app purchase, auto-renewable subscription)
/// - Google Play Console (subscription product, same ID)
library;

/// Yearly Ummat+ subscription — $9.99 / year.
const kUmmatPlusYearlyProductId = 'app.praycalc.ummat_plus_yearly';

/// All subscription product IDs offered by PrayCalc.
const kAllSubscriptionProductIds = <String>[kUmmatPlusYearlyProductId];
