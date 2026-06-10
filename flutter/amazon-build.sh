#!/bin/bash
# amazon-build.sh — Build PrayCalc APK for Amazon Appstore (Fire TV)
# Usage: ./amazon-build.sh
# Output: build/app/outputs/flutter-apk/app-amazon-release.apk

set -e

echo "Building PrayCalc for Amazon Appstore (Fire TV)..."

# Build amazon release APK
flutter build apk \
  --flavor amazon \
  --target lib/main.dart \
  --dart-define=FLAVOR=amazon \
  --release \
  --no-tree-shake-icons

echo ""
echo "APK built successfully:"
echo "build/app/outputs/flutter-apk/app-amazon-release.apk"
echo ""
echo "Next steps:"
echo "1. Test on Fire TV device: adb install build/app/outputs/flutter-apk/app-amazon-release.apk"
echo "2. Test D-pad navigation, adhan playback, TV pairing"
echo "3. Submit to Amazon Appstore Developer Console"
