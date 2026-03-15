import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:graphql/client.dart';
import 'package:shared_preferences/shared_preferences.dart';

// ---------------------------------------------------------------------------
// TvSettingsWsConnectionState — observable connection state
// ---------------------------------------------------------------------------

enum TvSettingsWsConnectionState { disconnected, connecting, connected, error }

// ---------------------------------------------------------------------------
// TvSettingsWsService — Hasura WebSocket subscription for live settings
// ---------------------------------------------------------------------------

/// Subscribes to [pc_tv_devices_by_pk] via Hasura WebSocket.
///
/// When the web dashboard saves settings the TV receives the updated
/// [settings_json] in real time without polling.
///
/// Usage:
/// ```dart
/// final svc = TvSettingsWsService(
///   deviceId: 'uuid',
///   token: jwtString,
///   onSettingsJson: (json) { /* merge into TvSettingsNotifier */ },
/// );
/// await svc.connect();
/// // ...
/// svc.dispose();
/// ```
class TvSettingsWsService {
  TvSettingsWsService({
    required this.deviceId,
    required this.token,
    required this.onSettingsJson,
    this.isLocal = false,
  });

  final String deviceId;
  final String token;

  /// Called on every settings push with the raw `settings_json` map.
  final void Function(Map<String, dynamic> settingsJson) onSettingsJson;

  /// When true, connects to localhost instead of production.
  final bool isLocal;

  TvSettingsWsConnectionState _connectionState =
      TvSettingsWsConnectionState.disconnected;

  /// Publicly observable connection state.
  TvSettingsWsConnectionState get connectionState => _connectionState;

  StreamSubscription<QueryResult>? _sub;
  WebSocketLink? _wsLink;
  GraphQLClient? _client;
  bool _disposed = false;
  int _reconnectAttempts = 0;
  Timer? _reconnectTimer;

  // ── Subscription document ──────────────────────────────────────────────────

  static const _kSubscriptionQuery = r'''
subscription TvDeviceLive($deviceId: uuid!) {
  pc_tv_devices_by_pk(id: $deviceId) {
    settings_json
    updated_at
  }
}
''';

  // ── Public API ─────────────────────────────────────────────────────────────

  /// Establishes the WebSocket connection and starts the subscription.
  /// Safe to call multiple times — disposes the previous connection first.
  Future<void> connect() async {
    if (_disposed) return;
    _teardown();
    _setConnectionState(TvSettingsWsConnectionState.connecting);
    _reconnectAttempts++;

    final wsUrl = isLocal
        ? 'wss://api.praycalc.local.nself.org:8543/v1/graphql'
        : 'wss://api.praycalc.com/v1/graphql';

    // Hasura graphql-ws protocol: send auth in connection_init payload.
    _wsLink = WebSocketLink(
      wsUrl,
      config: SocketClientConfig(
        autoReconnect: false, // we handle reconnect manually with backoff
        inactivityTimeout: const Duration(seconds: 60),
        initialPayload: () => <String, dynamic>{
          'headers': <String, dynamic>{'Authorization': 'Bearer $token'},
        },
      ),
    );

    _client = GraphQLClient(
      link: _wsLink!,
      cache: GraphQLCache(),
    );

    final options = SubscriptionOptions(
      document: gql(_kSubscriptionQuery),
      variables: {'deviceId': deviceId},
    );

    try {
      final stream = _client!.subscribe(options);
      _sub = stream.listen(
        _onData,
        onError: _onError,
        onDone: _onDone,
        cancelOnError: false,
      );
    } catch (e, st) {
      debugPrint('[TvSettingsWs] subscribe() threw: $e\n$st');
      _onError(e);
    }
  }

  /// Permanently closes the service. After calling [dispose] the service
  /// cannot be reconnected.
  void dispose() {
    _disposed = true;
    _reconnectTimer?.cancel();
    _teardown();
  }

  // ── Private ────────────────────────────────────────────────────────────────

  void _setConnectionState(TvSettingsWsConnectionState s) {
    _connectionState = s;
  }

