import 'package:flutter/services.dart';

/// Checks whether the device's Do Not Disturb (DnD) / Focus mode is active.
///
/// On Android this calls the Kotlin-side method channel which queries
/// [NotificationManager.currentInterruptionFilter].
/// On iOS this always returns false — iOS does not expose a public API for
/// checking Focus/DnD status; prayer notifications use
/// [InterruptionLevel.timeSensitive] to break through Focus automatically.
class DndService {
  DndService._();
  static final instance = DndService._();

  static const _channel = MethodChannel('com.praycalc.praycalc_app/dnd');

  /// Returns `true` if DnD / total-silence / priority-only mode is active.
  Future<bool> isDndActive() async {
    try {
      final result = await _channel.invokeMethod<bool>('isDndActive');
      return result ?? false;
    } on PlatformException {
      return false;
    } on MissingPluginException {
      // iOS — channel not registered; DnD bypass is handled by InterruptionLevel
      return false;
    }
  }
}
