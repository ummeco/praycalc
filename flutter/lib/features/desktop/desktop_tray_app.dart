import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:tray_manager/tray_manager.dart';

import '../../core/providers/prayer_provider.dart';
import '../../core/providers/settings_provider.dart';
import '../../core/router/app_router.dart';
import 'desktop_full_window.dart';
import 'desktop_popover.dart';

/// Manages the system tray icon and its context menu for desktop platforms.
class DesktopTrayApp with TrayListener {
  DesktopTrayApp(this._ref);

  final WidgetRef _ref;
  Timer? _updateTimer;

  // Cached label for the dynamic "Next Prayer" menu item.
  String _nextPrayerLabel = 'Next Prayer…';

  Future<void> init() async {
    final iconPath = Platform.isWindows
        ? 'assets/brand/icon.ico'
        : 'assets/brand/icon.png';

    await trayManager.setIcon(iconPath);
    await trayManager.setToolTip('PrayCalc - Prayer Times');

    await _rebuildMenu();
    trayManager.addListener(this);

    _updateTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _updateTooltipAndMenu(),
    );
    _updateTooltipAndMenu();

    // Set up platform auto-launch on first run.
    _setupAutoLaunch();
  }

  Future<void> _rebuildMenu() async {
    final menuItems = [
      MenuItem(key: 'open', label: 'Open PrayCalc'),
      MenuItem(key: 'next', label: _nextPrayerLabel, disabled: true),
      MenuItem.separator(),
      MenuItem(key: 'settings', label: 'Settings…'),
      MenuItem(key: 'tvs', label: 'TV Displays…'),
      MenuItem.separator(),
      MenuItem(key: 'quit', label: 'Quit PrayCalc'),
    ];
    await trayManager.setContextMenu(Menu(items: menuItems));
  }

  /// Configures the app to launch at login.
  /// - Windows: HKCU\Software\Microsoft\Windows\CurrentVersion\Run registry key.
  /// - Linux: writes ~/.config/autostart/praycalc.desktop.
  /// Runs silently — failures are non-fatal.
  void _setupAutoLaunch() {
    if (Platform.isWindows) {
      _setWindowsAutoLaunch();
    } else if (Platform.isLinux) {
      _setLinuxAutostart();
    } else if (Platform.isMacOS) {
      _setMacOSLaunchAgent();
    }
  }

  void _setWindowsAutoLaunch() {
    try {
      final exe = Platform.resolvedExecutable;
      Process.run('reg', [
        'add',
        r'HKCU\Software\Microsoft\Windows\CurrentVersion\Run',
        '/v',
        'PrayCalc',
        '/t',
        'REG_SZ',
        '/d',
        exe,
        '/f',
      ]);
    } catch (_) {
      // Non-fatal — user can enable manually via Settings.
    }
  }

  void _setLinuxAutostart() {
    try {
      final exe = Platform.resolvedExecutable;
      final autostartDir =
          Directory('${Platform.environment['HOME']}/.config/autostart');
      if (!autostartDir.existsSync()) autostartDir.createSync(recursive: true);
      final desktopFile = File('${autostartDir.path}/praycalc.desktop');
      desktopFile.writeAsStringSync(
        '[Desktop Entry]\n'
        'Type=Application\n'
        'Name=PrayCalc\n'
        'Comment=GPS-accurate Islamic prayer times\n'
        'Exec=$exe\n'
        'Icon=praycalc\n'
        'X-GNOME-Autostart-enabled=true\n'
        'Hidden=false\n',
      );
    } catch (_) {
      // Non-fatal — user can enable manually via system settings.
    }
  }

  void _setMacOSLaunchAgent() {
    try {
      final exe = Platform.resolvedExecutable;
      final home = Platform.environment['HOME'] ?? '';
      if (home.isEmpty) return;
      final agentsDir = Directory('$home/Library/LaunchAgents');
      if (!agentsDir.existsSync()) agentsDir.createSync(recursive: true);
      final plist = File('${agentsDir.path}/com.praycalc.app.plist');
      plist.writeAsStringSync(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"'
        ' "http://www.apple.com/DTDs/PropertyList-1.0.dtd">\n'
        '<plist version="1.0">\n'
        '<dict>\n'
        '  <key>Label</key>\n'
        '  <string>com.praycalc.app</string>\n'
        '  <key>ProgramArguments</key>\n'
        '  <array>\n'
        '    <string>$exe</string>\n'
        '  </array>\n'
        '  <key>RunAtLoad</key>\n'
        '  <true/>\n'
        '  <key>KeepAlive</key>\n'
        '  <false/>\n'
        '</dict>\n'
        '</plist>\n',
      );
    } catch (_) {
      // Non-fatal — user can enable manually via System Settings > General > Login Items.
    }
  }

  @override
  void onTrayIconMouseDown() {
    if (Platform.isMacOS) {
      final ctx = appRouter.routerDelegate.navigatorKey.currentContext;
      if (ctx != null) {
        showDialog(
          context: ctx,
          barrierColor: Colors.transparent,
          builder: (_) => const Align(
            alignment: Alignment.bottomRight,
            child: Padding(
              padding: EdgeInsets.only(bottom: 24, right: 24),
              child: DesktopPopover(),
            ),
          ),
        );
      }
    } else {
      trayManager.popUpContextMenu();
    }
  }

  @override
  void onTrayIconRightMouseDown() {
    trayManager.popUpContextMenu();
  }

  @override
  void onTrayMenuItemClick(MenuItem menuItem) {
    switch (menuItem.key) {
      case 'open':
        DesktopFullWindow.show();
      case 'settings':
        appRouter.push(Routes.settings);
      case 'tvs':
        appRouter.push(Routes.tvDeviceList);
      case 'quit':
        exit(0);
    }
  }

  void _updateTooltipAndMenu() {
    final timesAsync = _ref.read(prayerTimesProvider);
    final settings = _ref.read(settingsProvider);
    final city = _ref.read(cityProvider);

    timesAsync.whenData((times) {
      final now = DateTime.now();
      final nowH = now.hour + now.minute / 60.0 + now.second / 3600.0;

      final prayers = [
        ('Fajr', times.fajr),
        ('Sunrise', times.sunrise),
        ('Dhuhr', times.dhuhr),
        ('Asr', times.asr),
        ('Maghrib', times.maghrib),
        ('Isha', times.isha),
      ];

      String nextName = 'Fajr';
      double nextTime = times.fajr;
      for (final (name, time) in prayers) {
        if (time > nowH) {
          nextName = name;
          nextTime = time;
          break;
        }
      }

      final timeStr = _formatH(nextTime, settings.use24h);
      final cityName = city?.displayName ?? '';
      final tooltip = cityName.isNotEmpty
          ? '$nextName at $timeStr - $cityName'
          : '$nextName at $timeStr';

      trayManager.setToolTip(tooltip);

      // Update the "Next Prayer" label in the context menu.
      _nextPrayerLabel = 'Next: $nextName at $timeStr';
      _rebuildMenu();
    });
  }

  String _formatH(double h, bool use24h) {
    final totalMin = (h * 60).round();
    final hh = (totalMin ~/ 60) % 24;
    final mm = totalMin % 60;
    if (use24h) {
      return '${hh.toString().padLeft(2, '0')}:${mm.toString().padLeft(2, '0')}';
    }
    final period = hh >= 12 ? 'PM' : 'AM';
    final h12 = hh % 12 == 0 ? 12 : hh % 12;
    return '$h12:${mm.toString().padLeft(2, '0')} $period';
  }

  void dispose() {
    _updateTimer?.cancel();
    trayManager.removeListener(this);
    trayManager.destroy();
  }
}
