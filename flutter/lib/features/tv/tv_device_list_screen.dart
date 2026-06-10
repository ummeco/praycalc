import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:graphql/client.dart';

import '../../core/router/app_router.dart';
import '../../core/services/graphql_service.dart';
import '../../core/theme/app_theme.dart';

// ---------------------------------------------------------------------------
// Data model
// ---------------------------------------------------------------------------

/// Lightweight representation of a paired TV device.
class TvDeviceInfo {
  final String id;
  final String name;
  final String model;

  /// true when last_heartbeat is within the past 2 minutes.
  final bool isOnline;
  final DateTime? lastSeen;
  final String layoutPreset;

  const TvDeviceInfo({
    required this.id,
    required this.name,
    required this.model,
    required this.isOnline,
    this.lastSeen,
    required this.layoutPreset,
  });

  factory TvDeviceInfo.fromJson(Map<String, dynamic> json) {
    DateTime? lastSeen;
    final rawLastSeen = json['last_seen'] as String?;
    if (rawLastSeen != null) {
      lastSeen = DateTime.tryParse(rawLastSeen);
    }

    // Derive isOnline: server may supply a boolean or we compute from last_seen.
    bool isOnline = json['is_online'] as bool? ?? false;
    if (!isOnline && lastSeen != null) {
      isOnline = DateTime.now().difference(lastSeen).inMinutes < 2;
    }

    // layoutPreset lives inside the `settings` JSON column.
    String layoutPreset = 'prayer-only';
    final settings = json['settings'];
    if (settings is Map<String, dynamic>) {
      layoutPreset = settings['layoutPreset'] as String? ?? layoutPreset;
    } else if (settings is String && settings.isNotEmpty) {
      try {
        final decoded = jsonDecode(settings) as Map<String, dynamic>;
        layoutPreset = decoded['layoutPreset'] as String? ?? layoutPreset;
      } catch (e, st) { debugPrint("[TvDeviceList] $e\n$st"); }
    }

    return TvDeviceInfo(
      id: json['id'] as String? ?? '',
      name: json['device_name'] as String? ?? 'TV',
      model: json['device_model'] as String? ?? 'Unknown',
      isOnline: isOnline,
      lastSeen: lastSeen,
      layoutPreset: layoutPreset,
    );
  }
}

// ---------------------------------------------------------------------------
// GraphQL
// ---------------------------------------------------------------------------

const _kGetMyTvDevices = r'''
  query GetMyTvDevices {
    pc_tv_devices(order_by: {created_at: asc}) {
      id
      device_name
      device_model
      last_seen
      settings
      is_online
    }
  }
''';

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/// Mobile/tablet screen listing all paired TVs (R-4).
///
/// Accessed from Settings → "TV Displays".
/// Fetches devices from Hasura via the authenticated GraphQL client.
///
/// Route: /paired-tvs
class TvDeviceListScreen extends StatefulWidget {
  const TvDeviceListScreen({super.key});

  @override
  State<TvDeviceListScreen> createState() => _TvDeviceListScreenState();
}

class _TvDeviceListScreenState extends State<TvDeviceListScreen> {
  List<TvDeviceInfo> _devices = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadDevices();
  }

  Future<void> _loadDevices() async {
    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final result = await GraphQLService.instance.query(
        _kGetMyTvDevices,
        authenticated: true,
        fetchPolicy: FetchPolicy.networkOnly,
      );

      if (result.hasException) {
        final msg = result.exception?.graphqlErrors.firstOrNull?.message ??
            result.exception?.linkException?.toString() ??
            'Failed to load devices.';
        if (!mounted) return;
        setState(() {
          _error = msg;
          _loading = false;
        });
        return;
      }

      final rawList =
          result.data?['pc_tv_devices'] as List<dynamic>? ?? const [];
      final devices = rawList
          .whereType<Map<String, dynamic>>()
          .map(TvDeviceInfo.fromJson)
          .toList();

      if (!mounted) return;
      setState(() {
        _devices = devices;
        _loading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.toString();
        _loading = false;
      });
    }
  }

  // ---------------------------------------------------------------------------
  // Build
  // ---------------------------------------------------------------------------

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text('TV Displays'),
        leading: BackButton(onPressed: () => context.pop()),
      ),
      body: RefreshIndicator(
        onRefresh: _loadDevices,
        child: _buildBody(theme),
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: PrayCalcColors.mid,
        foregroundColor: Colors.white,
        tooltip: 'Pair a new TV',
        onPressed: () => context.push(Routes.tvAddFromMobile),
        child: const Icon(Icons.add),
      ),
    );
  }

  Widget _buildBody(ThemeData theme) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_error != null) {
      return _ErrorState(
        message: _error!,
        onRetry: _loadDevices,
      );
    }

    if (_devices.isEmpty) {
      return _EmptyState(
        onPair: () => context.push(Routes.tvAddFromMobile),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      itemCount: _devices.length,
      separatorBuilder: (_, _) => const SizedBox(height: 8),
      itemBuilder: (context, index) {
        final device = _devices[index];
        return _DeviceCard(
          device: device,
          onSettings: () => context.push(
            Routes.tvRemoteSettings,
            extra: {
              'deviceId': device.id,
              'deviceName': device.name,
            },
          ),
        );
      },
    );
  }
}

