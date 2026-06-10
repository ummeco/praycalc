package com.praycalc.app

import android.content.Context
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

/// Handles the Flutter MethodChannel "com.praycalc.app/wearos".
/// On a "syncPrayerTimes" call it writes the prayer-time data map to the
/// Wearable DataClient at path "/prayer_times", which the WearOS app picks
/// up via PrayerDataListenerService.
class WearOsSyncPlugin(
    private val context: Context,
    flutterEngine: FlutterEngine,
) {
    companion object {
        const val CHANNEL = "com.praycalc.app/wearos"
        const val DATA_PATH = "/prayer_times"
    }

    init {
        MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            CHANNEL,
        ).setMethodCallHandler { call, result ->
            when (call.method) {
                "syncPrayerTimes" -> {
                    @Suppress("UNCHECKED_CAST")
                    val args = call.arguments as? Map<String, String> ?: emptyMap()
                    syncToWear(args, result)
                }
                else -> result.notImplemented()
            }
        }
    }

    private fun syncToWear(data: Map<String, String>, result: MethodChannel.Result) {
        try {
            val request = PutDataMapRequest.create(DATA_PATH).apply {
                dataMap.putString("fajr",            data["fajr"]            ?: "")
                dataMap.putString("dhuhr",           data["dhuhr"]           ?: "")
                dataMap.putString("asr",             data["asr"]             ?: "")
                dataMap.putString("maghrib",         data["maghrib"]         ?: "")
                dataMap.putString("isha",            data["isha"]            ?: "")
                dataMap.putString("next_prayer",     data["next_prayer"]     ?: "")
                dataMap.putString("next_prayer_time",data["next_prayer_time"]?: "")
                dataMap.putString("location",        data["location"]        ?: "")
                // Include timestamp so DataClient detects a change even if times are same
                dataMap.putLong("ts", System.currentTimeMillis())
            }

            Wearable.getDataClient(context)
                .putDataItem(request.asPutDataRequest())
                .addOnSuccessListener { result.success(true) }
                .addOnFailureListener { result.success(false) }
        } catch (e: Exception) {
            // Play Services not available (e.g., Amazon Fire) — not an error
            result.success(false)
        }
    }
}
