package com.praycalc.wear.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.rotary.onRotaryScrollEvent
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.CompactChip
import androidx.wear.compose.material.Icon
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import com.praycalc.wear.PrayCalcColors
import com.praycalc.wear.data.PrayerData
import com.praycalc.wear.data.PrayerTime
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.filled.Timer
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope

private val prayerIcons = mapOf(
    "Fajr" to "\uD83C\uDF05",
    "Sunrise" to "\u2600\uFE0F",
    "Dhuhr" to "\uD83C\uDF1E",
    "Asr" to "\u26C5",
    "Maghrib" to "\uD83C\uDF07",
    "Isha" to "\uD83C\uDF19"
)

@Composable
fun PrayerListScreen(
    prayerData: PrayerData,
    onCountdownClick: () -> Unit,
    onSettingsClick: () -> Unit,
    onRefresh: () -> Unit
) {
    val listState = rememberScalingLazyListState()
    val coroutineScope = rememberCoroutineScope()
    val focusRequester = remember { FocusRequester() }

    ScalingLazyColumn(
        state = listState,
        modifier = Modifier
            .fillMaxSize()
            .background(Color.Black)
            .focusRequester(focusRequester)
            .onRotaryScrollEvent { event ->
                coroutineScope.launch {
                    listState.scrollBy(event.verticalScrollPixels)
                }
                true
            },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        item {
            Text(
                text = "PrayCalc",
                style = MaterialTheme.typography.title3,
                color = PrayCalcColors.Accent,
                textAlign = TextAlign.Center,
                modifier = Modifier.fillMaxWidth()
            )
        }

        if (prayerData.prayers.isEmpty()) {
            item {
                Text(
                    text = "Loading...",
                    style = MaterialTheme.typography.body1,
                    color = PrayCalcColors.Dimmed,
                    textAlign = TextAlign.Center
                )
            }
        } else {
            items(prayerData.prayers) { prayer ->
                PrayerChip(prayer = prayer, onClick = {
                    if (prayer.isNext) onCountdownClick()
                })
            }
        }

        item {
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(top = 8.dp)
            ) {
                CompactChip(
                    onClick = onCountdownClick,
                    label = { Text("Timer") },
                    icon = {
                        Icon(
                            imageVector = Icons.Default.Timer,
                            contentDescription = "Countdown timer",
                            modifier = Modifier.size(16.dp)
                        )
                    },
                    colors = ChipDefaults.secondaryChipColors()
                )
                CompactChip(
                    onClick = onSettingsClick,
                    label = { Text("Settings") },
                    icon = {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Settings",
                            modifier = Modifier.size(16.dp)
                        )
                    },
                    colors = ChipDefaults.secondaryChipColors()
                )
            }
        }
    }
}

@Composable
private fun PrayerChip(prayer: PrayerTime, onClick: () -> Unit) {
    val chipColors = if (prayer.isNext) {
        ChipDefaults.chipColors(
            backgroundColor = PrayCalcColors.Primary,
            contentColor = PrayCalcColors.Deep
        )
    } else {
        ChipDefaults.chipColors(
            backgroundColor = PrayCalcColors.Surface,
            contentColor = PrayCalcColors.Dimmed
        )
    }

    val iconText = prayerIcons[prayer.name] ?: "\uD83D\uDD4C"
    val description = "${prayer.name} at ${prayer.displayTime}" +
        if (prayer.isNext) ", next prayer" else ""

    Chip(
        onClick = onClick,
        label = {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(text = iconText)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(
                        text = prayer.name,
                        style = MaterialTheme.typography.body1,
                        color = if (prayer.isNext) PrayCalcColors.Deep else PrayCalcColors.OnSurface
                    )
                }
                Text(
                    text = prayer.displayTime,
                    style = MaterialTheme.typography.body2,
                    color = if (prayer.isNext) PrayCalcColors.Deep else PrayCalcColors.Dimmed
                )
            }
        },
        colors = chipColors,
        modifier = Modifier
            .fillMaxWidth()
            .semantics { contentDescription = description }
    )
}
