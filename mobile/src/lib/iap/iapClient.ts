/**
 * Purpose: Thin adapter over `react-native-iap` that reproduces the exact
 *   surface (`connectAsync`, `getProductsAsync`, `purchaseItemAsync`,
 *   `getPurchaseHistoryAsync`, `setPurchaseListener`, `finishTransactionAsync`,
 *   `IAPResponseCode`, `InAppPurchase`) that `expo-in-app-purchases` used to
 *   provide — so `IAPListener.ts` and `SubscriptionScreen.tsx` only need to
 *   change their import statement (`'expo-in-app-purchases'` ->
 *   `'./iapClient'` / `'../../lib/iap/iapClient'`), not their call sites.
 *   `expo-in-app-purchases` was abandoned in 2022 (unsupported since ~SDK 47)
 *   and its Play Billing Library version is too old for current Play Console
 *   submissions — see MOB-2 in the W5 gap-closure findings.
 * Inputs: `react-native-iap@14.2.3` (the Nitro-modules line, pinned to the
 *   last 14.x patch that links `billing-ktx:8.0.0` directly instead of the
 *   `openiap-google` native library — 14.3.0+ switch to `openiap-google`,
 *   whose later releases are compiled with Kotlin 2.2.x metadata that Expo
 *   SDK 53's `expo-root-project` Gradle plugin cannot yet configure. 8.0.0 is
 *   also the minimum Play Billing Library Google now enforces on new/updated
 *   Play Console listings ahead of its Nov 1, 2026 deadline. Requires the
 *   `react-native-iap` Expo config plugin (registered in app.json) to wire
 *   the native billing dependency + `com.android.vending.BILLING` permission
 *   and select the `play` product flavor, plus `react-native-nitro-modules`
 *   as a peer dependency).
 * Outputs: Same 6-function/2-type surface as the old `expo-in-app-purchases`
 *   import, backed by `react-native-iap`'s `initConnection` / `fetchProducts` /
 *   `requestPurchase` / `purchaseUpdatedListener` / `finishTransaction`.
 * Constraints:
 *   - Only the SUBSCRIPTION flow is implemented (`praycalc_pro_monthly` /
 *     `praycalc_pro_annual` are subscription SKUs) — one-time consumable
 *     purchases are out of scope, matching the app's actual product catalog.
 *   - Android subscriptions require a per-SKU offer token (Billing Library
 *     v5+ "base plans") that only comes back from `fetchProducts()` — it is
 *     cached here (from `subscriptionOfferDetailsAndroid[0].offerToken`) and
 *     consumed by `purchaseItemAsync()`. If a purchase is attempted for a SKU
 *     never fetched via `getProductsAsync()` on Android, the offer list will
 *     be empty and Play will reject the request; the existing
 *     SubscriptionScreen flow always fetches products before rendering
 *     purchase buttons, so this cannot happen in practice.
 *   - `purchaseUpdatedListener` only fires for purchases that have not yet
 *     been finished/acknowledged/consumed, so the synthesized `acknowledged`
 *     flag is always `false` (there is no equivalent field in
 *     `react-native-iap`, unlike `expo-in-app-purchases`'s `InAppPurchase`).
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-iap-client-adapter
 */

import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  finishTransaction as rnIapFinishTransaction,
  getAvailablePurchases,
  purchaseUpdatedListener,
  purchaseErrorListener,
  type SubscriptionProduct,
  type Purchase as RNIapPurchase,
  type RequestSubscriptionAndroidProps,
} from 'react-native-iap';

export const IAPResponseCode = {
  OK: 0,
  USER_CANCELED: 1,
  ERROR: 2,
} as const;
export type IAPResponseCode = (typeof IAPResponseCode)[keyof typeof IAPResponseCode];

export interface IAPProduct {
  productId: string;
  title: string;
  description: string;
  price: string;
}

export interface InAppPurchase {
  productId: string;
  orderId: string;
  acknowledged: boolean;
  /** Original react-native-iap purchase object, needed by finishTransactionAsync(). */
  raw: RNIapPurchase;
}

/** Android Billing v5+ requires the offerToken returned by fetchProducts() to
 *  actually launch a purchase — cached here per SKU after each product fetch. */
const androidOfferTokenBySku = new Map<string, string>();

