package com.praycalc.app

import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Shader
import android.graphics.Typeface
import android.service.dreams.DreamService
import android.view.View
import java.text.SimpleDateFormat
import java.util.*
import kotlin.math.sin

/**
 * Android TV / Fire TV DreamService screensaver.
 *
 * Registered in AndroidManifest.xml so users can select "PrayCalc" in
 * Settings → Screen saver. Shows next prayer countdown, current time,
 * Hijri date, and moon phase over a deep green background with slow
 * text drift for OLED burn-in prevention.
 *
 * Reads prayer data from FlutterSharedPreferences (same keys used by
 * widgets and the foreground notification service).
 */
class PrayCalcDreamService : DreamService() {

    private lateinit var screensaverView: ScreensaverView

    override fun onAttachedToWindow() {
        super.onAttachedToWindow()
        isInteractive = false
        isFullscreen = true
        isScreenBright = false // dim screen for OLED protection

        screensaverView = ScreensaverView(this)
        setContentView(screensaverView)
    }

    override fun onDreamingStarted() {
        super.onDreamingStarted()
        screensaverView.startAnimation()
    }

    override fun onDreamingStopped() {
        super.onDreamingStopped()
        screensaverView.stopAnimation()
    }

    override fun onDetachedFromWindow() {
        super.onDetachedFromWindow()
        screensaverView.stopAnimation()
    }

    /**
     * Custom view that renders the screensaver content.
     * Text drifts slowly (sinusoidal, 30-min cycle) for burn-in prevention.
     */
    private inner class ScreensaverView(
        context: android.content.Context
    ) : View(context) {

        private val handler = android.os.Handler(android.os.Looper.getMainLooper())
        private val tickRunnable = object : Runnable {
            override fun run() {
                invalidate()
                handler.postDelayed(this, 1000L)
            }
        }

        // Paints
        private val bgPaint = Paint().apply { color = Color.parseColor("#0D2F17") }
        private val timePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.WHITE
            textSize = 96f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            textAlign = Paint.Align.CENTER
        }
        private val labelPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#C9F27A")
            textSize = 48f
            typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            textAlign = Paint.Align.CENTER
        }
        private val subtitlePaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            color = Color.parseColor("#AAAAAA")
            textSize = 36f
            textAlign = Paint.Align.CENTER
        }
        private val moonPaint = Paint(Paint.ANTI_ALIAS_FLAG).apply {
            textSize = 64f
            textAlign = Paint.Align.CENTER
        }

        // Drift constants
        private val maxDrift = 100f  // max px from center
        private val driftCycleSec = 1800.0  // 30-min full cycle

        fun startAnimation() { handler.post(tickRunnable) }
        fun stopAnimation() { handler.removeCallbacks(tickRunnable) }

        override fun onDraw(canvas: Canvas) {
            super.onDraw(canvas)

            val w = width.toFloat()
            val h = height.toFloat()
            val now = Date()
            val elapsed = System.currentTimeMillis() / 1000.0

            // Background gradient
            bgPaint.shader = LinearGradient(
                0f, 0f, 0f, h,
                Color.parseColor("#0D2F17"),
                Color.parseColor("#1E5E2F"),
                Shader.TileMode.CLAMP
            )
            canvas.drawRect(0f, 0f, w, h, bgPaint)

            // Sinusoidal drift for burn-in prevention
            val driftX = (sin(elapsed * 2.0 * Math.PI / driftCycleSec) * maxDrift).toFloat()
            val driftY = (sin(elapsed * 2.0 * Math.PI / (driftCycleSec * 0.7)) * maxDrift * 0.6).toFloat()
            val cx = w / 2f + driftX
            val cy = h / 2f + driftY

            // Read prayer data from FlutterSharedPreferences.
            // Keys match ForegroundNotificationService (prefixed with "flutter.").
            val prefs = context.getSharedPreferences(
                "FlutterSharedPreferences", android.content.Context.MODE_PRIVATE
            )
            val nextPrayerName = prefs.getString("flutter.next_prayer_name", null) ?: "—"
            val nextPrayerCountdown = prefs.getString("flutter.next_prayer_countdown", null) ?: ""

            // Current time
            val timeStr = SimpleDateFormat("HH:mm", Locale.getDefault()).format(now)
            canvas.drawText(timeStr, cx, cy - 80f, timePaint)

            // Date
            val dateStr = SimpleDateFormat("EEEE, MMMM d", Locale.getDefault()).format(now)
            canvas.drawText(dateStr, cx, cy - 20f, subtitlePaint)

            // Next prayer label
            canvas.drawText(nextPrayerName, cx, cy + 60f, labelPaint)

            // Countdown
            if (nextPrayerCountdown.isNotEmpty()) {
                canvas.drawText(nextPrayerCountdown, cx, cy + 110f, subtitlePaint)
            }

            // Moon phase emoji (reads from SharedPrefs, written by Flutter)
            val moonEmoji = prefs.getString("flutter.dream_moon_emoji", null) ?: "🌙"
            canvas.drawText(moonEmoji, cx, cy + 190f, moonPaint)
        }
    }
}
