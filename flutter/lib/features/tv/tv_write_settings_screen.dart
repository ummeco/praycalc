import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/theme/app_theme.dart';

/// Full-screen prompt explaining that WRITE_SETTINGS permission is required
/// for brightness control. Pops with [true] when permission is granted.
class TvWriteSettingsScreen extends StatefulWidget {
  const TvWriteSettingsScreen({super.key});

  @override
  State<TvWriteSettingsScreen> createState() => _TvWriteSettingsScreenState();
}

class _TvWriteSettingsScreenState extends State<TvWriteSettingsScreen> {
  static const _channel = MethodChannel('com.praycalc.tv/brightness');

  bool _permissionGranted = false;
  bool _checking = false;

  Future<void> _openWriteSettings() async {
    try {
      await _channel.invokeMethod<void>('openWriteSettingsPage');
    } on PlatformException {
      // If the channel is unavailable (non-Android), do nothing.
    }
  }

  Future<void> _checkPermission() async {
    setState(() => _checking = true);
    try {
      final granted =
          await _channel.invokeMethod<bool>('checkWriteSettings') ?? false;
      setState(() {
        _permissionGranted = granted;
        _checking = false;
      });
      if (granted && mounted) {
        Navigator.of(context).pop(true);
      }
    } on PlatformException {
      setState(() => _checking = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: PrayCalcColors.deep,
      appBar: AppBar(
        backgroundColor: PrayCalcColors.deep,
        foregroundColor: Colors.white,
        title: const Text(
          'Brightness Permission',
          style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, size: 32),
          onPressed: () => Navigator.of(context).pop(false),
        ),
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 700),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 48, vertical: 32),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  _permissionGranted
                      ? Icons.check_circle
                      : Icons.brightness_medium,
                  color: _permissionGranted
                      ? PrayCalcColors.light
                      : PrayCalcColors.mid,
                  size: 80,
                ),
                const SizedBox(height: 32),
                Text(
                  _permissionGranted
                      ? 'Permission granted'
                      : 'Allow modifying system settings',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 32,
                    fontWeight: FontWeight.bold,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                if (!_permissionGranted) ...[
                  const Text(
                    'PrayCalc needs permission to control screen brightness '
                    'for automated brightness schedules and night mode.\n\n'
                    'Go to Settings → Apps → PrayCalc → '
                    'Allow modifying system settings',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 22,
                      height: 1.5,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 48),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Focus(
                        onKeyEvent: (node, event) {
                          if (event is KeyDownEvent &&
                              (event.logicalKey ==
                                      LogicalKeyboardKey.select ||
                                  event.logicalKey ==
                                      LogicalKeyboardKey.enter)) {
                            _openWriteSettings();
                            return KeyEventResult.handled;
                          }
                          return KeyEventResult.ignored;
                        },
                        child: Builder(
                          builder: (ctx) {
                            final focused = Focus.of(ctx).hasFocus;
                            return ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: focused
                                    ? PrayCalcColors.mid
                                    : PrayCalcColors.dark,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 32, vertical: 16),
                                side: focused
                                    ? const BorderSide(
                                        color: PrayCalcColors.light, width: 2)
                                    : null,
                              ),
                              icon: const Icon(Icons.settings, size: 28),
                              label: const Text('Open Settings',
                                  style: TextStyle(fontSize: 24)),
                              onPressed: _openWriteSettings,
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 24),
                      Focus(
                        onKeyEvent: (node, event) {
                          if (event is KeyDownEvent &&
                              (event.logicalKey ==
                                      LogicalKeyboardKey.select ||
                                  event.logicalKey ==
                                      LogicalKeyboardKey.enter)) {
                            _checkPermission();
                            return KeyEventResult.handled;
                          }
                          return KeyEventResult.ignored;
                        },
                        child: Builder(
                          builder: (ctx) {
                            final focused = Focus.of(ctx).hasFocus;
                            return ElevatedButton.icon(
                              style: ElevatedButton.styleFrom(
                                backgroundColor: focused
                                    ? PrayCalcColors.mid
                                    : PrayCalcColors.surface,
                                foregroundColor: Colors.white,
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 32, vertical: 16),
                                side: focused
                                    ? const BorderSide(
                                        color: PrayCalcColors.light, width: 2)
                                    : null,
                              ),
                              icon: _checking
                                  ? const SizedBox(
                                      width: 24,
                                      height: 24,
                                      child: CircularProgressIndicator(
                                        color: Colors.white,
                                        strokeWidth: 2,
                                      ),
                                    )
                                  : const Icon(Icons.refresh, size: 28),
                              label: const Text('Check Permission',
                                  style: TextStyle(fontSize: 24)),
                              onPressed: _checking ? null : _checkPermission,
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
        ),
      ),
    );
  }
}
