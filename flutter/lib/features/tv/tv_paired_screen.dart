import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../../core/router/app_router.dart';
import '../../core/theme/app_theme.dart';

// ---------------------------------------------------------------------------
// Model
// ---------------------------------------------------------------------------

class PairedTvDevice {
  final String id;
  final String name;
  final String model;
  final bool isOnline;
  final DateTime? lastSeen;

  const PairedTvDevice({
    required this.id,
    required this.name,
    required this.model,
    required this.isOnline,
    this.lastSeen,
  });

  Map<String, dynamic> toJson() => {
        'id': id,
        'name': name,
        'model': model,
        'isOnline': isOnline,
        'lastSeen': lastSeen?.toIso8601String(),
      };

  factory PairedTvDevice.fromJson(Map<String, dynamic> j) => PairedTvDevice(
        id: j['id'] as String,
        name: j['name'] as String,
        model: j['model'] as String? ?? 'TV',
        isOnline: j['isOnline'] as bool? ?? false,
        lastSeen: j['lastSeen'] != null
            ? DateTime.tryParse(j['lastSeen'] as String)
            : null,
      );
}

// ---------------------------------------------------------------------------
// Provider helpers
// ---------------------------------------------------------------------------

const _kPairedTvDevicesKey = 'paired_tv_devices';

Future<List<PairedTvDevice>> _loadPairedDevices() async {
  final prefs = await SharedPreferences.getInstance();
  final raw = prefs.getString(_kPairedTvDevicesKey);
  if (raw == null || raw.isEmpty) return [];
  try {
    final list = jsonDecode(raw) as List<dynamic>;
    return list
        .whereType<Map<String, dynamic>>()
        .map(PairedTvDevice.fromJson)
        .toList();
  } catch (e, st) {
    return [];
  }
}

Future<void> _savePairedDevices(List<PairedTvDevice> devices) async {
  final prefs = await SharedPreferences.getInstance();
  await prefs.setString(
    _kPairedTvDevicesKey,
    jsonEncode(devices.map((d) => d.toJson()).toList()),
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

/// Lists all TVs previously paired with the user's account.
/// Tap a TV to open remote settings; FAB to pair a new TV.
class TvPairedScreen extends ConsumerStatefulWidget {
  const TvPairedScreen({super.key});

  @override
  ConsumerState<TvPairedScreen> createState() => _TvPairedScreenState();
}

class _TvPairedScreenState extends ConsumerState<TvPairedScreen> {
  List<PairedTvDevice> _devices = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final saved = await _loadPairedDevices();
    if (!mounted) return;
    if (saved.isEmpty) {
      // Seed with illustrative mock data so UI is never blank on first run.
      _devices = const [
        PairedTvDevice(
          id: 'tv-1',
          name: 'Living Room TV',
          model: 'NVIDIA Shield TV Pro',
          isOnline: true,
        ),
        PairedTvDevice(
          id: 'tv-2',
          name: 'Bedroom TV',
          model: 'Amazon Fire Stick 4K',
          isOnline: false,
        ),
      ];
      await _savePairedDevices(_devices);
    } else {
      _devices = saved;
    }
    setState(() => _loading = false);
  }

  String _lastSeenLabel(PairedTvDevice device) {
    if (device.isOnline) return 'Online now';
    final seen = device.lastSeen;
    if (seen == null) return 'Last seen: unknown';
    final diff = DateTime.now().difference(seen);
    if (diff.inMinutes < 60) return 'Last seen ${diff.inMinutes}m ago';
    if (diff.inHours < 24) return 'Last seen ${diff.inHours}h ago';
    return 'Last seen ${diff.inDays}d ago';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: PrayCalcColors.deep,
      appBar: AppBar(
        backgroundColor: PrayCalcColors.deep,
        foregroundColor: Colors.white,
        title: const Text(
          'My TVs',
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      // TV2-10.15: "Add TV" opens the mobile code-entry flow (TvAddFromMobileScreen)
      // rather than the TV-side pairing screen.
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () => context.push(Routes.tvAddFromMobile),
        backgroundColor: PrayCalcColors.dark,
        foregroundColor: PrayCalcColors.light,
        icon: const Icon(Icons.add),
        label: const Text('Add TV'),
      ),
      body: _loading
          ? const Center(
              child: CircularProgressIndicator(color: PrayCalcColors.mid),
            )
          : _devices.isEmpty
              ? _buildEmpty()
              : _buildList(),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.tv_off, size: 72, color: Colors.white24),
            const SizedBox(height: 24),
            const Text(
              'No TVs paired',
              style: TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'Open PrayCalc on your TV to pair it.',
              style: TextStyle(color: Colors.white54, fontSize: 16),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 32),
            FilledButton.icon(
              onPressed: () => context.push(Routes.tvAddFromMobile),
              icon: const Icon(Icons.add),
              label: const Text('Pair a TV'),
              style: FilledButton.styleFrom(
                backgroundColor: PrayCalcColors.dark,
                foregroundColor: PrayCalcColors.light,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildList() {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 16),
      itemCount: _devices.length,
      separatorBuilder: (_, _) => const SizedBox(height: 8),
      itemBuilder: (context, i) => _TvDeviceTile(
        device: _devices[i],
        lastSeenLabel: _lastSeenLabel(_devices[i]),
        onTap: () => context.push(
          Routes.tvRemoteSettings,
          extra: {
            'deviceId': _devices[i].id,
            'deviceName': _devices[i].name,
          },
        ),
      ),
    );
  }
}

// ---------------------------------------------------------------------------
// Tile widget
// ---------------------------------------------------------------------------

class _TvDeviceTile extends StatelessWidget {
  const _TvDeviceTile({
    required this.device,
    required this.lastSeenLabel,
    required this.onTap,
  });

  final PairedTvDevice device;
  final String lastSeenLabel;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: PrayCalcColors.surface,
      borderRadius: BorderRadius.circular(16),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          child: Row(
            children: [
              // Status dot
              Container(
                width: 10,
                height: 10,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: device.isOnline ? Colors.green[400] : Colors.white24,
                ),
              ),
              const SizedBox(width: 14),

              // Name + model
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      device.name,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      device.model,
                      style: const TextStyle(color: Colors.white54, fontSize: 13),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      lastSeenLabel,
                      style: TextStyle(
                        color: device.isOnline
                            ? Colors.green[400]
                            : Colors.white38,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),

              const Icon(Icons.chevron_right, color: Colors.white24),
            ],
          ),
        ),
      ),
    );
  }
}
