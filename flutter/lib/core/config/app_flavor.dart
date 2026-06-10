/// App flavor detection for conditional behavior (Google vs Amazon build).
library;

/// Returns true if this is an Amazon Appstore build (Fire TV / Fire tablet).
///
/// Set at build time via `--dart-define=FLAVOR=amazon` (see amazon-build.sh).
bool get isAmazonBuild {
  const flavor = String.fromEnvironment('FLAVOR', defaultValue: 'google');
  return flavor == 'amazon';
}

/// Returns true if Google Play Services are available.
/// False for Amazon builds — Fire TV ships without Google Play.
bool get hasGooglePlayServices => !isAmazonBuild;

/// Returns true if Firebase Cloud Messaging is available.
/// False for Amazon builds — FCM requires Google Play Services.
bool get hasFCM => !isAmazonBuild;
