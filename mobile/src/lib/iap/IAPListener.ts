/**
 * Purpose: Global IAP purchase listener — previously referenced by SubscriptionScreen's
 *   header comment but never implemented, so purchases never unlocked anything. Must be
 *   registered once, globally (per the iapClient adapter's own docs), before any
 *   purchaseItemAsync call — wired from the root layout, not a specific screen.
 * Inputs: iapClient (react-native-iap-backed) purchase-updated events, useAuthStore
 *   (account mode / JWT).
 * Outputs: Finishes each transaction; for account-mode users, records the receipt via
 *   RECORD_IAP_RECEIPT_MUTATION and reconciles useAuthStore.isPlus from the server.
 * Constraints: Anonymous users make ZERO API calls (useAuthStore invariant) — an anonymous
 *   purchase (e.g. a leftover unfinished transaction after reinstall) is still finished
 *   with the App Store/Play Store and flips isPlus locally, but is never sent to the
 *   backend; it will not sync across devices until the user creates an account.
 *   This is the single entitlement flag (isPlus) for BOTH the IAP "Pro" purchase and the
 *   web Ummat+ subscription — the two previously-incompatible systems are unified here.
 * SPORT: REGISTRY-FUNCTIONS.md#praycalc-mobile-iap-listener
 */

import * as InAppPurchases from './iapClient';
import { Platform } from 'react-native';
import { getToken } from '../graphql';
import { API_URL } from '../../constants';
import { useAuthStore } from '../../features/auth/store/useAuthStore';
import { buildRecordIapReceiptRequest } from './iapMutation';

let registered = false;

async function recordReceipt(orderId: string, productId: string): Promise<boolean> {
  const jwt = await getToken();
  if (!jwt) return false;
  const { query, variables } = buildRecordIapReceiptRequest({
    transactionId: orderId,
    productId,
    platform: Platform.OS === 'android' ? 'android' : 'ios',
  });
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jwt}` },
      body: JSON.stringify({ query, variables }),
    });
    const body = await response.json();
    return response.ok && !body.errors;
  } catch {
    return false;
  }
}

async function handlePurchase(purchase: InAppPurchases.InAppPurchase): Promise<void> {
  const { mode, fetchEntitlement } = useAuthStore.getState();

  if (mode === 'account') {
    const recorded = await recordReceipt(purchase.orderId, purchase.productId);
    if (recorded) {
      useAuthStore.setState({ isPlus: true }); // optimistic, reconciled below
      await fetchEntitlement();
    }
  } else {
    // Anonymous: local-only entitlement flip, no network call (zero-API-calls invariant).
    // Will not sync across devices/reinstalls until the user creates an account.
    useAuthStore.setState({ isPlus: true });
  }

  // Non-consumable (subscription) — mark finished either way so the store doesn't
  // keep re-delivering it and the user isn't refunded for an unacknowledged purchase.
  await InAppPurchases.finishTransactionAsync(purchase, false);
}

/** Register the global purchase listener. Idempotent — safe to call on every app start. */
export function registerIAPListener(): void {
  if (registered) return;
  registered = true;

  InAppPurchases.setPurchaseListener(({ responseCode, results }) => {
    if (responseCode !== InAppPurchases.IAPResponseCode.OK || !results) return;
    for (const purchase of results) {
      if (purchase.acknowledged) continue;
      void handlePurchase(purchase);
    }
  });
}
