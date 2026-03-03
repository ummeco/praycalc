package com.praycalc.praycalc_app

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.IBinder
import androidx.core.app.NotificationCompat

/**
 * Persistent foreground service that shows the next prayer time in the
 * notification shade. Runs at IMPORTANCE_LOW so it is silent but always visible.
 *
 * Start via [start]; stop via [stop].
 */
class ForegroundNotificationService : Service() {

    companion object {
        private const val CHANNEL_ID = "prayer_countdown"
        private const val CHANNEL_RAMADAN = "praycalc_ramadan"
        private const val NOTIFICATION_ID = 1
        private const val NOTIFICATION_ID_RAMADAN = 620
        private const val ACTION_UPDATE = "com.praycalc.praycalc_app.UPDATE_SHADE"

        fun start(context: Context) {
            val intent = Intent(context, ForegroundNotificationService::class.java)
            context.startForegroundService(intent)
        }

        fun stop(context: Context) {
            val intent = Intent(context, ForegroundNotificationService::class.java)
            context.stopService(intent)
        }
    }

    private val handler = android.os.Handler(android.os.Looper.getMainLooper())
    private val updateRunnable = object : Runnable {
        override fun run() {
            updateNotification()
            handler.postDelayed(this, 60_000L)
        }
    }

    override fun onCreate() {
        super.onCreate()
        createChannel()
        startForeground(NOTIFICATION_ID, buildNotification("Calculating prayer times…", ""))
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        handler.post(updateRunnable)
        return START_STICKY
    }

    override fun onDestroy() {
        handler.removeCallbacks(updateRunnable)
        super.onDestroy()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    // ── Private helpers ───────────────────────────────────────────────────────

    private fun createChannel() {
        val channel = NotificationChannel(
            CHANNEL_ID,
            "Prayer Countdown",
            NotificationManager.IMPORTANCE_LOW,
        ).apply {
            description = "Persistent countdown to next prayer"
            setShowBadge(false)
        }
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(channel)
    }

    private fun updateNotification() {
        // Read latest values written by Flutter via SharedPreferences bridge.
        // Flutter writes keys with "flutter." prefix via shared_preferences package.
        val prefs = getSharedPreferences("FlutterSharedPreferences", Context.MODE_PRIVATE)
        val nextPrayer = prefs.getString("flutter.next_prayer_name", null) ?: "Next prayer"
        val countdown  = prefs.getString("flutter.next_prayer_countdown", null) ?: "--:--"

        // Map prayer name → config index (matches defaultNotificationConfigs order).
        val prayerIndex = mapOf(
            "Fajr" to 0, "Sunrise" to 1, "Dhuhr" to 2,
            "Asr" to 3, "Maghrib" to 4, "Isha" to 5,
        )[nextPrayer] ?: -1

        // Append 🔊 when adhan type is not silent so user can see at a glance.
        val adhanType = if (prayerIndex >= 0)
            prefs.getString("flutter.shade_adhan_type_$prayerIndex", "makkah")
        else null
        val subtitle = if (adhanType != null && adhanType != "silent")
            "$countdown  🔊"
        else
            countdown

        val nm = getSystemService(NotificationManager::class.java)
        nm.notify(NOTIFICATION_ID, buildNotification(nextPrayer, subtitle))

        // Ramadan shade — second persistent notification for Suhoor/Iftar countdown.
        val sahurMins = prefs.getInt("flutter.sahur_mins_remaining", -1)
        val iftarMins = prefs.getInt("flutter.iftar_mins_remaining", -1)
        when {
            iftarMins > 0 -> {
                val h = iftarMins / 60; val m = iftarMins % 60
                val label = if (h > 0) "${h}h ${m}m until Iftar" else "${m}m until Iftar"
                nm.notify(NOTIFICATION_ID_RAMADAN, buildRamadanNotification("🌙 Ramadan", label))
            }
            sahurMins > 0 -> {
                val h = sahurMins / 60; val m = sahurMins % 60
                val label = if (h > 0) "${h}h ${m}m until Suhoor ends" else "${m}m until Suhoor ends"
                nm.notify(NOTIFICATION_ID_RAMADAN, buildRamadanNotification("🌙 Ramadan", label))
            }
            else -> nm.cancel(NOTIFICATION_ID_RAMADAN)
        }
    }

    private fun buildRamadanNotification(title: String, subtitle: String): Notification {
        val tapIntent = packageManager
            .getLaunchIntentForPackage(packageName)
            ?.apply { flags = Intent.FLAG_ACTIVITY_SINGLE_TOP }
        val pi = PendingIntent.getActivity(
            this, 1, tapIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )
        return NotificationCompat.Builder(this, CHANNEL_RAMADAN)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(subtitle)
            .setOngoing(true)
            .setSilent(true)
            .setContentIntent(pi)
            .build()
    }

    private fun buildNotification(title: String, subtitle: String): Notification {
        val tapIntent = packageManager
            .getLaunchIntentForPackage(packageName)
            ?.apply { flags = Intent.FLAG_ACTIVITY_SINGLE_TOP }
        val pi = PendingIntent.getActivity(
            this, 0, tapIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(R.mipmap.ic_launcher)
            .setContentTitle(title)
            .setContentText(subtitle)
            .setOngoing(true)
            .setSilent(true)
            .setContentIntent(pi)
            .build()
    }
}
