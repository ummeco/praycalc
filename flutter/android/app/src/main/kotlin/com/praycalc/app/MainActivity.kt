package com.praycalc.app

import android.app.NotificationManager
import android.content.Context
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : FlutterActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)

        // DnD / Focus mode detection channel
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "com.praycalc.app/dnd")
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

        // IAP plugin (Google Play Billing)
        IAPPlugin(this, flutterEngine)

        // Audio focus plugin
        AudioFocusPlugin(this, flutterEngine)

        // TV launcher enable/disable + stock launcher escape
        flutterEngine.plugins.add(TvLauncherPlugin())

        // TV brightness control (WRITE_SETTINGS via WindowManager)
        flutterEngine.plugins.add(TvBrightnessPlugin())
    }
}
