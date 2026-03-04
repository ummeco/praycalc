package com.praycalc.wear.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableLongStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.wear.compose.material.CircularProgressIndicator
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import com.praycalc.wear.PrayCalcColors
import com.praycalc.wear.data.PrayerData
import kotlinx.coroutines.delay
import java.time.Duration
import java.time.LocalTime

@Composable
fun CountdownScreen(prayerData: PrayerData) {
    val nextPrayer = prayerData.nextPrayer
    var nowMillis by remember { mutableLongStateOf(System.currentTimeMillis()) }

    LaunchedEffect(Unit) {
        while (true) {
            delay(60_000L)
            nowMillis = System.currentTimeMillis()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black),
        contentAlignment = Alignment.Center
    ) {
        if (nextPrayer == null) {
            Text(
                text = "No upcoming prayer",
                style = MaterialTheme.typography.body1,
                color = PrayCalcColors.Dimmed,
                textAlign = TextAlign.Center
            )
        } else {
            val now = LocalTime.now()
            val remaining = Duration.between(now, nextPrayer.time).let {
                if (it.isNegative) it.plusHours(24) else it
            }
            val totalSeconds = remaining.seconds
            val hours = totalSeconds / 3600
            val minutes = (totalSeconds % 3600) / 60

            val previousPrayerTime = findPreviousPrayerTime(prayerData, nextPrayer.name)
            val totalDuration = Duration.between(previousPrayerTime, nextPrayer.time).let {
                if (it.isNegative) it.plusHours(24) else it
            }
            val progress = if (totalDuration.seconds > 0) {
                1f - (remaining.seconds.toFloat() / totalDuration.seconds.toFloat())
            } else 0f

            CircularProgressIndicator(
                progress = progress.coerceIn(0f, 1f),
                modifier = Modifier.size(180.dp),
                indicatorColor = PrayCalcColors.Primary,
                trackColor = PrayCalcColors.Surface,
                strokeWidth = 8.dp
            )

            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.Center,
                modifier = Modifier.padding(24.dp)
            ) {
                Text(
                    text = nextPrayer.name,
                    style = MaterialTheme.typography.title2,
                    color = PrayCalcColors.Accent,
                    textAlign = TextAlign.Center
                )

                Text(
                    text = nextPrayer.displayTime,
                    style = MaterialTheme.typography.body2,
                    color = PrayCalcColors.OnSurface,
                    textAlign = TextAlign.Center
                )

                val countdownText = if (hours > 0) {
                    "${hours}h ${minutes}m"
                } else {
                    "${minutes}m"
                }

                Text(
                    text = countdownText,
                    style = MaterialTheme.typography.display3.copy(fontSize = 28.sp),
                    color = PrayCalcColors.Primary,
                    textAlign = TextAlign.Center,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }
        }
    }
}

private fun findPreviousPrayerTime(data: PrayerData, nextName: String): LocalTime {
    val prayers = data.prayers
    val idx = prayers.indexOfFirst { it.name == nextName }
    return if (idx > 0) {
        prayers[idx - 1].time
    } else {
        prayers.lastOrNull()?.time ?: LocalTime.MIDNIGHT
    }
}
