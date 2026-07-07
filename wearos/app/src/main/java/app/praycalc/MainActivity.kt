package app.praycalc

import android.Manifest
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen

/**
 * Single-activity host for the Wear OS app. Requests fine/coarse location
 * permission at launch (required at runtime on API 30+) so the offline JNI
 * engine has coordinates to calculate against; the app still renders (with
 * a location-error prompt) if the user denies.
 */
class MainActivity : ComponentActivity() {

    private val requestLocationPermission = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { _ ->
        // Result is observed indirectly: PrayerRepository re-checks
        // permission state on its own refresh() calls (triggered by the UI's
        // pull-to-refresh / retry chip), so no explicit callback wiring
        // is needed here beyond re-triggering an initial refresh.
        onPermissionResult?.invoke()
    }

    private var onPermissionResult: (() -> Unit)? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)

        requestLocationPermission.launch(
            arrayOf(
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.ACCESS_COARSE_LOCATION
            )
        )

        setContent {
            PrayCalcWearApp(registerPermissionCallback = { callback ->
                onPermissionResult = callback
            })
        }
    }
}
