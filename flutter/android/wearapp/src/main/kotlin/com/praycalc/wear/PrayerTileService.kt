package com.praycalc.wear

// PrayerTileService.kt — v1.1 WearOS tile.
// Spec §9.1, S19-D T21
//
// Replaces PrayCountdownTile for v1.1.  Shows:
//   - Next prayer name + countdown (large accent text)
//   - All 5 daily prayers with time strings
//   - Location name if available
//
// Data source: SharedPreferences "wear_prayer" written by PrayerDataListenerService.
//
// Feature flag FF_WEAROS checked via SharedPreferences "wear_feature_flags" key
// "ff_wearos" (Boolean, default true per D-S19-01 resolution — Watch is free).
//
// Accessibility: all text elements wrapped via SpanBuilders so TalkBack can read them.
//
// Tile refresh: 60 s freshness interval; also triggered by PrayerDataListenerService
// via TileService.getUpdater(context).requestUpdate(PrayerTileService::class.java).

import android.content.Context
import androidx.wear.tiles.ColorBuilders.argb
import androidx.wear.tiles.DimensionBuilders.*
import androidx.wear.tiles.LayoutElementBuilders.*
import androidx.wear.tiles.ModifiersBuilders.*
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.ResourceBuilders
import androidx.wear.tiles.TileBuilders
import androidx.wear.tiles.TimelineBuilders.*
import com.google.android.gms.wearable.TileService
import com.google.common.util.concurrent.Futures
import java.util.concurrent.TimeUnit

class PrayerTileService : TileService() {

    // PrayCalc brand colours (ARGB)
    private val colorBg          = argb(0xFF1E5E2F.toInt())   // #1E5E2F dark green
    private val colorDeep        = argb(0xFF0D2F17.toInt())   // #0D2F17 prayer row bg
    private val colorAccent      = argb(0xFFC9F27A.toInt())   // #C9F27A accent
    private val colorMid         = argb(0xFF79C24C.toInt())   // #79C24C completed
    private val colorWhite       = argb(0xFFFFFFFF.toInt())
    private val colorSubtle      = argb(0xFFAACFAA.toInt())   // muted / location
    private val colorAmber       = argb(0xFFFFC107.toInt())   // imminent warning
    private val colorTransparent = argb(0x00000000)

    private val prayers = listOf("fajr", "dhuhr", "asr", "maghrib", "isha")
    private val prayerLabels = mapOf(
        "fajr" to "Fajr", "dhuhr" to "Dhuhr", "asr" to "Asr",
        "maghrib" to "Maghrib", "isha" to "Isha"
    )

    override fun onTileRequest(requestParams: RequestBuilders.TileRequest) =
        Futures.immediateFuture(buildTile())

    override fun onResourcesRequest(requestParams: ResourceBuilders.ResourcesRequest) =
        Futures.immediateFuture(ResourceBuilders.Resources.Builder().setVersion("1").build())

    // -----------------------------------------------------------------------
    // Tile construction
    // -----------------------------------------------------------------------

    private fun buildTile(): TileBuilders.Tile {
        val prefs = getSharedPreferences("wear_prayer", Context.MODE_PRIVATE)

        // FF_WEAROS gate
        val featurePrefs = getSharedPreferences("wear_feature_flags", Context.MODE_PRIVATE)
        val featureEnabled = featurePrefs.getBoolean("ff_wearos", true)

        val root: LayoutElement = if (!featureEnabled) buildLockedRoot() else buildPrayerRoot(prefs)

        return TileBuilders.Tile.Builder()
            .setResourcesVersion("1")
            .setFreshnessIntervalMillis(TimeUnit.SECONDS.toMillis(60))
            .setTimeline(
                Timeline.Builder()
                    .addTimelineEntry(
                        TimelineEntry.Builder()
                            .setLayout(Layout.Builder().setRoot(root).build())
                            .build()
                    ).build()
            ).build()
    }

    // -----------------------------------------------------------------------
    // Feature-locked view
    // -----------------------------------------------------------------------

    private fun buildLockedRoot(): LayoutElement {
        val bgMod = Modifiers.Builder()
            .setBackground(Background.Builder().setColor(colorBg).build()).build()
        return Box.Builder()
            .setWidth(expand()).setHeight(expand())
            .setHorizontalAlignment(HORIZONTAL_ALIGN_CENTER)
            .setVerticalAlignment(VERTICAL_ALIGN_CENTER)
            .setModifiers(bgMod)
            .addContent(
                Column.Builder()
                    .setHorizontalAlignment(HORIZONTAL_ALIGN_CENTER)
                    .addContent(accessibleText("PrayCalc", 16f, colorAccent, bold = true))
                    .addContent(spacer(4f))
                    .addContent(accessibleText("Feature unavailable", 12f, colorSubtle))
                    .build()
            ).build()
    }

    // -----------------------------------------------------------------------
    // Main prayer tile
    // -----------------------------------------------------------------------

