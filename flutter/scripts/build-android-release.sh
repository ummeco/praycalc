#!/bin/bash
# build-android-release.sh — Build AABs for Mobile/TV (Flutter) and Wear OS
# Usage: ./scripts/build-android-release.sh

set -e

# Base directories
PROJECT_ROOT="$(pwd)/.."
FLUTTER_DIR="$(pwd)"
WEAROS_DIR="$PROJECT_ROOT/wearos"
DIST_DIR="$FLUTTER_DIR/build/distribution"

echo "🚀 Starting PrayCalc Android Release Build..."
mkdir -p "$DIST_DIR"

# 1. Build Flutter App Bundle (Mobile + Tablet + TV) via Shorebird
echo "--- Building Flutter App Bundle (google flavor) via Shorebird ---"
shorebird release android \
  --flavor google \
  --target lib/main.dart

cp "$FLUTTER_DIR/build/app/outputs/bundle/googleRelease/app-google-release.aab" "$DIST_DIR/praycalc-mobile-tv.aab"

# 2. Build Wear OS App Bundle
echo "--- Building Wear OS App Bundle ---"
cd "$WEAROS_DIR"
./gradlew :app:bundleRelease

cp "$WEAROS_DIR/app/build/outputs/bundle/release/app-release.aab" "$DIST_DIR/praycalc-wearos.aab"

cd "$FLUTTER_DIR"

echo ""
echo "✅ Builds complete! Artifacts located in:"
echo "   $DIST_DIR/praycalc-mobile-tv.aab"
echo "   $DIST_DIR/praycalc-wearos.aab"
echo ""
echo "Next steps:"
echo "1. Upload BOTH files to the Google Play Console in the same release."
echo "2. Ensure 'Wear OS' and 'Android TV' release types are enabled in Advanced Settings."
