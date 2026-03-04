package com.praycalc.wear.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.input.rotary.onRotaryScrollEvent
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import androidx.wear.compose.foundation.lazy.ScalingLazyColumn
import androidx.wear.compose.foundation.lazy.items
import androidx.wear.compose.foundation.lazy.rememberScalingLazyListState
import androidx.wear.compose.material.Chip
import androidx.wear.compose.material.ChipDefaults
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Text
import androidx.wear.compose.material.ToggleChip
import androidx.wear.compose.material.ToggleChipDefaults
import com.praycalc.wear.PrayCalcColors
import com.praycalc.wear.data.PrayerRepository
import com.praycalc.wear.data.Settings
import kotlinx.coroutines.launch

@Composable
fun SettingsScreen(
    repository: PrayerRepository,
    onBack: () -> Unit
) {
    val settings by repository.settingsFlow.collectAsState(initial = Settings())
    val coroutineScope = rememberCoroutineScope()
    val listState = rememberScalingLazyListState()
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
                text = "Settings",
                style = MaterialTheme.typography.title3,
                color = PrayCalcColors.Accent
            )
        }

        item {
            Text(
                text = "Calculation Method",
                style = MaterialTheme.typography.caption1,
                color = PrayCalcColors.Dimmed,
                modifier = Modifier.fillMaxWidth()
            )
        }

        items(Settings.METHODS) { (key, label) ->
            val isSelected = settings.method == key
            Chip(
                onClick = {
                    coroutineScope.launch { repository.updateMethod(key) }
                },
                label = {
                    Text(
                        text = label,
                        color = if (isSelected) PrayCalcColors.Deep else PrayCalcColors.OnSurface
                    )
                },
                colors = if (isSelected) {
                    ChipDefaults.chipColors(
                        backgroundColor = PrayCalcColors.Primary
                    )
                } else {
                    ChipDefaults.secondaryChipColors()
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .semantics {
                        contentDescription = "$label calculation method" +
                            if (isSelected) ", selected" else ""
                    }
            )
        }

        item {
            Text(
                text = "Madhab",
                style = MaterialTheme.typography.caption1,
                color = PrayCalcColors.Dimmed,
                modifier = Modifier.fillMaxWidth()
            )
        }

        items(Settings.MADHABS) { (key, label) ->
            val isSelected = settings.madhab == key
            ToggleChip(
                checked = isSelected,
                onCheckedChange = {
                    coroutineScope.launch { repository.updateMadhab(key) }
                },
                label = {
                    Text(
                        text = label,
                        color = if (isSelected) PrayCalcColors.Deep else PrayCalcColors.OnSurface
                    )
                },
                toggleControl = {
                    ToggleChipDefaults.RadioIcon(selected = isSelected)
                },
                colors = ToggleChipDefaults.toggleChipColors(
                    checkedStartBackgroundColor = PrayCalcColors.Primary,
                    checkedEndBackgroundColor = PrayCalcColors.Primary
                ),
                modifier = Modifier
                    .fillMaxWidth()
                    .semantics {
                        contentDescription = "$label madhab" +
                            if (isSelected) ", selected" else ""
                    }
            )
        }
    }
}