  void _teardown() {
    _reconnectTimer?.cancel();
    _reconnectTimer = null;
    _sub?.cancel();
    _sub = null;
    _wsLink?.dispose();
    _wsLink = null;
    _client = null;
  }

  void _onData(QueryResult result) {
    if (_disposed) return;

    if (result.hasException) {
      debugPrint('[TvSettingsWs] subscription error: ${result.exception}');
      _setConnectionState(TvSettingsWsConnectionState.error);
      _scheduleReconnect();
      return;
    }

    // Mark connected once we receive the first clean payload.
    if (_connectionState != TvSettingsWsConnectionState.connected) {
      _setConnectionState(TvSettingsWsConnectionState.connected);
      _reconnectAttempts = 0;
      debugPrint('[TvSettingsWs] connected');
    }

    final data = result.data;
    if (data == null) return;

    final row = data['pc_tv_devices_by_pk'];
    if (row == null) return;

    final rawSettings = row['settings_json'];
    if (rawSettings == null) return;

    Map<String, dynamic>? settingsMap;
    if (rawSettings is Map<String, dynamic>) {
      settingsMap = rawSettings;
    } else if (rawSettings is String) {
      try {
        settingsMap = jsonDecode(rawSettings) as Map<String, dynamic>;
      } catch (e) {
        debugPrint('[TvSettingsWs] failed to decode settings_json string: $e');
        return;
      }
    }

    if (settingsMap != null) {
      debugPrint('[TvSettingsWs] settings push received');
      onSettingsJson(settingsMap);
    }
  }

  void _onError(Object error, [StackTrace? stackTrace]) {
    if (_disposed) return;
    debugPrint('[TvSettingsWs] stream error: $error');
    _setConnectionState(TvSettingsWsConnectionState.error);
    _scheduleReconnect();
  }

  void _onDone() {
    if (_disposed) return;
    debugPrint('[TvSettingsWs] stream closed — reconnecting');
    _setConnectionState(TvSettingsWsConnectionState.disconnected);
    _scheduleReconnect();
  }

  void _scheduleReconnect() {
    if (_disposed) return;
    _teardown();

    // Exponential backoff: 2s, 4s, 8s, 16s … capped at 60s.
    final delaySeconds = (_reconnectAttempts < 6)
        ? (1 << _reconnectAttempts).clamp(2, 60)
        : 60;

    debugPrint('[TvSettingsWs] reconnect in ${delaySeconds}s '
        '(attempt $_reconnectAttempts)');

    _reconnectTimer = Timer(Duration(seconds: delaySeconds), () {
      if (!_disposed) connect();
    });
  }
}

// ---------------------------------------------------------------------------
// Factory helper — reads JWT from SharedPreferences and creates the service
// ---------------------------------------------------------------------------

/// Parses [deviceId] from the TV JWT payload. Returns null if the JWT is
/// missing, malformed, or has no [device_id] claim.
String? parseTvDeviceId(String jwt) {
  try {
    final parts = jwt.split('.');
    if (parts.length != 3) return null;
    final padded = parts[1].padRight((parts[1].length + 3) & ~3, '=');
    final payload =
        jsonDecode(utf8.decode(base64Url.decode(padded))) as Map<String, dynamic>;
    return payload['device_id'] as String?;
  } catch (_) {
    return null;
  }
}

/// Reads the TV JWT from [SharedPreferences] and constructs a
/// [TvSettingsWsService] if the JWT is valid and contains [device_id].
///
/// Returns null if the device is not paired (no JWT) or JWT has no device_id.
Future<TvSettingsWsService?> buildTvSettingsWsService({
  required SharedPreferences prefs,
  required void Function(Map<String, dynamic>) onSettingsJson,
  bool isLocal = false,
}) async {
  final jwt = prefs.getString('tv_session_jwt');
  if (jwt == null || jwt.isEmpty) return null;

  final deviceId = parseTvDeviceId(jwt);
  if (deviceId == null || deviceId.isEmpty) return null;

  return TvSettingsWsService(
    deviceId: deviceId,
    token: jwt,
    onSettingsJson: onSettingsJson,
    isLocal: isLocal,
  );
}
