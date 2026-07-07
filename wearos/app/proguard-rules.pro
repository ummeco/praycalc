# PrayCalc Wear OS ProGuard Rules

# Keep data models for JSON parsing
-keep class app.praycalc.data.** { *; }

# Keep tile and complication services
-keep class app.praycalc.tile.** { *; }
-keep class app.praycalc.complications.** { *; }

# Keep JNI native method bridge (called by name from libpraycalc_native.so)
-keepclasseswithmembernames class app.praycalc.data.PrayCalcNative {
    native <methods>;
}
