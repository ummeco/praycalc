package com.praycalc.praycalc_app

import android.app.NotificationManager
import android.content.Context
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        // DnD / Focus mode detection channel
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "com.praycalc.praycalc_app/dnd")
            .setMethodCallHandler { call, result ->
                when (call.method) {
                    "isDndActive" -> {
                        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
                        val filter = nm.currentInterruptionFilter
                        val dndActive =
                            filter == NotificationManager.INTERRUPTION_FILTER_NONE ||
                            filter == NotificationManager.INTERRUPTION_FILTER_ALARMS ||
                            filter == NotificationManager.INTERRUPTION_FILTER_PRIORITY
                        result.success(dndActive)
                    }
                    else -> result.notImplemented()
                }
            }
    }
}
