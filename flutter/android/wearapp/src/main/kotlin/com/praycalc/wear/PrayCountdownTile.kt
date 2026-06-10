package com.praycalc.wear

import androidx.wear.tiles.*
import androidx.wear.tiles.ColorBuilders.argb
import androidx.wear.tiles.DimensionBuilders.*
import androidx.wear.tiles.LayoutElementBuilders.*
import androidx.wear.tiles.ModifiersBuilders.*
import androidx.wear.tiles.ResourceBuilders.*
import androidx.wear.tiles.TimelineBuilders.*
import com.google.android.gms.wearable.TileService
import java.util.concurrent.TimeUnit

// PrayCountdownTile — Wear OS tile showing next prayer name + live countdown.
//
// Layout (dark green background #1E5E2F):
//   LOCATION  (small, white, optional)
//   NEXT PRAYER NAME  (medium, white, bold)
//   in Xh Ym  (large, #C9F27A — PrayCalc light green)
//
// Tile refreshes every 60 seconds so the countdown stays accurate.
// Prayer data is provided by PrayerDataListenerService via SharedPreferences
// ("wear_prayer"). next_prayer_time is always stored in 24h HH:mm format.
class PrayCountdownTile : TileService() {

    // PrayCalc brand colours
    private val colorBg      = argb(0xFF1E5E2F.toInt())   // #1E5E2F dark green
    private val colorWhite   = argb(0xFFFFFFFF.toInt())   // prayer name + location
    private val colorAccent  = argb(0xFFC9F27A.toInt())   // #C9F27A countdown text
    private val colorSubtle  = argb(0xFFAACFAA.toInt())   // location (slightly muted)

    override fun onTileRequest(requestParams: RequestBuilders.TileRequest) =
        com.google.common.util.concurrent.Futures.immediateFuture(buildTile())

    override fun onResourcesRequest(requestParams: ResourceBuilders.ResourcesRequest) =
        com.google.common.util.concurrent.Futures.immediateFuture(
            Resources.Builder().setVersion("1").build()
        )

    private fun buildTile(): TileBuilders.Tile {
        val freshnessDurationMs = TimeUnit.SECONDS.toMillis(60)
        return TileBuilders.Tile.Builder()
            .setResourcesVersion("1")
            .setFreshnessIntervalMillis(freshnessDurationMs)
            .setTimeline(
                Timeline.Builder()
                    .addTimelineEntry(
                        TimelineEntry.Builder()
                            .setLayout(
                                LayoutElementBuilders.Layout.Builder()
                                    .setRoot(buildRoot())
                                    .build()
                            ).build()
                    ).build()
            ).build()
    }

    private fun buildRoot(): LayoutElement {
        val prefs        = getSharedPreferences("wear_prayer", MODE_PRIVATE)
        val nextPrayer   = prefs.getString("next_prayer", "Fajr") ?: "Fajr"
        val nextTimeStr  = prefs.getString("next_prayer_time", "--:--") ?: "--:--"
        val location     = prefs.getString("location", "") ?: ""
        val countdown    = computeCountdown(nextTimeStr)

        // Full-screen dark green box
        val bgModifier = Modifiers.Builder()
            .setBackground(
                Background.Builder()
                    .setColor(colorBg)
                    .build()
            ).build()

        val column = Column.Builder()
            .setHorizontalAlignment(HORIZONTAL_ALIGN_CENTER)

        // Location line (only when non-empty)
        if (location.isNotEmpty()) {
            column.addContent(
                Text.Builder()
                    .setText(location.uppercase())
                    .setFontStyle(
                        FontStyle.Builder()
                            .setSize(SpProp.Builder().setValue(11f).build())
                            .setColor(colorSubtle)
                            .build()
                    ).build()
            )
            column.addContent(spacer(4f))
        }

        // Next prayer name — white, bold
        column.addContent(
            Text.Builder()
                .setText(nextPrayer)
                .setFontStyle(
                    FontStyle.Builder()
                        .setSize(SpProp.Builder().setValue(20f).build())
                        .setColor(colorWhite)
                        .setBold(true)
                        .build()
                ).build()
        )

        column.addContent(spacer(6f))

        // Countdown — accent green, larger
        column.addContent(
            Text.Builder()
                .setText(countdown)
                .setFontStyle(
                    FontStyle.Builder()
                        .setSize(SpProp.Builder().setValue(26f).build())
                        .setColor(colorAccent)
                        .build()
                ).build()
        )

        return Box.Builder()
            .setWidth(expand())
            .setHeight(expand())
            .setHorizontalAlignment(HORIZONTAL_ALIGN_CENTER)
            .setVerticalAlignment(VERTICAL_ALIGN_CENTER)
            .setModifiers(bgModifier)
            .addContent(column.build())
            .build()
    }

    // Returns "in Xh Ym", "in Ym", or "--" from a 24h "HH:mm" string.
    private fun computeCountdown(timeStr: String): String {
        return try {
            val parts = timeStr.split(":")
            if (parts.size != 2) return "--"
            val targetH = parts[0].toInt()
            val targetM = parts[1].toInt()

            val now = java.util.Calendar.getInstance()
            val nowMinutes = now.get(java.util.Calendar.HOUR_OF_DAY) * 60 +
                             now.get(java.util.Calendar.MINUTE)
            val targetMinutes = targetH * 60 + targetM

            var diffMinutes = targetMinutes - nowMinutes
            if (diffMinutes < 0) diffMinutes += 24 * 60   // next-day wrap

            val h = diffMinutes / 60
            val m = diffMinutes % 60

            when {
                h > 0 && m > 0 -> "in ${h}h ${m}m"
                h > 0           -> "in ${h}h"
                m > 0           -> "in ${m}m"
                else            -> "now"
            }
        } catch (_: Exception) {
            "--"
        }
    }

    private fun spacer(dp: Float): LayoutElement =
        Spacer.Builder()
            .setHeight(DpProp.Builder().setValue(dp).build())
            .build()
}
