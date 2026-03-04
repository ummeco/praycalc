import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../services/graphql_service.dart';
import '../services/sync_service.dart';
import 'auth_provider.dart';

/// Riverpod notifier that coordinates sync between local and remote.
///
/// Watches auth state (syncs on login, clears on logout), runs periodic
/// background sync every 30 seconds when authenticated and online.
class SyncNotifier extends Notifier<SyncState> {
  Timer? _periodicTimer;
  StreamSubscription<SyncState>? _syncSub;
  StreamSubscription<List<ConnectivityResult>>? _connectivitySub;
  bool _isOnline = true;

  @override
  SyncState build() {
    _init();
    ref.onDispose(_dispose);
    return const SyncState();
  }

  void _init() {
    // Listen to sync service state changes.
    _syncSub = SyncService.instance.stateChanges.listen((syncState) {
      state = syncState;
    });

    // Monitor connectivity.
    _connectivitySub = Connectivity().onConnectivityChanged.listen((results) {
      final wasOnline = _isOnline;
      _isOnline = results.any((r) => r != ConnectivityResult.none);

      // If we just came back online and are authenticated, sync immediately.
      if (!wasOnline && _isOnline) {
        final auth = ref.read(authProvider);
        if (auth.isAuthenticated) {
          syncNow();
        }
      }
    });

    // Watch auth state: sync on login, clear on logout.
    ref.listen(authProvider, (prev, next) {
      if (next.isAuthenticated && !(prev?.isAuthenticated ?? false)) {
        // Just logged in.
        syncNow();
        _startPeriodicSync();
      } else if (!next.isAuthenticated && (prev?.isAuthenticated ?? false)) {
        // Just logged out.
        _stopPeriodicSync();
        GraphQLService.instance.clearCache();
        state = const SyncState();
      }
    });

    // If already authenticated at build time, start syncing.
    Future.microtask(() {
      final auth = ref.read(authProvider);
      if (auth.isAuthenticated) {
        syncNow();
        _startPeriodicSync();
      }
    });
  }

  /// Trigger an immediate sync.
  Future<void> syncNow() async {
    if (!_isOnline) {
      state = state.copyWith(status: SyncStatus.offline);
      return;
    }

    await SyncService.instance.syncAll();
  }

  /// Force a full re-sync (useful after settings changes).
  Future<void> forceSyncDomain(String domain, Map<String, dynamic> data) async {
    if (!_isOnline) {
      // Queue for later.
      await SyncService.instance.queueMutation(domain, data);
      return;
    }

    final auth = ref.read(authProvider);
    if (!auth.isAuthenticated) return;

    await SyncService.instance.syncAll();
  }

  void _startPeriodicSync() {
    _stopPeriodicSync();
    _periodicTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) {
        final auth = ref.read(authProvider);
        if (auth.isAuthenticated && _isOnline) {
          SyncService.instance.syncAll();
        }
      },
    );
  }

  void _stopPeriodicSync() {
    _periodicTimer?.cancel();
    _periodicTimer = null;
  }

  void _dispose() {
    _stopPeriodicSync();
    _syncSub?.cancel();
    _connectivitySub?.cancel();
  }
}

final syncProvider = NotifierProvider<SyncNotifier, SyncState>(
  SyncNotifier.new,
);
