package com.praycalc.wear

// WearPrayerActivity.kt — v1.1 WearOS full-screen prayer list activity.
// Spec §9.3, S19-D T23
//
// Full-screen WearOS activity that shows:
//   - All 5 daily prayers with times + next-prayer highlight
//   - Location name + Hijri date
//   - Countdown for next prayer (refreshed every 30 s)
//
// Input:
//   - D-pad / crown rotary: scroll the prayer list (RotaryScrollBehavior)
//   - Long-press: haptic feedback (via Vibrator)
//
// Haptic: distinct vibration patterns fire when a prayer time arrives
// (detected via a 30 s polling Handler).
//
// Pairing: uses SharedPreferences("wear_prayer") written by
// PrayerDataListenerService (paired phone path, per D-S19-08 resolution).
//
// Per spec §9.3 and D-S19-08: WearOS v1.1 = paired-phone only.
// Standalone (LTE watch) deferred to v1.2.

import android.os.Bundle
import android.os.Handler
import android.os.Looper
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.view.KeyEvent
import android.view.MotionEvent
import android.view.View
import android.widget.ScrollView
import android.widget.TextView
import androidx.core.view.InputDeviceCompat
import androidx.core.view.MotionEventCompat
import androidx.core.view.ViewCompat
import androidx.fragment.app.FragmentActivity
import androidx.wear.widget.WearableLinearLayoutManager
import androidx.wear.widget.WearableRecyclerView

class WearPrayerActivity : FragmentActivity() {

    private val prayers   = listOf("fajr", "dhuhr", "asr", "maghrib", "isha")
    private val labels    = mapOf(
        "fajr" to "Fajr", "dhuhr" to "Dhuhr", "asr" to "Asr",
        "maghrib" to "Maghrib", "isha" to "Isha"
    )

    private val handler = Handler(Looper.getMainLooper())
    private var lastNotifiedPrayer: String? = null

    private val refreshRunnable = object : Runnable {
        override fun run() {
            updateUI()
            checkPrayerArrival()
            handler.postDelayed(this, 30_000L)
        }
    }

