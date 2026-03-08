import 'dart:async';
import 'dart:io';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:tray_manager/tray_manager.dart';

import '../../core/providers/prayer_provider.dart';
import '../../core/providers/settings_provider.dart';
import 'desktop_full_window.dart';

/// Manages the system tray icon and its context menu for desktop platforms.
class DesktopTrayApp with TrayListener {
  DesktopTrayApp(this._ref);

  final WidgetRef _ref;
  Timer? _updateTimer;

  Future<void> init() async {
    final iconPath = Platform.isWindows
        ? 'assets/brand/icon.ico'
        : 'assets/brand/icon.png';

    await trayManager.setIcon(iconPath);
    await trayManager.setToolTip('PrayCalc - Prayer Times');

    final menuItems = [
      MenuItem(key: 'open', label: 'Open Full Window'),
      MenuItem.separator(),
      MenuItem(key: 'show', label: 'Show Prayer Times'),
      MenuItem.separator(),
      MenuItem(key: 'quit', label: 'Quit PrayCalc'),
    ];
    await trayManager.setContextMenu(Menu(items: menuItems));
    trayManager.addListener(this);

    _updateTimer = Timer.periodic(
      const Duration(seconds: 30),
      (_) => _updateTooltip(),
    );
    _updateTooltip();
  }

  @override
  void onTrayIconMouseDown() {
    trayManager.popUpContextMenu();
  }

  @override
  void onTrayIconRightMouseDown() {
    trayManager.popUpContextMenu();
  }

  @override
  void onTrayMenuItemClick(MenuItem menuItem) {
    switch (menuItem.key) {
      case 'open':
      case 'show':
        DesktopFullWindow.show();
      case 'quit':
        exit(0);
    }
  }

  void _updateTooltip() {
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
