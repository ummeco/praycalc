package com.praycalc.app

import android.content.Context
import android.content.Intent
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.*
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.action.clickable
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.provideContent
import androidx.glance.color.ColorProvider
import androidx.glance.layout.*
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.background

class PrayCalcLargeWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = PrayCalcLargeWidget()
}

class PrayCalcLargeWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val prefs = context.getSharedPreferences("FlutterSharedPreferences", Context.MODE_PRIVATE)

        // Five fard prayers in order
        val prayerNames = listOf("Fajr", "Dhuhr", "Asr", "Maghrib", "Isha")
        val prayers = prayerNames.map { name ->
            val key = name.lowercase()
            Triple(
                name,
                prefs.getString("flutter.widget_${key}_time", "--:--") ?: "--:--",
                prefs.getLong("flutter.widget_${key}_epoch", 0L),
            )
        }

        val activePrayer = prefs.getString("flutter.widget_next_prayer", "") ?: ""
        val locationName = prefs.getString("flutter.widget_location_name", "") ?: ""
        val countdown = prefs.getString("flutter.widget_countdown", "") ?: ""
        val nowMs = System.currentTimeMillis()

        val ctx = context
        provideContent {
            PrayCalcLargeContent(
                context = ctx,
                prayers = prayers,
                activePrayer = activePrayer,
                locationName = locationName,
                countdown = countdown,
                nowMs = nowMs,
            )
        }
    }
}

@Composable
fun PrayCalcLargeContent(
    context: Context,
    prayers: List<Triple<String, String, Long>>,
    activePrayer: String,
    locationName: String,
    countdown: String,
    nowMs: Long,
) {
    val white = ColorProvider(Color.White, Color.White)
    val green = ColorProvider(Color(0xFFC9F27A), Color(0xFFC9F27A))
    val dimmed = ColorProvider(Color(0x80FFFFFF), Color(0x80FFFFFF))

    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(Color(0xFF1E5E2F))
            .padding(horizontal = 12.dp, vertical = 10.dp)
            .clickable(actionStartActivity(Intent(context, MainActivity::class.java))),
    ) {
        // Header: mosque emoji + location name
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                text = "🕌",
                style = TextStyle(fontSize = 14.sp),
            )
            Spacer(modifier = GlanceModifier.width(6.dp))
            Text(
                text = if (locationName.isNotEmpty()) locationName else "PrayCalc",
                style = TextStyle(
                    color = white,
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                ),
                modifier = GlanceModifier.defaultWeight(),
            )
            if (countdown.isNotEmpty() && activePrayer.isNotEmpty()) {
                Text(
                    text = "$activePrayer · $countdown",
                    style = TextStyle(color = green, fontSize = 11.sp),
                )
            }
        }

        Spacer(modifier = GlanceModifier.height(8.dp))

        // Prayer rows: past prayers dimmed, next prayer highlighted green, future full white
        prayers.forEach { (name, time, _) ->
            val isNext = name == activePrayer
            // A prayer is past if all of these: it is not the next prayer AND
            // there is a next prayer in the list that comes after this one.
            val nextIdx = prayers.indexOfFirst { it.first == activePrayer }
            val thisIdx = prayers.indexOfFirst { it.first == name }
            val isPast = nextIdx >= 0 && thisIdx < nextIdx

            Row(
                modifier = GlanceModifier
                    .fillMaxWidth()
                    .padding(vertical = 3.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    text = name,
                    style = TextStyle(
                        color = when {
                            isNext -> green
                            isPast -> dimmed
                            else -> white
                        },
                        fontWeight = if (isNext) FontWeight.Bold else FontWeight.Medium,
                        fontSize = 13.sp,
                    ),
                    modifier = GlanceModifier.defaultWeight(),
                )
                Text(
                    text = time,
                    style = TextStyle(
                        color = when {
                            isNext -> green
                            isPast -> dimmed
                            else -> white
                        },
                        fontSize = 13.sp,
                    ),
                )
            }
        }
    }
}
