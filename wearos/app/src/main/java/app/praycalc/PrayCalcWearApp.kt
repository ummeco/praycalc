package app.praycalc

import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.runtime.DisposableEffect
import androidx.compose.ui.platform.LocalContext
import androidx.wear.compose.material.MaterialTheme
import androidx.wear.compose.material.Colors
import androidx.compose.ui.graphics.Color
import androidx.wear.compose.navigation.SwipeDismissableNavHost
import androidx.wear.compose.navigation.composable
import androidx.wear.compose.navigation.rememberSwipeDismissableNavController
import app.praycalc.data.PrayerRepository
import app.praycalc.screens.CountdownScreen
import app.praycalc.screens.PrayerListScreen
import app.praycalc.screens.QiblaScreen
import app.praycalc.screens.SettingsScreen

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
    const val QIBLA = "qibla"
}

@Composable
fun PrayCalcWearApp(registerPermissionCallback: ((() -> Unit) -> Unit)? = null) {
    val context = LocalContext.current
    val repository = remember { PrayerRepository(context) }
    val prayerData by repository.prayerData.collectAsState()
    val locationError by repository.locationError.collectAsState()
    val navController = rememberSwipeDismissableNavController()

    // Re-run refresh() once the location-permission prompt (requested by
    // MainActivity at launch) resolves, so a freshly granted permission is
    // picked up without requiring the user to tap "Retry" manually.
    DisposableEffect(registerPermissionCallback) {
        registerPermissionCallback?.invoke { repository.refresh() }
        onDispose { }
    }

    MaterialTheme(colors = PrayCalcColorPalette) {
        SwipeDismissableNavHost(
            navController = navController,
            startDestination = Routes.PRAYER_LIST
        ) {
            composable(Routes.PRAYER_LIST) {
                PrayerListScreen(
                    prayerData = prayerData,
                    locationError = locationError,
                    onCountdownClick = {
                        navController.navigate(Routes.COUNTDOWN)
                    },
                    onSettingsClick = {
                        navController.navigate(Routes.SETTINGS)
                    },
                    onQiblaClick = {
                        navController.navigate(Routes.QIBLA)
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
            composable(Routes.QIBLA) {
                QiblaScreen(bearing = prayerData.qibla?.bearing?.toFloat() ?: 0f)
            }
        }
    }
}
