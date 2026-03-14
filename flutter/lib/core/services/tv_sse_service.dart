import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;


// ---------------------------------------------------------------------------
// TvSseEvent — a parsed push event from the smart service SSE endpoint.
// ---------------------------------------------------------------------------

/// Discriminated union of event types pushed by `GET /api/v1/tv/:id/events`.
sealed class TvSseEvent {}

/// The server acknowledged the connection.
class TvSseConnectedEvent extends TvSseEvent {}

/// A settings patch was pushed to this device.
/// Holds the raw JSON map so the consumer can merge it with existing state
/// rather than replacing all settings with a partial object.
class TvSseSettingsEvent extends TvSseEvent {
  TvSseSettingsEvent(this.settingsJson);
  final Map<String, dynamic> settingsJson;
}

/// A Quran playback command was pushed to this device.
class TvSseQuranCommandEvent extends TvSseEvent {
  TvSseQuranCommandEvent({
    required this.action,
    this.surah,
    this.ayah,
    this.reciterId,
    this.afterSurah,
    this.backgroundMode,
    this.restore = false,
  });
  final String action;
  final int? surah;
  final int? ayah;
  final String? reciterId;
  final String? afterSurah;
  /// 'keep-video' or 'quran-display' — how the TV background behaves during Quran.
  final String? backgroundMode;
  /// When true on 'stop', the TV should restore the previous audio/video state.
  final bool restore;
}

/// A prayer was completed (prayer_complete event).
class TvSsePrayerCompleteEvent extends TvSseEvent {
  TvSsePrayerCompleteEvent(this.prayerName);
  final String prayerName;
}

/// The SSE connection was lost and will attempt reconnect.
class TvSseDisconnectedEvent extends TvSseEvent {}

/// A keep-alive ping was received (no action needed).
class TvSsePingEvent extends TvSseEvent {}

// ---------------------------------------------------------------------------
// TvSseService — long-lived SSE connection to the smart service.
// ---------------------------------------------------------------------------

/// Connects to the smart service SSE endpoint and broadcasts parsed events.
///
/// Usage:
/// ```dart
/// final svc = TvSseService(
///   baseUrl: 'https://smart.praycalc.com',
///   deviceId: deviceId,
///   token: jwtToken,
/// );
/// svc.events.listen((event) { ... });
/// await svc.connect();
/// // ...
/// svc.dispose();
/// ```
class TvSseService {
  TvSseService({
    required this.baseUrl,
    required this.deviceId,
    required this.token,
  });

  final String baseUrl;
  final String deviceId;
  final String token;

  final _controller = StreamController<TvSseEvent>.broadcast();

  /// Broadcast stream of parsed SSE events.
  Stream<TvSseEvent> get events => _controller.stream;

  http.Client? _client;
  bool _disposed = false;
  Timer? _reconnectTimer;

  /// Starts the SSE connection. Reconnects automatically on disconnect.
  Future<void> connect() async {
    if (_disposed) return;
    _reconnectTimer?.cancel();
    await _connect();
  }

  Future<void> _connect() async {
    if (_disposed) return;
    _client?.close();
    _client = http.Client();

    final uri = Uri.parse('$baseUrl/api/v1/tv/$deviceId/events');
    final request = http.Request('GET', uri)
      ..headers['Authorization'] = 'Bearer $token'
      ..headers['Accept'] = 'text/event-stream'
      ..headers['Cache-Control'] = 'no-cache';

    try {
      final response = await _client!.send(request);
      if (response.statusCode != 200) {
        _scheduleReconnect();
        return;
      }

      _controller.add(TvSseConnectedEvent());

      final buffer = StringBuffer();
      await for (final chunk in response.stream.transform(utf8.decoder)) {
        if (_disposed) break;
        buffer.write(chunk);

        // Parse complete SSE messages (double newline terminated).
        final text = buffer.toString();
        final messages = text.split('\n\n');

        // Last element may be incomplete; keep it in the buffer.
        buffer.clear();
        if (messages.isNotEmpty) {
          buffer.write(messages.last);
        }

        for (var i = 0; i < messages.length - 1; i++) {
          _parseMessage(messages[i]);
        }
      }

      // Stream ended — reconnect.
      if (!_disposed) _scheduleReconnect();
    } catch (e, st) {
      debugPrint('[TvSse] Stream error: $e\n$st');
      if (!_disposed) _scheduleReconnect();
    }
  }

  void _parseMessage(String raw) {
    if (raw.trim().isEmpty) return;

    String? eventType;
    String? data;

    for (final line in raw.split('\n')) {
      if (line.startsWith('event: ')) {
        eventType = line.substring(7).trim();
      } else if (line.startsWith('data: ')) {
        data = line.substring(6).trim();
      }
    }

    if (data == null) return;

    if (eventType == 'ping' || data == 'ping') {
      _controller.add(TvSsePingEvent());
      return;
    }

    Map<String, dynamic> json;
    try {
      json = jsonDecode(data) as Map<String, dynamic>;
    } catch (e, st) {
      debugPrint('[TvSse] Malformed JSON in SSE message: $e');
      return;
    }

    switch (eventType) {
      case 'settings':
        final settingsJson = json['settings'] as Map<String, dynamic>?;
        if (settingsJson != null) {
          try {
            _controller.add(TvSseSettingsEvent(settingsJson));
          } catch (e, st) {
            debugPrint('[TvSse] Failed to emit settings event: $e\n$st');
          }
        }
      case 'prayer_complete':
        final name = (json['prayerName'] ?? json['prayer'] ?? '').toString();
        if (name.isNotEmpty) {
          _controller.add(TvSsePrayerCompleteEvent(name));
        }
      case 'quran':
        final action = json['action'] as String?;
        if (action != null) {
          _controller.add(TvSseQuranCommandEvent(
            action: action,
            surah: json['surah'] as int?,
            ayah: json['ayah'] as int?,
            reciterId: json['reciterId'] as String?,
            afterSurah: json['afterSurah'] as String?,
            backgroundMode: json['backgroundMode'] as String?,
            restore: json['restore'] as bool? ?? false,
          ));
        }
      default:
        // Unknown event type — ignore.
        break;
    }
  }

  void _scheduleReconnect() {
    if (_disposed) return;
    _controller.add(TvSseDisconnectedEvent());
    _reconnectTimer = Timer(const Duration(seconds: 5), _connect);
  }

  void dispose() {
    _disposed = true;
    _reconnectTimer?.cancel();
    _client?.close();
    _controller.close();
  }
}
