package com.praycalc.wear

import androidx.wear.tiles.*
import com.google.android.gms.wearable.TileService

// PrayCountdownTile — Wear OS tile showing next prayer countdown.
// Receives prayer time data via Wearable DataClient from the main app
// (written by PrayerDataListenerService into shared_prefs "wear_prayer").
class PrayCountdownTile : TileService() {

    override fun onTileRequest(requestParams: RequestBuilders.TileRequest) =
        com.google.common.util.concurrent.Futures.immediateFuture(
            TileBuilders.Tile.Builder()
                .setResourcesVersion("1")
                .setTimeline(
                    TimelineBuilders.Timeline.Builder()
                        .addTimelineEntry(
                            TimelineBuilders.TimelineEntry.Builder()
                                .setLayout(buildLayout())
                                .build()
                        ).build()
                ).build()
        )

    override fun onResourcesRequest(requestParams: RequestBuilders.ResourcesRequest) =
        com.google.common.util.concurrent.Futures.immediateFuture(
            ResourceBuilders.Resources.Builder()
                .setVersion("1")
                .build()
        )

    private fun buildLayout(): LayoutElementBuilders.LayoutElement {
        val prefs = getSharedPreferences("wear_prayer", MODE_PRIVATE)
        val nextPrayer = prefs.getString("next_prayer", "Fajr") ?: "Fajr"
        val timeStr = prefs.getString("next_prayer_time", "--:--") ?: "--:--"

        return LayoutElementBuilders.Box.Builder()
            .setWidth(DimensionBuilders.expand())
            .setHeight(DimensionBuilders.expand())
            .addContent(
                LayoutElementBuilders.Column.Builder()
                    .addContent(
                        LayoutElementBuilders.Text.Builder()
                            .setText(nextPrayer)
                            .setFontStyle(
                                LayoutElementBuilders.FontStyle.Builder()
                                    .setSize(DimensionBuilders.SpProp.Builder().setValue(18f).build())
                                    .build()
                            ).build()
                    )
                    .addContent(
                        LayoutElementBuilders.Text.Builder()
                            .setText(timeStr)
                            .setFontStyle(
                                LayoutElementBuilders.FontStyle.Builder()
                                    .setSize(DimensionBuilders.SpProp.Builder().setValue(28f).build())
                                    .build()
                            ).build()
                    ).build()
            ).build()
    }
}
