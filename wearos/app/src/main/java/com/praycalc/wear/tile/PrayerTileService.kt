package com.praycalc.wear.tile

import android.content.Context
import androidx.wear.protolayout.ActionBuilders
import androidx.wear.protolayout.ColorBuilders.argb
import androidx.wear.protolayout.DimensionBuilders.dp
import androidx.wear.protolayout.DimensionBuilders.expand
import androidx.wear.protolayout.LayoutElementBuilders
import androidx.wear.protolayout.LayoutElementBuilders.Column
import androidx.wear.protolayout.LayoutElementBuilders.Spacer
import androidx.wear.protolayout.LayoutElementBuilders.Text
import androidx.wear.protolayout.ModifiersBuilders
import androidx.wear.protolayout.ResourceBuilders
import androidx.wear.protolayout.TimelineBuilders
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.TileBuilders
import com.google.android.horologist.annotations.ExperimentalHorologistApi
import com.google.android.horologist.tiles.SuspendingTileService
import com.praycalc.wear.data.PrayerRepository
import java.time.Duration
import java.time.LocalTime

private const val RESOURCES_VERSION = "1"

@OptIn(ExperimentalHorologistApi::class)
class PrayerTileService : SuspendingTileService() {

    private lateinit var repository: PrayerRepository

    override fun onCreate() {
        super.onCreate()
        repository = PrayerRepository(applicationContext)
    }

    override suspend fun resourcesRequest(
        requestParams: RequestBuilders.ResourcesRequest
    ): ResourceBuilders.Resources {
        return ResourceBuilders.Resources.Builder()
            .setVersion(RESOURCES_VERSION)
            .build()
    }

    override suspend fun tileRequest(
        requestParams: RequestBuilders.TileRequest
    ): TileBuilders.Tile {
        repository.refresh()
        val data = repository.prayerData.value
        val nextPrayer = data.nextPrayer

        val prayerName = nextPrayer?.name ?: "No data"
        val prayerTime = nextPrayer?.displayTime ?: "--:--"
        val countdown = if (nextPrayer != null) {
            val now = LocalTime.now()
            val remaining = Duration.between(now, nextPrayer.time).let {
                if (it.isNegative) it.plusHours(24) else it
            }
            val hours = remaining.seconds / 3600
            val minutes = (remaining.seconds % 3600) / 60
            if (hours > 0) "in ${hours}h ${minutes}m" else "in ${minutes}m"
        } else ""

        val layout = tileLayout(prayerName, prayerTime, countdown, applicationContext)

        val entry = TimelineBuilders.TimelineEntry.Builder()
            .setLayout(
                LayoutElementBuilders.Layout.Builder()
                    .setRoot(layout)
                    .build()
            )
            .build()

        val timeline = TimelineBuilders.Timeline.Builder()
            .addTimelineEntry(entry)
            .build()

        return TileBuilders.Tile.Builder()
            .setResourcesVersion(RESOURCES_VERSION)
            .setTileTimeline(timeline)
            .setFreshnessIntervalMillis(60_000L)
            .build()
    }

    private fun tileLayout(
        name: String,
        time: String,
        countdown: String,
        context: Context
    ): LayoutElementBuilders.LayoutElement {
        val greenColor = argb(0xFF79C24C.toInt())
        val accentColor = argb(0xFFC9F27A.toInt())
        val dimColor = argb(0xFFAAAAAA.toInt())

        val clickable = ModifiersBuilders.Clickable.Builder()
            .setId("open_app")
            .setOnClick(
                ActionBuilders.LaunchAction.Builder()
                    .setAndroidActivity(
                        ActionBuilders.AndroidActivity.Builder()
                            .setPackageName(context.packageName)
                            .setClassName("com.praycalc.wear.MainActivity")
                            .build()
                    )
                    .build()
            )
            .build()

        return Column.Builder()
            .setWidth(expand())
            .setModifiers(
                ModifiersBuilders.Modifiers.Builder()
                    .setClickable(clickable)
                    .build()
            )
            .setHorizontalAlignment(LayoutElementBuilders.HORIZONTAL_ALIGN_CENTER)
            .addContent(
                Text.Builder()
                    .setText(name)
                    .setFontStyle(
                        LayoutElementBuilders.FontStyle.Builder()
                            .setSize(dp(18f))
                            .setColor(accentColor)
                            .setWeight(LayoutElementBuilders.FONT_WEIGHT_BOLD)
                            .build()
                    )
                    .build()
            )
            .addContent(
                Spacer.Builder().setHeight(dp(4f)).build()
            )
            .addContent(
                Text.Builder()
                    .setText(time)
                    .setFontStyle(
                        LayoutElementBuilders.FontStyle.Builder()
                            .setSize(dp(24f))
                            .setColor(greenColor)
                            .setWeight(LayoutElementBuilders.FONT_WEIGHT_BOLD)
                            .build()
                    )
                    .build()
            )
            .addContent(
                Spacer.Builder().setHeight(dp(2f)).build()
            )
            .addContent(
                Text.Builder()
                    .setText(countdown)
                    .setFontStyle(
                        LayoutElementBuilders.FontStyle.Builder()
                            .setSize(dp(12f))
                            .setColor(dimColor)
                            .build()
                    )
                    .build()
            )
            .build()
    }
}
