package com.praycalc.app

// NotificationService.kt — v1.1 persistent notification polish pass.
// Spec §10.1, S19-D T20
//
// Extends ForegroundNotificationService with:
//   - Android 13+ POST_NOTIFICATIONS permission check before showing
//   - BootReceiver re-scheduling via startIfPermitted()
//   - Widget-key aligned data reading (flutter.widget_* prefix, matching PrayerGlanceWidget)
//   - Runs minute-tick timer (NOT second — battery) per spec
//
// BootReceiver calls NotificationService.startIfPermitted() on BOOT_COMPLETED.
// MainActivity calls it on app launch (replaces direct ForegroundNotificationService.start).

import android.Manifest
import android.app.*
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat

class NotificationService : Service() {

    companion object {
        private const val CHANNEL_ID     = "prayer_countdown_v11"
        private const val NOTIFICATION_ID = 2    // distinct from ForegroundNotificationService

        /** Start the service only if POST_NOTIFICATIONS is granted (API 33+) or below API 33. */
        fun startIfPermitted(context: Context) {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                val granted = ContextCompat.checkSelfPermission(
                    context,
                    Manifest.permission.POST_NOTIFICATIONS
                ) == PackageManager.PERMISSION_GRANTED
                if (!granted) return
            }
            val intent = Intent(context, NotificationService::class.java)
            context.startForegroundService(intent)
        }

        fun stop(context: Context) {
            context.stopService(Intent(context, NotificationService::class.java))
        }
    }

    private val handler = android.os.Handler(android.os.Looper.getMainLooper())
    private val tickRunnable = object : Runnable {
        override fun run() {
            updateNotification()
            handler.postDelayed(this, 60_000L)  // every minute — not every second (battery)
        }
    }

    override fun onCreate() {
        super.onCreate()
        ensureChannel()
        startForeground(NOTIFICATION_ID, buildNotification("Calculating…", ""))
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        handler.post(tickRunnable)
        return START_STICKY
    }

    override fun onDestroy() {
        handler.removeCallbacks(tickRunnable)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    // MARK: - Channel

    private fun ensureChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Prayer Countdown",
                NotificationManager.IMPORTANCE_LOW,
            ).apply {
                description = "Next prayer time — updated every minute"
                setShowBadge(false)
            }
            getSystemService(NotificationManager::class.java)
                ?.createNotificationChannel(channel)
        }
    }

    // MARK: - Notification update

    private fun updateNotification() {
        val prefs = getSharedPreferences("FlutterSharedPreferences", Context.MODE_PRIVATE)
        val nextPrayer   = prefs.getString("flutter.widget_next_prayer",      null) ?: "Next prayer"
        val nextTime     = prefs.getString("flutter.widget_next_prayer_time", null) ?: "--:--"
        val nextTs       = prefs.getFloat("flutter.widget_next_prayer_ts",    0f).toDouble()
        val locationName = prefs.getString("flutter.widget_location_name",    null) ?: ""

        val secs = ((nextTs - System.currentTimeMillis() / 1000.0).toLong()).coerceAtLeast(0)
        val countdown = when {
            secs <= 0          -> "Now!"
            secs < 3600        -> "${secs / 60}m"
            else               -> "${secs / 3600}h ${(secs % 3600) / 60}m"
        }

        val title   = nextPrayer
        val subtext = buildString {
            append(nextTime)
            if (countdown.isNotEmpty() && countdown != "Now!") append(" · in $countdown")
            else if (countdown == "Now!") append(" · Now!")
            if (locationName.isNotEmpty()) append("\n$locationName")
        }

        val nm = getSystemService(NotificationManager::class.java)
        nm?.notify(NOTIFICATION_ID, buildNotification(title, subtext))
    }

    private fun buildNotification(title: String, text: String): Notification {
        val tapIntent = packageManager
            .getLaunchIntentForPackage(packageName)
            ?.apply { flags = Intent.FLAG_ACTIVITY_SINGLE_TOP }
        val pi = PendingIntent.getActivity(
            this, NOTIFICATION_ID, tapIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(text)
            .setStyle(NotificationCompat.BigTextStyle().bigText(text))
            .setOngoing(true)
            .setSilent(true)
            .setContentIntent(pi)
            .build()
    }
}