function flattenSubscription(sub: SubscriptionProduct): IAPProduct {
  if (sub.platform === 'android') {
    const offer = sub.subscriptionOfferDetailsAndroid?.[0];
    const phases = offer?.pricingPhases.pricingPhaseList ?? [];
    const lastPhase = phases[phases.length - 1];
    if (offer) androidOfferTokenBySku.set(sub.id, offer.offerToken);
    return {
      productId: sub.id,
      title: sub.title,
      description: sub.description,
      price: lastPhase?.formattedPrice ?? sub.displayPrice,
    };
  }
  // iOS (and any other platform) — displayPrice is always populated.
  return {
    productId: sub.id,
    title: sub.title,
    description: sub.description,
    price: sub.displayPrice,
  };
}

/** Establishes the native store connection. Required before any other call
 *  (mirrors expo-in-app-purchases' connectAsync()). */
export async function connectAsync(): Promise<void> {
  await initConnection();
}

/** Tears down the native store connection. Not called by the current screens
 *  (they never disconnect), exposed for symmetry / future use. */
export async function disconnectAsync(): Promise<void> {
  await endConnection();
}

/** Fetches subscription products and caches each SKU's Android offerToken for
 *  the subsequent purchaseItemAsync() call. */
export async function getProductsAsync(
  skus: string[],
): Promise<{ responseCode: IAPResponseCode; results: IAPProduct[] }> {
  try {
    const subs = await fetchProducts({ skus, type: 'subs' });
    return {
      responseCode: IAPResponseCode.OK,
      results: (subs as SubscriptionProduct[]).map(flattenSubscription),
    };
  } catch {
    return { responseCode: IAPResponseCode.ERROR, results: [] };
  }
}

/** Initiates a subscription purchase. Result arrives via the listener
 *  registered through setPurchaseListener(), same as the old library. */
export async function purchaseItemAsync(productId: string): Promise<void> {
  const offerToken = androidOfferTokenBySku.get(productId);
  const androidRequest: RequestSubscriptionAndroidProps = {
    skus: [productId],
    subscriptionOffers: offerToken ? [{ sku: productId, offerToken }] : [],
  };
  await requestPurchase({
    request: {
      ios: { sku: productId },
      android: androidRequest,
    },
    type: 'subs',
  });
}

function toInAppPurchase(purchase: RNIapPurchase): InAppPurchase {
  return {
    productId: purchase.productId,
    orderId: purchase.id || purchase.purchaseToken || '',
    // react-native-iap's purchaseUpdatedListener/getAvailablePurchases only ever
    // surface purchases that still need finishing — there is no native
    // "already acknowledged" flag to mirror, so this is always false.
    acknowledged: false,
    raw: purchase,
  };
}

let restoreListener: ((event: { responseCode: IAPResponseCode; results?: InAppPurchase[] }) => void) | null = null;

/** Registers the purchase-updated + purchase-error listeners. Callback shape
 *  matches expo-in-app-purchases' setPurchaseListener() exactly so
 *  IAPListener.ts's body needs zero changes beyond the import path. */
export function setPurchaseListener(
  callback: (event: { responseCode: IAPResponseCode; results?: InAppPurchase[] }) => void,
): void {
  restoreListener = callback;
  purchaseUpdatedListener((purchase) => {
    callback({ responseCode: IAPResponseCode.OK, results: [toInAppPurchase(purchase)] });
  });
  purchaseErrorListener(() => {
    callback({ responseCode: IAPResponseCode.ERROR, results: undefined });
  });
}

/** Restore-purchases flow: fetches everything the user already owns and
 *  republishes it through the same listener callback registered above — the
 *  "Listener handles restore" comment in SubscriptionScreen.tsx stays true. */
export async function getPurchaseHistoryAsync(): Promise<void> {
  const purchases = await getAvailablePurchases();
  if (purchases.length > 0 && restoreListener) {
    restoreListener({ responseCode: IAPResponseCode.OK, results: purchases.map(toInAppPurchase) });
  }
}

/** Tells the store the purchase has been delivered — same signature shape
 *  (purchase, isConsumable) as expo-in-app-purchases' finishTransactionAsync(). */
export async function finishTransactionAsync(
  purchase: InAppPurchase,
  isConsumable: boolean,
): Promise<void> {
  await rnIapFinishTransaction({ purchase: purchase.raw, isConsumable });
}
