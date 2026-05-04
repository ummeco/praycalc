// permission_lifecycle_screen.dart — v1.1 notification permission lifecycle.
// Spec §10.1, S19-E T26
//
// Shows:
//   - Current permission state (granted / denied / provisional / notDetermined)
//   - Deep-link to Settings if denied
//   - iOS provisional upgrade prompt after 3 uses
//   - Android: after 2 denials, show Settings deep-link instead of re-prompting
//
// Route: /settings/notifications/permissions (navigated from
// NotificationSettingsScreen when the permission banner is tapped).

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:permission_handler/permission_handler.dart';

import '../../core/services/permission_service.dart';
import '../../core/theme/app_theme.dart';

class PermissionLifecycleScreen extends ConsumerStatefulWidget {
  const PermissionLifecycleScreen({super.key});

  @override
  ConsumerState<PermissionLifecycleScreen> createState() =>
      _PermissionLifecycleScreenState();
}

class _PermissionLifecycleScreenState
    extends ConsumerState<PermissionLifecycleScreen>
    with WidgetsBindingObserver {

  final _svc = PermissionService();
  PermissionStatus _notifStatus = PermissionStatus.denied;
  PermissionStatus _locationStatus = PermissionStatus.denied;
  bool _showSettingsLink = false;
  int _provisionalCount = 0;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _refresh();
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  // Re-check permissions when returning from Settings
  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) _refresh();
  }

  Future<void> _refresh() async {
    final notif    = await Permission.notification.status;
    final location = await Permission.locationWhenInUse.status;
    final showLink = await _svc.shouldShowSettingsLink();
    final provCount = await _svc.provisionalUseCount();
    if (!mounted) return;
    setState(() {
      _notifStatus    = notif;
      _locationStatus = location;
      _showSettingsLink = showLink;
      _provisionalCount = provCount;
      _loading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Notification Permissions')),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildNotifSection(),
                const SizedBox(height: 16),
                _buildLocationSection(),
              ],
            ),
    );
  }

  // MARK: - Notification section

  Widget _buildNotifSection() {
    final icon  = _statusIcon(_notifStatus);
    final label = _statusLabel(_notifStatus);
    final desc  = _notifDescription();

    return Card(
      color: const Color(0xFF1A2E1A),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Icon(icon.icon, color: icon.color, size: 28),
              const SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Notifications',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 2),
                  Text(label, style: TextStyle(color: icon.color, fontSize: 13)),
                ]),
              ),
            ]),
            const SizedBox(height: 12),
            Text(desc, style: TextStyle(color: Colors.white.withAlpha(179), fontSize: 13)),
            const SizedBox(height: 16),
            ..._buildNotifActions(),
          ],
        ),
      ),
    );
  }

  List<Widget> _buildNotifActions() {
    if (_notifStatus.isGranted) {
      return [
        Text('Prayer notifications are active.',
            style: TextStyle(color: PrayCalcColors.light, fontSize: 13)),
      ];
    }

    if (_notifStatus.isPermanentlyDenied || _showSettingsLink) {
      return [
        ElevatedButton.icon(
          icon: const Icon(Icons.settings),
          label: const Text('Open Settings'),
          style: ElevatedButton.styleFrom(
            backgroundColor: PrayCalcColors.mid,
            foregroundColor: Colors.black,
          ),
          onPressed: () => _svc.openSettings(),
        ),
        const SizedBox(height: 8),
        Text(
          'Tap Settings, then enable Notifications for PrayCalc.',
          style: TextStyle(color: Colors.white.withAlpha(128), fontSize: 12),
        ),
      ];
    }

    // iOS provisional: upgrade prompt after 3 uses
    if (_provisionalCount >= 3) {
      return [
        ElevatedButton.icon(
          icon: const Icon(Icons.notifications_active),
          label: const Text('Enable Full Notifications'),
          style: ElevatedButton.styleFrom(
            backgroundColor: PrayCalcColors.mid,
            foregroundColor: Colors.black,
          ),
          onPressed: _requestNotifications,
        ),
        const SizedBox(height: 8),
        Text(
          'You have used PrayCalc $_provisionalCount times. '
          'Enable full notifications to receive adhan reminders.',
          style: TextStyle(color: Colors.white.withAlpha(128), fontSize: 12),
        ),
      ];
    }

    // Requestable
    return [
      ElevatedButton.icon(
        icon: const Icon(Icons.notifications),
        label: const Text('Enable Notifications'),
        style: ElevatedButton.styleFrom(
          backgroundColor: PrayCalcColors.mid,
          foregroundColor: Colors.black,
        ),
        onPressed: _requestNotifications,
      ),
    ];
  }

  Future<void> _requestNotifications() async {
    await _svc.requestAll();
    await _refresh();
  }

  // MARK: - Location section

  Widget _buildLocationSection() {
    final icon  = _statusIcon(_locationStatus);
    final label = _statusLabel(_locationStatus);

    return Card(
      color: const Color(0xFF1A2E1A),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Icon(icon.icon, color: icon.color, size: 28),
              const SizedBox(width: 12),
              Expanded(
                child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Location',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 2),
                  Text(label, style: TextStyle(color: icon.color, fontSize: 13)),
                ]),
              ),
            ]),
            const SizedBox(height: 12),
            Text(
              'Location is used to calculate accurate prayer times for your area.',
              style: TextStyle(color: Colors.white.withAlpha(179), fontSize: 13),
            ),
            if (!_locationStatus.isGranted) ...[
              const SizedBox(height: 16),
              ElevatedButton.icon(
                icon: const Icon(Icons.location_on),
                label: const Text('Enable Location'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: PrayCalcColors.mid,
                  foregroundColor: Colors.black,
                ),
                onPressed: _requestLocation,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Future<void> _requestLocation() async {
    await Permission.locationWhenInUse.request();
    await _refresh();
  }

  // MARK: - Helpers

  String _notifDescription() {
    if (_notifStatus.isGranted) return 'PrayCalc can send adhan alerts and pre-prayer reminders.';
    if (_notifStatus.isPermanentlyDenied || _showSettingsLink) {
      return 'Notifications are blocked. Open Settings to re-enable them.';
    }
    if (_provisionalCount >= 3) {
      return 'You are receiving provisional (quiet) notifications. '
          'Enable full notifications to hear the adhan.';
    }
    return 'Allow notifications to receive adhan alerts and pre-prayer reminders.';
  }

  _StatusIcon _statusIcon(PermissionStatus status) {
    if (status.isGranted) {
      return _StatusIcon(Icons.check_circle, PrayCalcColors.mid);
    }
    if (status.isDenied || status.isPermanentlyDenied) {
      return _StatusIcon(Icons.cancel, Colors.redAccent);
    }
    return _StatusIcon(Icons.help_outline, Colors.amber);
  }

  String _statusLabel(PermissionStatus status) {
    if (status.isGranted)              return 'Granted';
    if (status.isPermanentlyDenied)    return 'Blocked';
    if (status.isDenied)               return 'Not enabled';
    if (status.isLimited)              return 'Provisional';
    return 'Not determined';
  }
}

// MARK: - Small status icon model

class _StatusIcon {
  final IconData icon;
  final Color color;
  const _StatusIcon(this.icon, this.color);
}
