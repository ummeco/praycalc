import 'dart:io';

import 'package:path/path.dart' as p;

/// Manages Linux auto-startup via XDG autostart .desktop files.
///
/// Creates or removes `~/.config/autostart/praycalc.desktop` to control
/// whether PrayCalc launches automatically at user login.
class LinuxStartup {
  static const _appId = 'praycalc';
  static const _desktopFileName = '$_appId.desktop';

  /// Returns the path to the XDG autostart directory.
  static String get _autostartDir {
    final configDir = Platform.environment['XDG_CONFIG_HOME'] ??
        p.join(Platform.environment['HOME']!, '.config');
    return p.join(configDir, 'autostart');
  }

  /// Returns the full path to the autostart .desktop file.
  static String get _desktopFilePath =>
      p.join(_autostartDir, _desktopFileName);

  /// Content of the .desktop file for XDG autostart.
  static String get _desktopFileContent => '''[Desktop Entry]
Type=Application
Name=PrayCalc
Comment=GPS-accurate Islamic prayer times
Exec=${Platform.resolvedExecutable}
Icon=praycalc
Terminal=false
Categories=Utility;
StartupNotify=false
X-GNOME-Autostart-enabled=true
''';

  /// Registers PrayCalc for auto-startup by writing the .desktop file.
  static Future<bool> register() async {
    if (!Platform.isLinux) return false;
    try {
      final dir = Directory(_autostartDir);
      if (!await dir.exists()) {
        await dir.create(recursive: true);
      }
      final file = File(_desktopFilePath);
      await file.writeAsString(_desktopFileContent);
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Removes PrayCalc from auto-startup by deleting the .desktop file.
  static Future<bool> unregister() async {
    if (!Platform.isLinux) return false;
    try {
      final file = File(_desktopFilePath);
      if (await file.exists()) {
        await file.delete();
      }
      return true;
    } catch (_) {
      return false;
    }
  }

  /// Checks whether the autostart .desktop file exists.
  static Future<bool> isRegistered() async {
    if (!Platform.isLinux) return false;
    try {
      return await File(_desktopFilePath).exists();
    } catch (_) {
      return false;
    }
  }
}