    private fun buildPrayerRoot(prefs: android.content.SharedPreferences): LayoutElement {
        val nextPrayer  = prefs.getString("next_prayer", "Fajr") ?: "Fajr"
        val nextTs      = prefs.getLong("next_prayer_ts", 0L)
        val location    = prefs.getString("location", "") ?: ""
        val nowSecs     = System.currentTimeMillis() / 1000L
        val secsLeft    = (nextTs - nowSecs).coerceAtLeast(0)
        val countdown   = formatCountdown(secsLeft)
        val isImminent  = secsLeft in 1..900

        val bgMod = Modifiers.Builder()
            .setBackground(Background.Builder().setColor(colorBg).build()).build()

        val col = Column.Builder()
            .setHorizontalAlignment(HORIZONTAL_ALIGN_CENTER)
            .setWidth(expand())

        // Location (optional)
        if (location.isNotEmpty()) {
            col.addContent(accessibleText(location.uppercase(), 10f, colorSubtle))
            col.addContent(spacer(3f))
        }

        // Next prayer name
        col.addContent(accessibleText(nextPrayer, 18f, colorWhite, bold = true))
        col.addContent(spacer(2f))

        // Countdown — amber if imminent, accent otherwise
        val countdownColor = if (isImminent) colorAmber else colorAccent
        col.addContent(accessibleText(countdown, 22f, countdownColor))
        col.addContent(spacer(6f))

        // Divider
        col.addContent(divider())
        col.addContent(spacer(4f))

        // All 5 prayers
        prayers.forEach { key ->
            val label    = prayerLabels[key] ?: key.replaceFirstChar { it.uppercase() }
            val time     = prefs.getString(key, "--:--") ?: "--:--"
            val isNext   = label == nextPrayer
            val ts       = prefs.getLong("${key}_ts", 0L)
            val isDone   = ts in 1 until nowSecs && !isNext

            val textColor = when {
                isNext -> colorAccent
                isDone -> colorMid
                else   -> colorSubtle
            }
            col.addContent(buildPrayerRow(label, time, textColor, isNext, isDone))
            col.addContent(spacer(2f))
        }

        return Box.Builder()
            .setWidth(expand()).setHeight(expand())
            .setHorizontalAlignment(HORIZONTAL_ALIGN_CENTER)
            .setVerticalAlignment(VERTICAL_ALIGN_CENTER)
            .setModifiers(bgMod)
            .addContent(col.build())
            .build()
    }

    // -----------------------------------------------------------------------
    // Prayer row: "Asr  ·  3:47 PM"
    // -----------------------------------------------------------------------

    private fun buildPrayerRow(
        label: String,
        time: String,
        textColor: ColorBuilders.ColorProp,
        isNext: Boolean,
        isDone: Boolean
    ): LayoutElement {
        val descr = when {
            isNext -> "$label next at $time"
            isDone -> "$label completed"
            else   -> "$label at $time"
        }
        // Accessible: mark entire row with combined content description
        val rowMod = Modifiers.Builder()
            .setSemantics(
                ModifiersBuilders.Semantics.Builder()
                    .setContentDescription(descr)
                    .build()
            ).build()

        return Row.Builder()
            .setWidth(expand())
            .setHorizontalAlignment(HORIZONTAL_ALIGN_CENTER)
            .setVerticalAlignment(VERTICAL_ALIGN_CENTER)
            .setModifiers(rowMod)
            .addContent(
                Text.Builder()
                    .setText(label)
                    .setFontStyle(FontStyle.Builder()
                        .setSize(SpProp.Builder().setValue(12f).build())
                        .setColor(textColor)
                        .setBold(isNext)
                        .build())
                    .build()
            )
            .addContent(
                Text.Builder()
                    .setText("  ·  ")
                    .setFontStyle(FontStyle.Builder()
                        .setSize(SpProp.Builder().setValue(10f).build())
                        .setColor(colorSubtle)
                        .build())
                    .build()
            )
            .addContent(
                Text.Builder()
                    .setText(time)
                    .setFontStyle(FontStyle.Builder()
                        .setSize(SpProp.Builder().setValue(12f).build())
                        .setColor(textColor)
                        .build())
                    .build()
            )
            .build()
    }

    // -----------------------------------------------------------------------
    // Helpers
    // -----------------------------------------------------------------------

    /** Accessible text element with an auto-generated content description. */
    private fun accessibleText(
        text: String,
        sizeSp: Float,
        color: ColorBuilders.ColorProp,
        bold: Boolean = false
    ): LayoutElement {
        val mod = Modifiers.Builder()
            .setSemantics(
                ModifiersBuilders.Semantics.Builder()
                    .setContentDescription(text)
                    .build()
            ).build()
        return Text.Builder()
            .setText(text)
            .setModifiers(mod)
            .setFontStyle(
                FontStyle.Builder()
                    .setSize(SpProp.Builder().setValue(sizeSp).build())
                    .setColor(color)
                    .setBold(bold)
                    .build()
            ).build()
    }

    private fun spacer(dp: Float): LayoutElement =
        Spacer.Builder().setHeight(DpProp.Builder().setValue(dp).build()).build()

    private fun divider(): LayoutElement =
        Spacer.Builder()
            .setWidth(expand())
            .setHeight(DpProp.Builder().setValue(1f).build())
            .setModifiers(
                Modifiers.Builder()
                    .setBackground(Background.Builder().setColor(colorSubtle).build())
                    .build()
            ).build()

    /** Format seconds into "Xh Ym", "Ym", "now". */
    private fun formatCountdown(secs: Long): String = when {
        secs <= 0    -> "now"
        secs < 3600  -> "in ${secs / 60}m"
        else         -> "in ${secs / 3600}h ${(secs % 3600) / 60}m"
    }

    // -----------------------------------------------------------------------
    // Static helpers
    // -----------------------------------------------------------------------

    companion object {
        /**
         * Call from PrayerDataListenerService after writing new data to trigger
         * a tile refresh without waiting for the 60 s freshness window.
         */
        fun requestUpdate(context: Context) {
            TileService.getUpdater(context)
                .requestUpdate(PrayerTileService::class.java)
        }
    }
}
