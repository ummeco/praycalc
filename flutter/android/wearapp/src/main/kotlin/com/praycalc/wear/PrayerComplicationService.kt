package com.praycalc.wear

// PrayerComplicationService.kt — v1.1 WearOS complication data source.
// Spec §9.2, S19-D T22
//
// Provides complication data for WearOS clock faces.
// Primary type: SHORT_TEXT (prayer name + time or countdown).
//
// Complication ID maps to which prayer to show (0 = next, 1–5 = specific).
// For the primary use-case (complication ID 0) we show the next upcoming prayer.
//
// Updates triggered by PrayerDataListenerService via
//   ComplicationDataSourceUpdateRequester.forceUpdate(context, PrayerComplicationService::class.java)
//
// Dependencies: T21 (PrayerTileService / PrayerDataListenerService for data)

import android.app.PendingIntent
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import androidx.wear.watchface.complications.data.*
import androidx.wear.watchface.complications.datasource.ComplicationDataSourceService
import androidx.wear.watchface.complications.datasource.ComplicationDataSourceUpdateRequester
import androidx.wear.watchface.complications.datasource.ComplicationRequest

class PrayerComplicationService : ComplicationDataSourceService() {

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        return when (type) {
            ComplicationType.SHORT_TEXT -> buildShortText("Asr", "3:47 PM", "in 2h 17m")
            ComplicationType.LONG_TEXT  -> buildLongText("Asr", "3:47 PM", "in 2h 17m")
            ComplicationType.RANGED_VALUE -> buildRangedValue(0.55f)
            else -> null
        }
    }

    override fun onComplicationRequest(
        request: ComplicationRequest,
        listener: ComplicationRequestListener
    ) {
        val prefs      = getSharedPreferences("wear_prayer", Context.MODE_PRIVATE)
        val nextPrayer = prefs.getString("next_prayer", "Fajr") ?: "Fajr"
        val nextTime   = prefs.getString("next_prayer_time", "--:--") ?: "--:--"
        val nextTs     = prefs.getLong("next_prayer_ts", 0L)
        val nowSecs    = System.currentTimeMillis() / 1000L
        val secsLeft   = (nextTs - nowSecs).coerceAtLeast(0)
        val countdown  = formatCountdown(secsLeft)

        val data: ComplicationData? = when (request.complicationType) {
            ComplicationType.SHORT_TEXT  -> buildShortText(nextPrayer, nextTime, countdown)
            ComplicationType.LONG_TEXT   -> buildLongText(nextPrayer, nextTime, countdown)
            ComplicationType.RANGED_VALUE -> {
                // Progress 0–1 approximated from timestamp; default 0.5 if unknown
                val fajrTs    = prefs.getLong("fajr_ts", 0L)
                val nextPrev  = prefs.getLong("next_prayer_ts", 0L)
                val progress  = if (fajrTs > 0 && nextTs > fajrTs) {
                    ((nowSecs - fajrTs).toFloat() / (nextTs - fajrTs).toFloat()).coerceIn(0f, 1f)
                } else 0.5f
                buildRangedValue(progress)
            }
            else -> null
        }

        if (data != null) listener.onComplicationData(data)
    }

    // -----------------------------------------------------------------------
    // Builders
    // -----------------------------------------------------------------------

    private fun buildShortText(
        name: String,
        time: String,
        countdown: String
    ): ShortTextComplicationData {
        val tapAction = buildTapAction()
        return ShortTextComplicationData.Builder(
            text          = PlainComplicationText.Builder(name).build(),
            contentDescription = PlainComplicationText.Builder("$name at $time, $countdown").build()
        )
            .setTitle(PlainComplicationText.Builder(countdown).build())
            .setTapAction(tapAction)
            .build()
    }

    private fun buildLongText(
        name: String,
        time: String,
        countdown: String
    ): LongTextComplicationData {
        val tapAction = buildTapAction()
        return LongTextComplicationData.Builder(
            text          = PlainComplicationText.Builder("$name · $time").build(),
            contentDescription = PlainComplicationText.Builder("$name at $time, $countdown").build()
        )
            .setTitle(PlainComplicationText.Builder(countdown).build())
            .setTapAction(tapAction)
            .build()
    }

    private fun buildRangedValue(progress: Float): RangedValueComplicationData {
        val prefs      = getSharedPreferences("wear_prayer", Context.MODE_PRIVATE)
        val nextPrayer = prefs.getString("next_prayer", "Fajr") ?: "Fajr"
        val nextTime   = prefs.getString("next_prayer_time", "--:--") ?: "--:--"
        return RangedValueComplicationData.Builder(
            value         = progress,
            min           = 0f,
            max           = 1f,
            contentDescription = PlainComplicationText.Builder("Prayer progress: ${(progress * 100).toInt()}%").build()
        )
            .setText(PlainComplicationText.Builder(nextPrayer).build())
            .setTitle(PlainComplicationText.Builder(nextTime).build())
            .setTapAction(buildTapAction())
            .build()
    }

    /** Opens the WearPrayerActivity when the complication is tapped. */
    private fun buildTapAction(): PendingIntent {
        val intent = Intent(this, WearPrayerActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        return PendingIntent.getActivity(
            this, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
    }

    // -----------------------------------------------------------------------
    // Countdown formatter
    // -----------------------------------------------------------------------

    private fun formatCountdown(secs: Long): String = when {
        secs <= 0   -> "now"
        secs < 3600 -> "in ${secs / 60}m"
        else        -> "in ${secs / 3600}h ${(secs % 3600) / 60}m"
    }

    // -----------------------------------------------------------------------
    // Static helper — called by PrayerDataListenerService on new data
    // -----------------------------------------------------------------------

    companion object {
        fun requestUpdate(context: Context) {
            ComplicationDataSourceUpdateRequester
                .create(context, ComponentName(context, PrayerComplicationService::class.java))
                .requestUpdateAll()
        }
    }
}
