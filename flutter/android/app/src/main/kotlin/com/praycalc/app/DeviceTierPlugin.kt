package com.praycalc.app

import android.app.ActivityManager
import android.content.Context
import android.os.Build
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

/**
 * PERF-C1: Exposes device tier info to Dart via MethodChannel.
 *
 * channel: com.praycalc.app/device_tier
 * methods:
 *   - isLowEnd -> Boolean: true if RAM < 1.5 GB or known low-end Fire TV model
 *   - totalRamMb -> Int: total device RAM in MB
 *   - model -> String: android.os.Build.MODEL
 */
class DeviceTierPlugin(context: Context, flutterEngine: FlutterEngine) {

    // Known low-end Amazon Fire TV model prefixes (Stick Lite variants).
    // AFTRSS = Fire TV Stick Lite (2020/2022), AFTSS = early Stick Lite
    private val lowEndFireTvModels = setOf("AFTRSS", "AFTSS")

    init {
        val am = context.getSystemService(Context.ACTIVITY_SERVICE) as ActivityManager
        val uiManager = context.getSystemService(Context.UI_MODE_SERVICE) as android.app.UiModeManager
        val memInfo = ActivityManager.MemoryInfo()
        am.getMemoryInfo(memInfo)
        
        val totalRamMb = (memInfo.totalMem / 1_048_576L).toInt()
        val model = Build.MODEL.uppercase()
        val isLowEnd = totalRamMb < 1_500 || lowEndFireTvModels.any { model.startsWith(it) }
        val isTv = uiManager.currentModeType == android.content.res.Configuration.UI_MODE_TYPE_TELEVISION

        MethodChannel(
            flutterEngine.dartExecutor.binaryMessenger,
            "com.praycalc.app/device_tier"
        ).setMethodCallHandler { call, result ->
            when (call.method) {
                "isLowEnd"    -> result.success(isLowEnd)
                "isTv"        -> result.success(isTv)
                "totalRamMb"  -> result.success(totalRamMb)
                "model"       -> result.success(Build.MODEL)
                else          -> result.notImplemented()
            }
        }
    }
}
