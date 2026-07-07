package com.ummeco.praycalc.tv.system

import android.content.Context
import android.graphics.Color
import android.graphics.Typeface
import android.graphics.drawable.GradientDrawable
import android.os.Handler
import android.os.Looper
import android.service.dreams.DreamService
import android.util.TypedValue
import android.view.Gravity
import android.view.ViewGroup
import android.widget.LinearLayout
import android.widget.TextView
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

/**
 * Purpose: "PrayCalc Ambient" system screensaver (DreamService) — a full-native, low-power
 *   Islamic ambient display: brand vertical gradient (#0D2F17 -> #1E5E2F), a large clock that
 *   refreshes each minute, and two text lines fed from SharedPreferences by the RN app
 *   (line1 = e.g. "Maghrib in 43 min - 8:32 PM"; line2 = a rotating cited text).
 * Inputs: SharedPreferences "praycalc_ambient" (keys line1 / line2), system clock.
 * Outputs: an on-screen dream view; no network, no RN, no image assets.
 * Constraints: Pure Android views (no React) so the dream is cheap and reliable. Text lines
 *   are supplied by RN via TvSystemModule.setAmbientLines and are NOT authored here (Islamic
 *   content gate — content originates from tv/src/lib/content/rotationContent.ts). The user
 *   selects this dream in the system screensaver picker; apps cannot self-set the dream.
 * SPORT: praycalc/tv android/system
 */
class AmbientDreamService : DreamService() {

  private val handler = Handler(Looper.getMainLooper())
  private var clockView: TextView? = null
  private var line1View: TextView? = null
  private var line2View: TextView? = null

  private val clockFormat = SimpleDateFormat("h:mm a", Locale.getDefault())

  private val tick =
      object : Runnable {
        override fun run() {
          refresh()
          // Re-run at the next minute boundary for minute-granularity updates.
          val delay = 60_000L - (System.currentTimeMillis() % 60_000L)
          handler.postDelayed(this, delay)
        }
      }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    isInteractive = false
    isFullscreen = true
    isScreenBright = false
    setContentView(buildView())
  }

  override fun onDreamingStarted() {
    super.onDreamingStarted()
    handler.post(tick)
  }

  override fun onDreamingStopped() {
    super.onDreamingStopped()
    handler.removeCallbacks(tick)
  }

  override fun onDetachedFromWindow() {
    handler.removeCallbacks(tick)
    super.onDetachedFromWindow()
  }

  private fun dp(value: Int): Int =
      TypedValue.applyDimension(
              TypedValue.COMPLEX_UNIT_DIP,
              value.toFloat(),
              resources.displayMetrics)
          .toInt()

  private fun sp(value: Float): Float =
      TypedValue.applyDimension(
          TypedValue.COMPLEX_UNIT_SP, value, resources.displayMetrics)

  private fun buildView(): ViewGroup {
    val root =
        LinearLayout(this).apply {
          orientation = LinearLayout.VERTICAL
          gravity = Gravity.CENTER
          setPadding(dp(64), dp(64), dp(64), dp(64))
          // Brand vertical gradient: deep green -> mid green.
          background =
              GradientDrawable(
                  GradientDrawable.Orientation.TOP_BOTTOM,
                  intArrayOf(BRAND_DEEP, BRAND_MID))
        }

    clockView =
        TextView(this).apply {
          setTextColor(BRAND_LIGHT)
          setTextSize(TypedValue.COMPLEX_UNIT_PX, sp(120f))
          typeface = Typeface.create(Typeface.SANS_SERIF, Typeface.NORMAL)
          gravity = Gravity.CENTER
        }
    line1View =
        TextView(this).apply {
          setTextColor(BRAND_LIGHT)
          setTextSize(TypedValue.COMPLEX_UNIT_PX, sp(40f))
          gravity = Gravity.CENTER
          setPadding(0, dp(24), 0, 0)
        }
    line2View =
        TextView(this).apply {
          setTextColor(BRAND_ACCENT)
          setTextSize(TypedValue.COMPLEX_UNIT_PX, sp(30f))
          gravity = Gravity.CENTER
          setPadding(0, dp(16), 0, 0)
        }

    root.addView(clockView)
    root.addView(line1View)
    root.addView(line2View)
    return root
  }

  private fun refresh() {
    clockView?.text = clockFormat.format(Date())
    val prefs =
        getSharedPreferences(TvSystemModule.AMBIENT_PREFS, Context.MODE_PRIVATE)
    val l1 = prefs.getString(TvSystemModule.AMBIENT_LINE1, "") ?: ""
    val l2 = prefs.getString(TvSystemModule.AMBIENT_LINE2, "") ?: ""
    line1View?.text = l1
    line2View?.text = l2
    line1View?.visibility = if (l1.isEmpty()) TextView.GONE else TextView.VISIBLE
    line2View?.visibility = if (l2.isEmpty()) TextView.GONE else TextView.VISIBLE
  }

  companion object {
    // PrayCalc brand palette (from PPI): deep/mid green + light/accent greens.
    private val BRAND_DEEP = Color.parseColor("#0D2F17")
    private val BRAND_MID = Color.parseColor("#1E5E2F")
    private val BRAND_LIGHT = Color.parseColor("#C9F27A")
    private val BRAND_ACCENT = Color.parseColor("#79C24C")
  }
}
