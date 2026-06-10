package com.praycalc.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Receives BOOT_COMPLETED and restarts the foreground prayer-shade service.
 * Flutter-side WorkManager reschedules exact-alarm notifications separately
 * via the background task registered on app startup.
 */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            ForegroundNotificationService.start(context)
        }
    }
}
