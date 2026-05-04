package com.praycalc.app

// PrayerGlanceWidget.kt — v1.1 Android home widget using Jetpack Glance API.
// Spec §4.2, S19-D T19
//
// SizeMode.Responsive: compact layout at < 200dp width; large layout at >= 200dp.
// Reads prayer data from SharedPreferences ("FlutterSharedPreferences").
// Keys match those written by Flutter home_widget package (prefix "flutter.").
// All 7 UI states rendered per spec §4.2.

import android.content.Context
import android.content.Intent
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.DpSize
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.glance.*
import androidx.glance.action.actionStartActivity
import androidx.glance.action.clickable
import androidx.glance.appwidget.GlanceAppWidget
import androidx.glance.appwidget.SizeMode
import androidx.glance.appwidget.provideContent
import androidx.glance.background
import androidx.glance.layout.*
import androidx.glance.text.FontWeight
import androidx.glance.text.Text
import androidx.glance.text.TextStyle
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlin.math.max

// ── Colors ────────────────────────────────────────────────────────────────────

private val pcGreen      = Color(0xFFC9F27A)
private val pcGreenMid   = Color(0xFF79C24C)
private val pcGreenDark  = Color(0xFF1E5E2F)
private val pcAmber      = Color(0xFFFFB300)
private val pcBackground = Color(0xFF121B15)

// ── Widget state ──────────────────────────────────────────────────────────────

enum class WidgetState {
    LOADING, LOCATION_PENDING, NOMINAL, IMMINENT, AT_ADHAN, STALE, ERROR
}

// ── Data model ────────────────────────────────────────────────────────────────

@Serializable
data class PrayerItem(
    val name: String,
    val time: String,
    val timestamp: Double = 0.0,
    val isNext: Boolean = false,
)

data class WidgetData(
    val nextPrayer: String,
    val nextPrayerTime: String,
    val nextPrayerTs: Double,
    val prayers: List<PrayerItem>,
    val locationName: String,
    val hijriDate: String,
    val state: WidgetState,
) {
    val secondsToNext: Long get() = (nextPrayerTs - System.currentTimeMillis() / 1000.0).toLong()

    val countdownText: String get() = when {
        state == WidgetState.AT_ADHAN -> "Now!"
        secondsToNext <= 0 -> "Now!"
        secondsToNext < 3600 -> "${secondsToNext / 60}m"
        else -> "${secondsToNext / 3600}h ${(secondsToNext % 3600) / 60}m"
    }
}

// ── Data reader ───────────────────────────────────────────────────────────────

private fun readWidgetData(context: Context): WidgetData {
    val prefs = context.getSharedPreferences("FlutterSharedPreferences", Context.MODE_PRIVATE)
    val nextPrayer   = prefs.getString("flutter.widget_next_prayer",      "") ?: ""
    val nextTime     = prefs.getString("flutter.widget_next_prayer_time", "--:--") ?: "--:--"
    val nextTs       = prefs.getFloat("flutter.widget_next_prayer_ts",    0f).toDouble()
    val locationName = prefs.getString("flutter.widget_location_name",    "") ?: ""
    val hijriDate    = prefs.getString("flutter.widget_hijri_date",       "") ?: ""
    val locationPending = prefs.getBoolean("flutter.widget_location_pending", false)
    val isStale      = prefs.getBoolean("flutter.widget_stale",           false)
    val updatedAt    = prefs.getFloat("flutter.widget_updated_at",        0f).toDouble()

    // Effective stale: flag OR > 24h since last Flutter write
    val nowSecs = System.currentTimeMillis() / 1000.0
    val effectivelyStale = isStale || (updatedAt > 0 && nowSecs - updatedAt > 86400)

    // Parse prayers JSON
    val prayers: List<PrayerItem> = try {
        val json = prefs.getString("flutter.widget_prayers", null) ?: ""
        if (json.isNotBlank()) Json.decodeFromString(json) else emptyList()
    } catch (_: Exception) { emptyList() }

    // Derive state
    val secs = (nextTs - nowSecs).toLong()
    val state = when {
        locationPending -> WidgetState.LOCATION_PENDING
        effectivelyStale -> WidgetState.STALE
        nextPrayer.isEmpty() -> if (updatedAt == 0.0) WidgetState.LOADING else WidgetState.ERROR
        secs < -300 -> WidgetState.NOMINAL      // > 5 min past — next prayer
        secs <= 0 -> WidgetState.AT_ADHAN
        secs <= 900 -> WidgetState.IMMINENT
        else -> WidgetState.NOMINAL
    }

    return WidgetData(
        nextPrayer   = nextPrayer,
        nextPrayerTime = nextTime,
        nextPrayerTs = nextTs,
        prayers      = prayers,
        locationName = locationName,
        hijriDate    = hijriDate,
        state        = state,
    )
}

