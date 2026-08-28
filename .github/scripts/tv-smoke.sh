#!/usr/bin/env bash
#
# Boot smoke test for the PrayCalc Android TV build.
#
# Purpose:
#   Install the released TV APK on a running Android TV emulator, launch it
#   through the leanback launcher, and assert the process is still alive
#   afterwards.
#
# Inputs:
#   $1  path or glob to the APK (default: /tmp/PrayCalc-TV-*.apk)
#   Requires adb on PATH and exactly one booted emulator.
#
# Why this lives in a file rather than inline in the workflow:
#   reactivecircus/android-emulator-runner executes each LINE of its `script`
#   input as a separate `sh -c` invocation. Shell variables therefore do not
#   survive from one line to the next. The previous inline version set
#   PKG=$(...) on one line and used "$PKG" on the next, so it was always empty;
#   monkey then read the category as its count and failed with
#   "Count is not a number". Keeping the logic in one script keeps one shell.

set -euo pipefail

APK_GLOB="${1:-/tmp/PrayCalc-TV-*.apk}"

# Resolve the glob explicitly so a missing APK fails here with a clear message
# rather than inside adb.
# shellcheck disable=SC2206
APKS=( $APK_GLOB )
if [ ! -f "${APKS[0]}" ]; then
  echo "::error::No APK matched ${APK_GLOB}"
  exit 1
fi
APK="${APKS[0]}"
echo "Installing ${APK}"

adb wait-for-device
adb install -r "$APK"

# Derive the package from the device rather than hardcoding it, so a rename in
# tv/android/app/build.gradle does not silently break the smoke test. Retried
# because pm can briefly return an empty list right after a streamed install.
PKG=""
for attempt in 1 2 3 4 5; do
  PKG="$(adb shell pm list packages | tr -d '\r' | grep -i praycalc | head -1 | cut -d: -f2)"
  [ -n "$PKG" ] && break
  echo "pm list packages did not show the app yet (attempt ${attempt}/5), retrying"
  sleep 3
done

if [ -z "$PKG" ]; then
  echo "::error::App not found in 'pm list packages' after a successful install."
  echo "Installed packages matching 'ummeco':"
  adb shell pm list packages | tr -d '\r' | grep -i ummeco || echo "  (none)"
  exit 1
fi
echo "package: ${PKG}"

# Leanback is the TV launcher category. Fall back to a plain launch for builds
# that do not declare it.
adb shell monkey -p "$PKG" -c android.intent.category.LEANBACK_LAUNCHER 1 \
  || adb shell monkey -p "$PKG" 1

sleep 20

if adb shell pidof "$PKG" > /dev/null 2>&1; then
  echo "SMOKE PASS: ${PKG} still alive 20s after launch"
  exit 0
fi

echo "::error::${PKG} was not running 20s after launch."

# Diagnostics. The first attempt at this filtered `logcat -d -t 200` through a
# narrow crash pattern and printed nothing at all, which said only that the app
# was absent, not why. Widen the net and capture the app's own output too: a
# clean exit and a crash need different fixes, and on a software-GPU emulator a
# TV app can also die for reasons that would not reproduce on real hardware.

echo "--- launcher activities declared for ${PKG} ---"
adb shell "cmd package resolve-activity --brief -c android.intent.category.LEANBACK_LAUNCHER ${PKG}" 2>/dev/null || echo "  (leanback resolve failed)"
adb shell "cmd package resolve-activity --brief ${PKG}" 2>/dev/null || echo "  (default resolve failed)"

echo "--- crash buffer ---"
adb logcat -b crash -d -t 200 2>/dev/null | tail -80 || echo "  (crash buffer empty)"

echo "--- anything mentioning the package or a fatal ---"
adb logcat -b all -d -t 3000 2>/dev/null \
  | grep -iE "praycalc|ummeco|FATAL|AndroidRuntime|ActivityManager.*(die|kill|crash|ANR)" \
  | tail -80 || echo "  (nothing matched)"

exit 1
