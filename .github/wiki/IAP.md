# In-App Purchases (IAP) & Ummat+

PrayCalc is free on every surface. **Ummat+** ($9.99/yr) is the one paid tier, and it unlocks exactly two things: the **TV app** (pairing + account-linked control) and **Smart Home integrations** (Google Home, Alexa). It does not remove ads (there are none), and it does not gate any calculator, notification, or adhan-voice feature — those are all free on web, mobile, and desktop. See [[Features]] for the full tier breakdown.

## Entitlement is checked server-side, always

The client never decides who has Plus. Every surface (web, mobile, desktop) signs in against the shared Ummat backend and gets a JWT; a `syncPlusRole` process converges the Hasura `plus` role with the user's subscription record on every Stripe/Apple/Google webhook. TV pairing writes are restricted to the `plus` Hasura role at the permission layer, and Smart Home routes run a `requirePlus` middleware that returns `402 ummat_plus_required` for non-Plus accounts.

**Current status:** Stripe is not yet provisioned for this account. `/upgrade` (web) shows a "launching soon" state and `/billing/checkout` returns `503 billing_disabled` — nothing charges yet. Signing in and using the calculator work today on every surface regardless of tier.

## Mobile — react-native-iap

Mobile purchases (once Stripe/store billing is live) go through [`react-native-iap`](https://github.com/hyochan/react-native-iap) behind a stable wrapper (`src/lib/iap`), which talks to StoreKit on iOS and Google Play Billing on Android. This replaced `expo-in-app-purchases` (unmaintained since 2022) in the 2026-07-10 dependency realignment — the wrapper interface didn't change, so the rest of the app doesn't know or care which library is underneath.

### Restore purchases

The wrapper exposes a `restorePurchases()` call that re-syncs entitlement from the store's own purchase history — works across device reinstalls.

### Sandbox / test purchases

- iOS: use a Sandbox tester account (App Store Connect → Users and Access → Sandbox). Sandbox subscriptions expire fast (e.g. a 1-month subscription ≈ 5 minutes).
- Android: use a Google Play License Testing account (Play Console → Setup → License Testing) to exercise `PURCHASED`, `CANCELED`, `PENDING`, and `ITEM_ALREADY_OWNED` without real payment.

## Web & Desktop — Stripe (pending)

Web and desktop don't do native IAP; they'll check out through Stripe once it's provisioned for this account, landing on the same `plus` Hasura role as the mobile stores.

## See Also

- [[Features]] — full feature list and the Free vs Ummat+ breakdown
- [[Smart-Home]] — what Ummat+ unlocks for Smart Home and TV
- [[Account-Deletion]] — deleting an account cancels active subscriptions
- Apple: [StoreKit](https://developer.apple.com/storekit/) · Google: [Play Billing Library](https://developer.android.com/google/play/billing)