// ── PrayerGlanceWidget ────────────────────────────────────────────────────────

class PrayerGlanceWidget : GlanceAppWidget() {

    override val sizeMode = SizeMode.Responsive(
        setOf(
            DpSize(180.dp, 110.dp),   // compact
            DpSize(280.dp, 110.dp),   // medium
            DpSize(280.dp, 220.dp),   // large
        )
    )

    override suspend fun provideGlance(context: Context, id: GlanceId) {
        val data = readWidgetData(context)
        provideContent {
            val size = LocalSize.current
            if (size.width < 200.dp) {
                CompactWidget(context = context, data = data)
            } else if (size.height < 180.dp) {
                MediumWidget(context = context, data = data)
            } else {
                LargeWidget(context = context, data = data)
            }
        }
    }
}

// ── Compact Widget (180×110dp) ────────────────────────────────────────────────
// Shows: next prayer name + time + countdown

@Composable
private fun CompactWidget(context: Context, data: WidgetData) {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(if (data.state == WidgetState.AT_ADHAN) pcGreenDark else pcBackground)
            .padding(10.dp)
            .clickable(actionStartActivity(Intent(context, MainActivity::class.java))),
        verticalAlignment = Alignment.CenterVertically,
        horizontalAlignment = Alignment.CenterHorizontally,
    ) {
        when (data.state) {
            WidgetState.LOADING -> {
                Text(
                    "Loading…",
                    style = TextStyle(color = ColorProvider(Color.Gray), fontSize = 12.sp)
                )
            }
            WidgetState.LOCATION_PENDING -> {
                Text(
                    "Getting location…",
                    style = TextStyle(color = ColorProvider(Color.Gray), fontSize = 11.sp)
                )
            }
            WidgetState.ERROR -> {
                Text(
                    "Tap to open",
                    style = TextStyle(color = ColorProvider(Color.Red.copy(alpha = 0.7f)), fontSize = 11.sp)
                )
            }
            WidgetState.STALE -> {
                Text(
                    "⚠ Outdated",
                    style = TextStyle(color = ColorProvider(pcAmber), fontSize = 10.sp, fontWeight = FontWeight.Bold)
                )
                Spacer(GlanceModifier.height(4.dp))
                Text(
                    data.nextPrayer,
                    style = TextStyle(color = ColorProvider(pcGreen.copy(alpha = 0.6f)), fontSize = 14.sp, fontWeight = FontWeight.Bold)
                )
                Text(
                    data.nextPrayerTime,
                    style = TextStyle(color = ColorProvider(Color.White.copy(alpha = 0.5f)), fontSize = 12.sp)
                )
            }
            else -> {
                Text(
                    data.nextPrayer,
                    style = TextStyle(
                        color = ColorProvider(if (data.state == WidgetState.IMMINENT) pcAmber else pcGreen),
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                    )
                )
                Spacer(GlanceModifier.height(2.dp))
                Text(
                    data.nextPrayerTime,
                    style = TextStyle(color = ColorProvider(Color.White), fontSize = 14.sp)
                )
                Spacer(GlanceModifier.height(2.dp))
                Text(
                    data.countdownText,
                    style = TextStyle(color = ColorProvider(Color.White.copy(alpha = 0.6f)), fontSize = 11.sp)
                )
            }
        }
    }
}

// ── Medium Widget (280×110dp) ──────────────────────────────────────────────────
// Shows: location name, next prayer, and a 5-column prayer layout

@Composable
private fun MediumWidget(context: Context, data: WidgetData) {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(pcBackground)
            .padding(10.dp)
            .clickable(actionStartActivity(Intent(context, MainActivity::class.java))),
    ) {
        // Header
        Row(modifier = GlanceModifier.fillMaxWidth()) {
            Text(
                data.locationName.ifEmpty { "PrayCalc" }.take(20),
                style = TextStyle(color = ColorProvider(Color.Gray), fontSize = 9.sp),
                maxLines = 1,
            )
            Spacer(GlanceModifier.defaultWeight())
            if (data.state == WidgetState.STALE) {
                Text("⚠", style = TextStyle(color = ColorProvider(pcAmber), fontSize = 9.sp))
            }
        }
        Spacer(GlanceModifier.height(4.dp))

        // 5-prayer columns
        if (data.prayers.isNotEmpty()) {
            Row(modifier = GlanceModifier.fillMaxWidth()) {
                data.prayers.forEach { prayer ->
                    val isNext = prayer.name == data.nextPrayer
                    Column(
                        modifier = GlanceModifier
                            .defaultWeight()
                            .background(if (isNext) pcGreenMid.copy(alpha = 0.15f) else Color.Transparent)
                            .padding(3.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                    ) {
                        Text(
                            shortName(prayer.name),
                            style = TextStyle(
                                color = ColorProvider(if (isNext) pcGreen else Color.Gray),
                                fontSize = 9.sp,
                                fontWeight = if (isNext) FontWeight.Bold else FontWeight.Normal,
                            )
                        )
                        Text(
                            prayer.time,
                            style = TextStyle(
                                color = ColorProvider(if (isNext) pcGreen else Color.White),
                                fontSize = 10.sp,
                                fontWeight = if (isNext) FontWeight.Bold else FontWeight.Normal,
                            ),
                            maxLines = 1,
                        )
                    }
                }
            }
        } else {
            CompactPrayerRow(data)
        }
    }
}

