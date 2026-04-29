# Privacy

PrayCalc is built to require minimal data. Prayer times are a mathematical calculation — we do not need an account to show you accurate times, and most of the app works without one.

## What we collect

### Location data

Prayer times require a location. We handle this two ways:

- **GPS (on-device):** Your device's GPS provides a coordinate. The coordinate is sent to our API to calculate prayer times and is not stored.
- **City search:** You type a city name. We return matching results. The city you pick is stored locally on your device (not on our servers) for quick access next time.

We do not build a location history. We do not track your location in the background.

### Account data (optional)

Creating an account is optional. If you create one, we store:

- Email address
- Display name (if you set one)
- Your saved locations and settings (so they sync across devices)
- Prayer tracking data (if you log prayers)

You can use PrayCalc without an account — the web app and mobile apps work fully without signing in.

### Usage analytics

We use [Umami](https://umami.is), a privacy-focused, self-hosted analytics tool. Umami collects:

- Page views and navigation paths
- Browser type and OS (aggregated)
- Country (from IP, not stored)
- Referring source

Umami does not use cookies, does not track individuals across sessions, and does not sell data. No third-party analytics scripts are loaded.

### Crash and error reporting

We use [Sentry](https://sentry.io) to capture crash reports and error logs. Sentry reports include stack traces and device info (OS version, app version). They do not include personal data or location.

### In-app purchases

Subscription and purchase management is handled entirely by Apple (StoreKit 2) or Google (Play Billing). We receive a transaction receipt confirming entitlement but do not receive or store your payment card details.

## What we do not collect

- No advertising identifiers (IDFA, GAID)
- No browsing history
- No contact lists or social graph
- No biometric data
- No background location

## Data sharing

We do not sell your data. We do not share personal data with advertisers. The only third parties who receive data are:

- **Sentry:** crash reports (no PII)
- **Apple / Google:** purchase transactions (handled by their systems)
- **Vercel:** web hosting (processes request metadata per their privacy policy)

## Data retention

Account data is kept as long as your account exists. When you delete your account, all personal data is permanently erased within 30 days. See [[Account-Deletion]] for instructions.

## Contact

Questions about privacy: [privacy@praycalc.com](mailto:privacy@praycalc.com)

## See Also

- [[Account-Deletion]] — delete your account and data
- [[IAP]] — subscription management
