import 'package:in_app_review/in_app_review.dart';
import 'package:shared_preferences/shared_preferences.dart';

const _kFirstLaunchKey = 'first_launch_ms';
const _kRatingShownKey = 'rating_shown';
const _kMinDays = 7;

/// Requests an in-app review if the user has been using the app for at least
/// [_kMinDays] days and has not been shown the prompt before.
///
/// Call this once per session from a stable screen (e.g. after prayer times
/// load successfully). The OS may still suppress the dialog at its discretion.
Future<void> maybeRequestReview() async {
  try {
    final prefs = await SharedPreferences.getInstance();

    // Record first launch timestamp once.
    if (!prefs.containsKey(_kFirstLaunchKey)) {
      await prefs.setInt(
        _kFirstLaunchKey,
        DateTime.now().millisecondsSinceEpoch,
      );
      return; // Too early — this IS the first launch.
    }

    // Already shown — never ask twice.
    if (prefs.getBool(_kRatingShownKey) ?? false) return;

    // Check age.
    final firstMs = prefs.getInt(_kFirstLaunchKey)!;
    final ageDays =
        DateTime.now().difference(DateTime.fromMillisecondsSinceEpoch(firstMs)).inDays;
    if (ageDays < _kMinDays) return;

    // Request the OS prompt.
    final inAppReview = InAppReview.instance;
    if (await inAppReview.isAvailable()) {
      await inAppReview.requestReview();
      await prefs.setBool(_kRatingShownKey, true);
    }
  } catch (_) {
    // Never crash on rating prompt failure.
  }
}