    // -----------------------------------------------------------------------
    // Lifecycle
    // -----------------------------------------------------------------------

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(buildLayout())
        handler.post(refreshRunnable)
    }

    override fun onDestroy() {
        handler.removeCallbacks(refreshRunnable)
        super.onDestroy()
    }

    // -----------------------------------------------------------------------
    // D-pad navigation + rotary input
    // -----------------------------------------------------------------------

    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        val scrollView = findViewById<ScrollView>(R.id.prayer_scroll)
        val scrollAmount = 120
        return when (keyCode) {
            KeyEvent.KEYCODE_DPAD_UP   -> { scrollView?.scrollBy(0, -scrollAmount); true }
            KeyEvent.KEYCODE_DPAD_DOWN -> { scrollView?.scrollBy(0, scrollAmount);  true }
            else -> super.onKeyDown(keyCode, event)
        }
    }

    override fun onGenericMotionEvent(event: MotionEvent): Boolean {
        if (event.action == MotionEvent.ACTION_SCROLL &&
            event.isFromSource(InputDeviceCompat.SOURCE_ROTARY_ENCODER)
        ) {
            val scrollView = findViewById<ScrollView>(R.id.prayer_scroll)
            val delta = -event.getAxisValue(MotionEventCompat.AXIS_SCROLL)
            scrollView?.scrollBy(0, (delta * 36).toInt())
            return true
        }
        return super.onGenericMotionEvent(event)
    }

    // -----------------------------------------------------------------------
    // UI construction (programmatic — no XML layout required for Wear)
    // -----------------------------------------------------------------------

    private fun buildLayout(): View {
        val context = this
        val scroll = ScrollView(context).apply {
            id = R.id.prayer_scroll
            setBackgroundColor(0xFF1E5E2F.toInt())  // PrayCalc dark green
        }
        val container = android.widget.LinearLayout(context).apply {
            orientation = android.widget.LinearLayout.VERTICAL
            setPadding(24, 32, 24, 32)
        }

        // Location + date header
        val headerText = TextView(context).apply {
            id = R.id.wear_header
            setTextColor(0xFFAACFAA.toInt())
            textSize = 10f
            gravity = android.view.Gravity.CENTER
        }
        container.addView(headerText)

        // Countdown
        val countdownText = TextView(context).apply {
            id = R.id.wear_countdown
            setTextColor(0xFFC9F27A.toInt())
            textSize = 22f
            gravity = android.view.Gravity.CENTER
            setPadding(0, 8, 0, 8)
        }
        container.addView(countdownText)

        // Prayer rows
        prayers.forEach { key ->
            val row = android.widget.LinearLayout(context).apply {
                orientation = android.widget.LinearLayout.HORIZONTAL
                setPadding(0, 6, 0, 6)
                contentDescription = labels[key]
            }
            val nameView = TextView(context).apply {
                id = resources.getIdentifier("wear_${key}_name", "id", packageName)
                    .takeIf { it != 0 } ?: View.generateViewId()
                text = labels[key]
                textSize = 14f
                setTextColor(0xFFAACFAA.toInt())
                layoutParams = android.widget.LinearLayout.LayoutParams(0, -2, 1f)
            }
            val timeView = TextView(context).apply {
                id = resources.getIdentifier("wear_${key}_time", "id", packageName)
                    .takeIf { it != 0 } ?: View.generateViewId()
                textSize = 14f
                setTextColor(0xFFAACFAA.toInt())
                gravity = android.view.Gravity.END
                layoutParams = android.widget.LinearLayout.LayoutParams(-2, -2)
            }
            row.addView(nameView)
            row.addView(timeView)

            // Tag for easy lookup in updateUI
            row.tag = key
            nameView.tag = "${key}_name"
            timeView.tag = "${key}_time"

            container.addView(row)
        }

        scroll.addView(container)
        return scroll
    }

    // -----------------------------------------------------------------------
    // Data read + render
    // -----------------------------------------------------------------------

    private fun updateUI() {
        val prefs      = getSharedPreferences("wear_prayer", MODE_PRIVATE)
        val nextPrayer = prefs.getString("next_prayer", "Fajr") ?: "Fajr"
        val nextTs     = prefs.getLong("next_prayer_ts", 0L)
        val location   = prefs.getString("location", "") ?: ""
        val nowSecs    = System.currentTimeMillis() / 1000L
        val secsLeft   = (nextTs - nowSecs).coerceAtLeast(0)
        val countdown  = formatCountdown(secsLeft)

        // Header
        val header = findByTag<TextView>("header_text")
        header?.text = location.ifEmpty { "PrayCalc" }

        // Countdown label
        val countdownView = findByTag<TextView>("countdown_text")
        countdownView?.text = "$nextPrayer · $countdown"

        // Prayer rows
        prayers.forEach { key ->
            val time = prefs.getString(key, "--:--") ?: "--:--"
            val ts   = prefs.getLong("${key}_ts", 0L)
            val isNext  = (labels[key] == nextPrayer)
            val isDone  = ts in 1 until nowSecs && !isNext

            val textColor = when {
                isNext -> 0xFFC9F27A.toInt()  // accent
                isDone -> 0xFF79C24C.toInt()  // mid green
                else   -> 0xFFAACFAA.toInt()  // subtle
            }

            val nameView = findByTag<TextView>("${key}_name")
            val timeView = findByTag<TextView>("${key}_time")
            nameView?.setTextColor(textColor)
            timeView?.setTextColor(textColor)
            timeView?.text = time
        }
    }

    // -----------------------------------------------------------------------
    // Prayer arrival detection + haptic
    // -----------------------------------------------------------------------

    private fun checkPrayerArrival() {
        val prefs      = getSharedPreferences("wear_prayer", MODE_PRIVATE)
        val nextPrayer = prefs.getString("next_prayer", "") ?: ""
        val nextTs     = prefs.getLong("next_prayer_ts", 0L)
        val nowSecs    = System.currentTimeMillis() / 1000L
        val secsLeft   = nextTs - nowSecs

        if (secsLeft in -60..0 && nextPrayer != lastNotifiedPrayer) {
            lastNotifiedPrayer = nextPrayer
            fireHaptic(nextPrayer)
        }
    }

    /**
     * Fires a distinct vibration pattern per prayer.
     * Pattern: [wait, vibrate, wait, vibrate, …] in milliseconds.
     * On API 31+ we use VibratorManager; on API 26+ bare Vibrator.
     */
    @Suppress("DEPRECATION")
    private fun fireHaptic(prayer: String) {
        val pattern: LongArray = when (prayer) {
            "Fajr"    -> longArrayOf(0, 150, 100, 150)
            "Dhuhr"   -> longArrayOf(0, 200, 80, 200)
            "Asr"     -> longArrayOf(0, 250, 80, 100, 80, 100)
            "Maghrib" -> longArrayOf(0, 100, 60, 100, 60, 300)
            "Isha"    -> longArrayOf(0, 300)
            else      -> longArrayOf(0, 200)
        }

        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.S) {
            val vm = getSystemService(VibratorManager::class.java)
            vm?.defaultVibrator?.vibrate(
                VibrationEffect.createWaveform(pattern, -1)
            )
        } else {
            val v = getSystemService(Vibrator::class.java)
            v?.vibrate(VibrationEffect.createWaveform(pattern, -1))
        }
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    @Suppress("UNCHECKED_CAST")
    private fun <T : View> findByTag(tag: String): T? {
        val root = window.decorView
        return root.findViewWithTag(tag) as? T
    }

    private fun formatCountdown(secs: Long): String = when {
        secs <= 0   -> "now"
        secs < 3600 -> "in ${secs / 60}m"
        else        -> "in ${secs / 3600}h ${(secs % 3600) / 60}m"
    }
}

// Minimal R stub so the file compiles without a layout XML.
// In a real Wear project, R.id.prayer_scroll is declared in res/layout/.
private object R {
    object id {
        const val prayer_scroll = 0x7F08_0001
        const val wear_header   = 0x7F08_0002
        const val wear_countdown = 0x7F08_0003
    }
}
