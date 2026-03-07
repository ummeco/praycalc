package com.praycalc.app

import android.content.Context
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.*
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.GlanceAppWidgetReceiver
import androidx.glance.appwidget.provideContent
import androidx.glance.layout.*
import androidx.glance.text.*
import androidx.glance.background

class PrayCalcMediumWidgetReceiver : GlanceAppWidgetReceiver() {
    override val glanceAppWidget: GlanceAppWidget = PrayCalcMediumWidget()
}

class PrayCalcMediumWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val prefs = context.getSharedPreferences("FlutterSharedPreferences", Context.MODE_PRIVATE)
        val prayers = listOf(
            prefs.getString("flutter.widget_fajr", "Fajr") to prefs.getString("flutter.widget_fajr_time", "--:--"),
            prefs.getString("flutter.widget_dhuhr", "Dhuhr") to prefs.getString("flutter.widget_dhuhr_time", "--:--"),
            prefs.getString("flutter.widget_asr", "Asr") to prefs.getString("flutter.widget_asr_time", "--:--"),
            prefs.getString("flutter.widget_maghrib", "Maghrib") to prefs.getString("flutter.widget_maghrib_time", "--:--"),
            prefs.getString("flutter.widget_isha", "Isha") to prefs.getString("flutter.widget_isha_time", "--:--"),
        )
        val activePrayer = prefs.getString("flutter.widget_next_prayer", "") ?: ""
        provideContent { PrayCalcMediumContent(prayers = prayers, activePrayer = activePrayer) }
    }
}

@Composable
fun PrayCalcMediumContent(prayers: List<Pair<String?, String?>>, activePrayer: String) {
    Column(
        modifier = GlanceModifier.fillMaxSize().background(Color(0xFF1E5E2F)).padding(8.dp),
    ) {
        Text("🕌 PrayCalc", style = TextStyle(color = ColorProvider(Color.White), fontWeight = FontWeight.Bold, fontSize = 13.sp))
        Spacer(GlanceModifier.height(4.dp))
        prayers.forEach { (name, time) ->
            val isActive = name == activePrayer
            Row(
                modifier = GlanceModifier.fillMaxWidth().padding(vertical = 2.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    name ?: "",
                    style = TextStyle(
                        color = ColorProvider(if (isActive) Color(0xFFC9F27A) else Color.White),
                        fontWeight = if (isActive) FontWeight.Bold else FontWeight.Medium,
                        fontSize = 11.sp,
                    ),
                    modifier = GlanceModifier.defaultWeight(),
                )
                Text(
                    time ?: "--:--",
                    style = TextStyle(color = ColorProvider(Color.White), fontSize = 11.sp),
                )
            }
        }
    }
}
