package com.praycalc.app

import android.content.Context
import android.content.Intent
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.*
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.action.clickable
import androidx.glance.appwidget.action.actionStartActivity
import androidx.glance.appwidget.provideContent
import androidx.glance.layout.*
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import androidx.glance.background

class PrayCalcWidget : GlanceAppWidget() {
    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val prefs = context.getSharedPreferences("FlutterSharedPreferences", Context.MODE_PRIVATE)
        val nextPrayer = prefs.getString("flutter.widget_next_prayer", "Prayer") ?: "Prayer"
        val countdown = prefs.getString("flutter.widget_countdown", "--:--") ?: "--:--"
        val time = prefs.getString("flutter.widget_next_prayer_time", "") ?: ""

        val ctx = context
        provideContent {
            PrayCalcWidgetContent(context = ctx, nextPrayer = nextPrayer, countdown = countdown, time = time)
        }
    }
}

@Composable
fun PrayCalcWidgetContent(context: Context, nextPrayer: String, countdown: String, time: String) {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(Color(0xFF1E5E2F))
            .padding(12.dp)
            .clickable(actionStartActivity(Intent(context, MainActivity::class.java))),
        verticalAlignment = Alignment.CenterVertically,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        Text(
            text = "🕌",
            style = TextStyle(fontSize = 18.sp),
        )
        Spacer(modifier = GlanceModifier.height(4.dp))
        Text(
            text = nextPrayer,
            style = TextStyle(color = GlanceTheme.colors.onSurface, fontWeight = FontWeight.Bold, fontSize = 14.sp),
        )
        Text(
            text = "in $countdown",
            style = TextStyle(color = GlanceTheme.colors.onSurface, fontSize = 12.sp),
        )
        if (time.isNotEmpty()) {
            Text(
                text = time,
                style = TextStyle(color = GlanceTheme.colors.onSurface, fontSize = 10.sp),
            )
        }
    }
}
