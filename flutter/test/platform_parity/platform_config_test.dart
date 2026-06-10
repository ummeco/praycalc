// FILE: praycalc/flutter/test/platform_parity/platform_config_test.dart
// PURPOSE: Lock pubspec.yaml configuration that ADR-P8-09 depends on. Material
//          design, Shorebird OTA, and Amazon Fire TV flavor support are
//          load-bearing for the multi-platform exception.
// SCOPE: pubspec.yaml string-level checks only. No widget tests. No new pub
//        packages.
// INVARIANTS: Material design enabled; Shorebird present; Amazon flavor build
//             script wired through pubspec.yaml asset list or build scripts.
// DO NOT: Touch lib/. Add dependencies. Modify pubspec.

import 'dart:io';

import 'package:flutter_test/flutter_test.dart';

Directory _flutterRoot() {
  final current = Directory.current.absolute;
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

void main() {
  final flutterRoot = _flutterRoot();
  final pubspecPath = '${flutterRoot.path}/pubspec.yaml';
  final pubspec = File(pubspecPath);

  group('Platform config (ADR-P8-09)', () {
    test('pubspec.yaml exists and is readable', () {
      expect(pubspec.existsSync(), isTrue,
          reason: 'pubspec.yaml not found at $pubspecPath');
    });

    test('pubspec uses Material Design', () {
      final content = pubspec.readAsStringSync();
      expect(content.contains('uses-material-design: true'), isTrue,
          reason:
              'pubspec.yaml must declare uses-material-design: true for Material widgets');
    });

    test('Shorebird OTA dependency present', () {
      final content = pubspec.readAsStringSync();
      expect(content.contains('shorebird_code_push'), isTrue,
          reason:
              'pubspec.yaml must depend on shorebird_code_push for OTA updates');
      final shorebirdYaml = File('${flutterRoot.path}/shorebird.yaml');
      expect(shorebirdYaml.existsSync(), isTrue,
          reason:
              'shorebird.yaml missing at project root — OTA pipeline broken');
    });

    test('Amazon Fire TV flavor build script present and executable-looking',
        () {
      final amazonScript = File('${flutterRoot.path}/amazon-build.sh');
      expect(amazonScript.existsSync(), isTrue,
          reason:
              'amazon-build.sh missing — Fire TV / Amazon flavor build broken');
      final content = amazonScript.readAsStringSync();
      expect(content.contains('flutter build') || content.contains('flutter '),
          isTrue,
          reason:
              'amazon-build.sh does not invoke flutter build — script may be a stub');
    });

    test('Geolocation + Hijri dependencies retained (multi-platform reach)',
        () {
      final content = pubspec.readAsStringSync();
      // These two are core multi-platform dependencies. Their removal would
      // signal a quiet drift away from the 9-platform reach.
      expect(content.contains('geolocator'), isTrue,
          reason:
              'pubspec.yaml: geolocator dependency missing — required for prayer GPS');
      expect(content.contains('hijri'), isTrue,
          reason:
              'pubspec.yaml: hijri dependency missing — required for Hijri date display');
    });
  });
}
