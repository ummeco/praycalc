# PrayCalc Wear OS ProGuard Rules

# Keep data models for JSON parsing
-keep class com.praycalc.wear.data.** { *; }

# Keep tile and complication services
-keep class com.praycalc.wear.tile.** { *; }
-keep class com.praycalc.wear.complications.** { *; }
