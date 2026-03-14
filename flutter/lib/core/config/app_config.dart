// CFG-B1: Centralized app configuration — all URLs and feature flags in one place.
//
// Use this as the single source of truth instead of hardcoding URLs in each screen.
// On web: detect localhost to switch between local dev and production.
// On native: always use production (local override via dart-define SMART_BASE).
library;

import 'package:flutter/foundation.dart';

// ── Smart server ─────────────────────────────────────────────────────────────

/// Base URL for the PrayCalc smart server (prayer data, TV pairing, SSE).
/// On web localhost returns the local dev URL; everywhere else returns prod.
/// Override at build time: `--dart-define=SMART_BASE=http://localhost:4010`
String get smartServerBase {
  const override = String.fromEnvironment('SMART_BASE');
  if (override.isNotEmpty) return override;
  if (kIsWeb) {
    final host = Uri.base.host;
    if (host == 'localhost' || host.startsWith('127.')) {
      return 'http://localhost:4010';
    }
  }
  return 'https://smart.praycalc.com';
}

/// Full base URL for TV API endpoints (smartServerBase + /api/v1/tv).
String get tvApiBase => '$smartServerBase/api/v1/tv';

// ── Hasura / auth ─────────────────────────────────────────────────────────────

/// Hasura GraphQL endpoint.
/// Override: `--dart-define=HASURA_URL=https://api.praycalc.local.nself.org:8543/v1/graphql`
String get hasuraUrl {
  const override = String.fromEnvironment('HASURA_URL');
  if (override.isNotEmpty) return override;
  return 'https://api.praycalc.com/v1/graphql';
}

/// Hasura Auth endpoint.
String get authUrl {
  const override = String.fromEnvironment('AUTH_URL');
  if (override.isNotEmpty) return override;
  return 'https://auth.ummat.dev';
}

// ── Feature flags ─────────────────────────────────────────────────────────────

/// True when this is a debug / local dev build.
bool get isDev => !const bool.fromEnvironment('dart.vm.product');

/// Maximum number of TVs allowed on the free tier.
const int kFreeTierTvLimit = 3;

/// JWT expiry warning threshold — show banner this many hours before expiry.
const int kJwtExpiryWarnHours = 24;

/// Heartbeat interval for TV home screen (in seconds).
const int kTvHeartbeatIntervalSec = 30;

/// Number of consecutive heartbeat failures before showing the connection badge.
const int kTvHeartbeatFailureThreshold = 3;

/// SSE reconnect interval when SSE is unavailable (in seconds).
const int kTvSseFallbackIntervalSec = 30;
