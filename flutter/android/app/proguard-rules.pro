# PrayCalc ProGuard / R8 rules

# Flutter engine
-keep class io.flutter.** { *; }
-keep class io.flutter.embedding.** { *; }
-dontwarn io.flutter.embedding.**

# flutter_local_notifications
-keep class com.dexterous.** { *; }

# WorkManager
-keep class androidx.work.** { *; }
-dontwarn androidx.work.**

# Jetpack Glance (widgets)
-keep class androidx.glance.** { *; }
-dontwarn androidx.glance.**

# home_widget (FlutterSharedPreferences bridge)
-keep class es.antonborri.home_widget.** { *; }

# PrayCalc app classes
-keep class com.praycalc.praycalc_app.** { *; }

# Keep Kotlin metadata
-keepattributes *Annotation*
-keepattributes Signature
-keepattributes SourceFile,LineNumberTable

# Gson (if used for JSON serialization)
-keepattributes *Annotation*
-keep class com.google.gson.** { *; }
-dontwarn com.google.gson.**

# OkHttp (transitive from many packages)
-dontwarn okhttp3.**
-dontwarn okio.**
