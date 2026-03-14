import 'dart:async';

import 'package:http/http.dart' as http;

// ---------------------------------------------------------------------------
// StreamHealthStatus (TV2-3.3)
// ---------------------------------------------------------------------------

/// The liveness state of a remote stream URL.
enum StreamHealthStatus { online, offline, unknown }

// ---------------------------------------------------------------------------
// TvStreamHealthService (TV2-3.3)
// ---------------------------------------------------------------------------

/// Checks whether a stream URL is reachable and re-checks every 5 minutes.
///
/// Use [checkHealth] for a one-shot check. Use [startPeriodicCheck] to get
/// a broadcast stream of status updates that fires immediately and then every
/// [_recheckInterval]. Cancel via the returned [StreamSubscription] or call
/// [dispose] to tear down all timers.
class TvStreamHealthService {
  static const _recheckInterval = Duration(minutes: 5);
  static const _requestTimeout = Duration(seconds: 8);

  // Periodic check state.
  Timer? _timer;
  final StreamController<StreamHealthStatus> _statusController =
      StreamController<StreamHealthStatus>.broadcast();
  String _monitoredUrl = '';

  /// Broadcast stream of health-check results for the URL passed to
  /// [startPeriodicCheck]. Emits once immediately, then every 5 minutes.
  Stream<StreamHealthStatus> get statusStream => _statusController.stream;

  // ---------------------------------------------------------------------------
  // One-shot check
  // ---------------------------------------------------------------------------

  /// Performs a single HTTP HEAD request against [url] and returns its health.
  ///
  /// Returns [StreamHealthStatus.unknown] when [url] is empty.
  /// Returns [StreamHealthStatus.offline] on network errors or timeouts.
  static Future<StreamHealthStatus> checkHealth(String url) async {
    if (url.isEmpty) return StreamHealthStatus.unknown;
    try {
      final response = await http
          .head(Uri.parse(url))
          .timeout(_requestTimeout);
      return response.statusCode < 400
          ? StreamHealthStatus.online
          : StreamHealthStatus.offline;
    } catch (e, st) {
      return StreamHealthStatus.offline;
    }
  }

  // ---------------------------------------------------------------------------
  // Periodic monitoring
  // ---------------------------------------------------------------------------

  /// Starts monitoring [url] every [_recheckInterval] and pushes results to
  /// [statusStream]. Replaces any previously monitored URL.
  void startPeriodicCheck(String url) {
    _timer?.cancel();
    _monitoredUrl = url;

    // Fire immediately.
    _runCheck();

    _timer = Timer.periodic(_recheckInterval, (_) => _runCheck());
  }

  /// Stops periodic monitoring and closes the status stream.
  void dispose() {
    _timer?.cancel();
    _statusController.close();
  }

  Future<void> _runCheck() async {
    if (_statusController.isClosed) return;
    final status = await checkHealth(_monitoredUrl);
    if (!_statusController.isClosed) {
      _statusController.add(status);
    }
  }
}
