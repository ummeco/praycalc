// FILE: praycalc/flutter/test/platform_parity/parity_smoke_test.dart
// PURPOSE: Verify all 6 platform surfaces protected by ADR-P8-09 remain present and
//          buildable. Probe-style checks for native-only surfaces (watchOS, Wear OS,
//          Smart Display) plus presence checks for Flutter platform runners.
// SCOPE: No Flutter source modifications. No new pub packages. flutter_test +
//        dart:io only.
// INVARIANTS: ADR-P8-09 EXEMPT — praycalc/flutter is retained as-is. Any test
//             failure here means a regression against the locked Directive 3 exception.
// DO NOT: Add device-/simulator-required test cases. Add new pub_dev dependencies.
//         Touch lib/.

import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

/// Resolves the praycalc/flutter project root from the cwd that `flutter test`
/// uses (the package root). Returns an absolute path. Falls back to a heuristic
/// walk-up if the canonical layout differs.
Directory _flutterRoot() {
  final current = Directory.current.absolute;
  // `flutter test` runs from the package root by default.
  if (File('${current.path}/pubspec.yaml').existsSync()) {
    return current;
  }
  Directory probe = current;
  for (var i = 0; i < 6; i++) {
    if (File('${probe.path}/pubspec.yaml').existsSync()) {
      return probe;
    }
    probe = probe.parent;
  }
  return current;
}

/// Resolves the praycalc/ project root (parent of flutter/). Used to reach
/// sibling native projects: wearos/, swift/, smart/.
Directory _praycalcRoot() {
  return _flutterRoot().parent;
}

void main() {
  final flutterRoot = _flutterRoot();
  final praycalcRoot = _praycalcRoot();

  group('Platform parity smoke (ADR-P8-09)', () {
    test('iOS — Runner/Info.plist present and parseable', () {
      final infoPlist = File('${flutterRoot.path}/ios/Runner/Info.plist');
      expect(infoPlist.existsSync(), isTrue,
          reason:
              'iOS: ios/Runner/Info.plist missing — Flutter iOS target may be broken');
      final content = infoPlist.readAsStringSync();
      expect(content.contains('<plist'), isTrue,
          reason: 'iOS: Info.plist does not appear to be valid plist XML');
    });

    test('Android — app build.gradle and AndroidManifest.xml present', () {
      final buildGradle = File('${flutterRoot.path}/android/app/build.gradle');
      final buildGradleKts =
          File('${flutterRoot.path}/android/app/build.gradle.kts');
      expect(
          buildGradle.existsSync() || buildGradleKts.existsSync(),
          isTrue,
          reason:
              'Android: android/app/build.gradle{.kts} missing — Flutter Android target may be broken');
      final manifest =
          File('${flutterRoot.path}/android/app/src/main/AndroidManifest.xml');
      expect(manifest.existsSync(), isTrue,
          reason:
              'Android: AndroidManifest.xml missing under android/app/src/main/');
    });

    test('macOS — Runner/Info.plist present and macos/ Flutter target intact',
        () {
      final macosPlist = File('${flutterRoot.path}/macos/Runner/Info.plist');
      expect(macosPlist.existsSync(), isTrue,
          reason: 'macOS: macos/Runner/Info.plist missing');
    });

    test('watchOS — sibling Swift Package present (praycalc/swift/)', () {
      final packageSwift = File('${praycalcRoot.path}/swift/Package.swift');
      expect(packageSwift.existsSync(), isTrue,
          reason:
              'watchOS: praycalc/swift/Package.swift missing — native macOS/Watch companion broken');
      final content = packageSwift.readAsStringSync();
      expect(content.contains('Package('), isTrue,
          reason:
              'watchOS: Package.swift does not look like a valid SwiftPM manifest');
    });

    test('Wear OS — sibling Kotlin project present (praycalc/wearos/)', () {
      final wearosDir = Directory('${praycalcRoot.path}/wearos');
      expect(wearosDir.existsSync(), isTrue,
          reason:
              'Wear OS: praycalc/wearos/ directory missing — native Wear OS module broken');
      final buildGradleKts =
          File('${praycalcRoot.path}/wearos/app/build.gradle.kts');
      final buildGradle =
          File('${praycalcRoot.path}/wearos/app/build.gradle');
      expect(
          buildGradleKts.existsSync() || buildGradle.existsSync(),
          isTrue,
          reason:
              'Wear OS: app/build.gradle{.kts} missing under praycalc/wearos/');
    });

    test('tvOS / Fire TV — Amazon flavor build script present', () {
      final amazonBuild = File('${flutterRoot.path}/amazon-build.sh');
      expect(amazonBuild.existsSync(), isTrue,
          reason:
              'tvOS/Fire TV: amazon-build.sh missing — Amazon Fire TV flavor build broken');
    });

    test('Smart Display / Linux — Node server + Flutter Linux target present',
        () {
      final smartPkg = File('${praycalcRoot.path}/smart/package.json');
      expect(smartPkg.existsSync(), isTrue,
          reason:
              'Smart Display: praycalc/smart/package.json missing — Alexa/Google Home server broken');
      final linuxCMake = File('${flutterRoot.path}/linux/CMakeLists.txt');
      expect(linuxCMake.existsSync(), isTrue,
          reason:
              'Linux: linux/CMakeLists.txt missing — Flutter Linux/Smart Display display layer broken');
    });
  });
}
