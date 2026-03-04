package com.praycalc.wear.complications

import android.graphics.drawable.Icon
import androidx.wear.watchface.complications.data.ComplicationData
import androidx.wear.watchface.complications.data.ComplicationType
import androidx.wear.watchface.complications.data.LongTextComplicationData
import androidx.wear.watchface.complications.data.PlainComplicationText
import androidx.wear.watchface.complications.data.RangedValueComplicationData
import androidx.wear.watchface.complications.data.ShortTextComplicationData
import androidx.wear.watchface.complications.datasource.ComplicationRequest
import androidx.wear.watchface.complications.datasource.SuspendingComplicationDataSourceService
import com.praycalc.wear.data.PrayerRepository
import java.time.Duration
import java.time.LocalTime

class PrayerComplicationService : SuspendingComplicationDataSourceService() {

    private lateinit var repository: PrayerRepository

    override fun onCreate() {
        super.onCreate()
        repository = PrayerRepository(applicationContext)
    }

    override fun getPreviewData(type: ComplicationType): ComplicationData? {
        return when (type) {
            ComplicationType.SHORT_TEXT -> {
                ShortTextComplicationData.Builder(
                    text = PlainComplicationText.Builder("5:30 AM").build(),
                    contentDescription = PlainComplicationText.Builder("Fajr at 5:30 AM").build()
                ).build()
            }
            ComplicationType.LONG_TEXT -> {
                LongTextComplicationData.Builder(
                    text = PlainComplicationText.Builder("Fajr 5:30 AM").build(),
                    contentDescription = PlainComplicationText.Builder("Next prayer: Fajr at 5:30 AM").build()
                ).build()
            }
            ComplicationType.RANGED_VALUE -> {
                RangedValueComplicationData.Builder(
                    value = 0.65f,
                    min = 0f,
                    max = 1f,
                    contentDescription = PlainComplicationText.Builder("65% until Fajr").build()
                )
                    .setText(PlainComplicationText.Builder("Fajr").build())
                    .build()
            }
            else -> null
        }
    }

    override suspend fun onComplicationRequest(request: ComplicationRequest): ComplicationData? {
        repository.refresh()
        val data = repository.prayerData.value
        val nextPrayer = data.nextPrayer ?: return null

        val now = LocalTime.now()
        val remaining = Duration.between(now, nextPrayer.time).let {
            if (it.isNegative) it.plusHours(24) else it
        }

        val previousIdx = data.prayers.indexOfFirst { it.isNext } - 1
        val previousTime = if (previousIdx >= 0) {
            data.prayers[previousIdx].time
        } else {
            data.prayers.lastOrNull()?.time ?: LocalTime.MIDNIGHT
        }
        val totalDuration = Duration.between(previousTime, nextPrayer.time).let {
            if (it.isNegative) it.plusHours(24) else it
        }
        val progress = if (totalDuration.seconds > 0) {
            1f - (remaining.seconds.toFloat() / totalDuration.seconds.toFloat())
        } else 0f

        return when (request.complicationType) {
            ComplicationType.SHORT_TEXT -> {
                ShortTextComplicationData.Builder(
                    text = PlainComplicationText.Builder(nextPrayer.displayTime).build(),
                    contentDescription = PlainComplicationText.Builder(
                        "${nextPrayer.name} at ${nextPrayer.displayTime}"
                    ).build()
                ).build()
            }
            ComplicationType.LONG_TEXT -> {
                LongTextComplicationData.Builder(
                    text = PlainComplicationText.Builder(
                        "${nextPrayer.name} ${nextPrayer.displayTime}"
                    ).build(),
                    contentDescription = PlainComplicationText.Builder(
                        "Next prayer: ${nextPrayer.name} at ${nextPrayer.displayTime}"
                    ).build()
                ).build()
            }
            ComplicationType.RANGED_VALUE -> {
                RangedValueComplicationData.Builder(
                    value = progress.coerceIn(0f, 1f),
                    min = 0f,
                    max = 1f,
                    contentDescription = PlainComplicationText.Builder(
                        "${(progress * 100).toInt()}% until ${nextPrayer.name}"
                    ).build()
                )
                    .setText(PlainComplicationText.Builder(nextPrayer.name).build())
                    .build()
            }
            else -> null
        }
    }
}