// ---------------------------------------------------------------------------
// Device card
// ---------------------------------------------------------------------------

class _DeviceCard extends StatelessWidget {
  const _DeviceCard({
    required this.device,
    required this.onSettings,
  });

  final TvDeviceInfo device;
  final VoidCallback onSettings;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Card(
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            // Online status dot
            _OnlineDot(isOnline: device.isOnline),
            const SizedBox(width: 12),

            // TV icon
            Icon(
              Icons.tv_rounded,
              size: 32,
              color: theme.colorScheme.primary,
            ),
            const SizedBox(width: 14),

            // Name + model
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    device.name,
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    device.model,
                    style: theme.textTheme.bodySmall?.copyWith(
                      color: theme.colorScheme.onSurface.withAlpha(140),
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  if (device.lastSeen != null) ...[
                    const SizedBox(height: 2),
                    Text(
                      _formatLastSeen(device.lastSeen!),
                      style: theme.textTheme.labelSmall?.copyWith(
                        color: theme.colorScheme.onSurface.withAlpha(100),
                      ),
                    ),
                  ],
                ],
              ),
            ),

            // Settings button
            TextButton(
              onPressed: onSettings,
              style: TextButton.styleFrom(
                foregroundColor: PrayCalcColors.dark,
              ),
              child: const Text('Settings'),
            ),
          ],
        ),
      ),
    );
  }

  String _formatLastSeen(DateTime lastSeen) {
    final diff = DateTime.now().difference(lastSeen);
    if (diff.inSeconds < 60) return 'Active now';
    if (diff.inMinutes < 60) return 'Last seen ${diff.inMinutes}m ago';
    if (diff.inHours < 24) return 'Last seen ${diff.inHours}h ago';
    return 'Last seen ${diff.inDays}d ago';
  }
}

// ---------------------------------------------------------------------------
// Online status dot
// ---------------------------------------------------------------------------

class _OnlineDot extends StatelessWidget {
  const _OnlineDot({required this.isOnline});

  final bool isOnline;

  @override
  Widget build(BuildContext context) {
    return Tooltip(
      message: isOnline ? 'Online' : 'Offline',
      child: Container(
        width: 10,
        height: 10,
        decoration: BoxDecoration(
          shape: BoxShape.circle,
          color: isOnline ? const Color(0xFF4CAF50) : Colors.grey,
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

class _EmptyState extends StatelessWidget {
  const _EmptyState({required this.onPair});

  final VoidCallback onPair;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.tv_off_rounded,
              size: 72,
              color: theme.colorScheme.onSurface.withAlpha(60),
            ),
            const SizedBox(height: 24),
            Text(
              'No TVs paired yet',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              'Display prayer times on your TV — pair it with your phone in seconds.',
              textAlign: TextAlign.center,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: theme.colorScheme.onSurface.withAlpha(140),
              ),
            ),
            const SizedBox(height: 32),
            FilledButton.icon(
              onPressed: onPair,
              icon: const Icon(Icons.add),
              label: const Text('Pair your first TV'),
              style: FilledButton.styleFrom(
                backgroundColor: PrayCalcColors.mid,
                foregroundColor: Colors.white,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

class _ErrorState extends StatelessWidget {
  const _ErrorState({required this.message, required this.onRetry});

  final String message;
  final VoidCallback onRetry;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.error_outline_rounded,
              size: 56,
              color: theme.colorScheme.error,
            ),
            const SizedBox(height: 16),
            Text(
              'Could not load TV displays',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: theme.textTheme.bodySmall?.copyWith(
                color: theme.colorScheme.onSurface.withAlpha(140),
              ),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 24),
            OutlinedButton.icon(
              onPressed: onRetry,
              icon: const Icon(Icons.refresh),
              label: const Text('Try again'),
            ),
          ],
        ),
      ),
    );
  }
}
