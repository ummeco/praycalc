package com.praycalc.app

import android.app.NotificationManager
import android.content.Context
import androidx.glance.appwidget.updateAll
import io.flutter.embedding.android.FlutterActivity
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

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

        // WearOS DataClient sync — sends prayer times to paired Wear OS device
        WearOsSyncPlugin(this, flutterEngine)

        // PERF-C1: Device tier (RAM / low-end Fire TV detection)
        DeviceTierPlugin(this, flutterEngine)
    }

    // AND-W-2: Refresh all widgets when the app resumes so home screen data
    // stays current after the user has been away.
    override fun onResume() {
        super.onResume()
        CoroutineScope(Dispatchers.IO).launch {
            PrayCalcWidget().updateAll(this@MainActivity)
            PrayCalcMediumWidget().updateAll(this@MainActivity)
            PrayCalcLargeWidget().updateAll(this@MainActivity)
        }
    }
}
