package com.praycalc.wear

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Colors
import androidx.compose.ui.graphics.Color
import androidx.wear.compose.navigation.SwipeDismissableNavHost
import androidx.wear.compose.navigation.composable
import androidx.wear.compose.navigation.rememberSwipeDismissableNavController
import com.praycalc.wear.data.PrayerRepository
import com.praycalc.wear.screens.CountdownScreen
import com.praycalc.wear.screens.PrayerListScreen
import com.praycalc.wear.screens.SettingsScreen

object PrayCalcColors {
    val Primary = Color(0xFF79C24C)
    val Accent = Color(0xFFC9F27A)
    val Deep = Color(0xFF0D2F17)
    val Surface = Color(0xFF1A1A1A)
    val OnSurface = Color(0xFFE0E0E0)
    val Dimmed = Color(0xFF888888)
}

private val PrayCalcColorPalette = Colors(
    primary = PrayCalcColors.Primary,
    primaryVariant = PrayCalcColors.Accent,
    secondary = PrayCalcColors.Accent,
    secondaryVariant = PrayCalcColors.Primary,
    background = Color.Black,
    surface = PrayCalcColors.Surface,
    error = Color(0xFFCF6679),
    onPrimary = PrayCalcColors.Deep,
    onSecondary = PrayCalcColors.Deep,
    onBackground = PrayCalcColors.OnSurface,
    onSurface = PrayCalcColors.OnSurface,
    onError = Color.Black
)

object Routes {
    const val PRAYER_LIST = "prayer_list"
    const val COUNTDOWN = "countdown"
    const val SETTINGS = "settings"
}

@Composable
fun PrayCalcWearApp() {
    val context = LocalContext.current
    val repository = remember { PrayerRepository(context) }
    val prayerData by repository.prayerData.collectAsState()
    val navController = rememberSwipeDismissableNavController()

    MaterialTheme(colors = PrayCalcColorPalette) {
        SwipeDismissableNavHost(
            navController = navController,
            startDestination = Routes.PRAYER_LIST
        ) {
            composable(Routes.PRAYER_LIST) {
                PrayerListScreen(
                    prayerData = prayerData,
                    onCountdownClick = {
                        navController.navigate(Routes.COUNTDOWN)
                    },
                    onSettingsClick = {
                        navController.navigate(Routes.SETTINGS)
                    },
                    onRefresh = { repository.refresh() }
                )
            }
            composable(Routes.COUNTDOWN) {
                CountdownScreen(prayerData = prayerData)
            }
            composable(Routes.SETTINGS) {
                SettingsScreen(
                    repository = repository,
                    onBack = { navController.popBackStack() }
                )
            }
        }
    }
}