// ── Large Widget (280×220dp) ──────────────────────────────────────────────────
// Shows: location + Hijri date, next prayer with countdown, full prayer list

@Composable
private fun LargeWidget(context: Context, data: WidgetData) {
    Column(
        modifier = GlanceModifier
            .fillMaxSize()
            .background(pcBackground)
            .padding(12.dp)
            .clickable(actionStartActivity(Intent(context, MainActivity::class.java))),
    ) {
        // Header
        Row(modifier = GlanceModifier.fillMaxWidth()) {
            Text(
                data.locationName.ifEmpty { "PrayCalc" }.take(18),
                style = TextStyle(color = ColorProvider(pcGreenMid), fontSize = 11.sp, fontWeight = FontWeight.Bold),
                maxLines = 1,
            )
            Spacer(GlanceModifier.defaultWeight())
            if (data.hijriDate.isNotEmpty()) {
                Text(
                    data.hijriDate.take(16),
                    style = TextStyle(color = ColorProvider(Color.Gray), fontSize = 9.sp),
                )
            }
            if (data.state == WidgetState.STALE) {
                Spacer(GlanceModifier.width(4.dp))
                Text("⚠", style = TextStyle(color = ColorProvider(pcAmber), fontSize = 9.sp))
            }
        }

        Spacer(GlanceModifier.height(6.dp))

        // Next prayer highlight
        Row(
            modifier = GlanceModifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                data.nextPrayer,
                style = TextStyle(
                    color = ColorProvider(if (data.state == WidgetState.IMMINENT) pcAmber else pcGreen),
                    fontSize = 18.sp,
                    fontWeight = FontWeight.Bold,
                )
            )
            Spacer(GlanceModifier.width(8.dp))
            Text(
                data.nextPrayerTime,
                style = TextStyle(color = ColorProvider(Color.White), fontSize = 14.sp)
            )
            Spacer(GlanceModifier.defaultWeight())
            Text(
                data.countdownText,
                style = TextStyle(
                    color = ColorProvider(if (data.state == WidgetState.IMMINENT) pcAmber else pcGreenMid),
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold,
                )
            )
        }

        Spacer(GlanceModifier.height(8.dp))

        // Prayer rows
        data.prayers.forEach { prayer ->
            val isNext = prayer.name == data.nextPrayer
            Row(
                modifier = GlanceModifier
                    .fillMaxWidth()
                    .padding(vertical = 3.dp),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                Text(
                    prayer.name,
                    style = TextStyle(
                        color = ColorProvider(if (isNext) pcGreen else Color.White.copy(alpha = 0.85f)),
                        fontSize = 12.sp,
                        fontWeight = if (isNext) FontWeight.Bold else FontWeight.Normal,
                    ),
                    modifier = GlanceModifier.width(70.dp),
                )
                Text(
                    prayer.time,
                    style = TextStyle(
                        color = ColorProvider(if (isNext) pcGreen else Color.Gray),
                        fontSize = 12.sp,
                        fontWeight = if (isNext) FontWeight.Bold else FontWeight.Normal,
                    )
                )
            }
        }
    }
}

// ── Shared helpers ────────────────────────────────────────────────────────────

@Composable
private fun CompactPrayerRow(data: WidgetData) {
    Row(modifier = GlanceModifier.fillMaxWidth()) {
        Text(
            data.nextPrayer,
            style = TextStyle(color = ColorProvider(pcGreen), fontSize = 13.sp, fontWeight = FontWeight.Bold)
        )
        Spacer(GlanceModifier.width(6.dp))
        Text(
            data.nextPrayerTime,
            style = TextStyle(color = ColorProvider(Color.White), fontSize = 12.sp)
        )
    }
}

private fun shortName(name: String): String = when (name) {
    "Dhuhr"   -> "Dhr"
    "Maghrib" -> "Mgh"
    else      -> name.take(3)
}
