package app.praycalc.data

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.content.ContextCompat
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import com.google.android.gms.tasks.CancellationTokenSource
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.firstOrNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import org.json.JSONObject
import java.io.BufferedReader
import java.io.InputStreamReader
import java.net.HttpURLConnection
import java.net.URL
import java.time.LocalDate
import java.time.format.DateTimeFormatter

/**
 * WearOS is offline-first: prayer times are computed on-device via the
 * shared C core engine (`core/c/`) through the [PrayCalcNative] JNI bridge —
 * no network round-trip required. Resolution order per refresh:
 *   1. Data synced from the paired phone app (Wearable Data Layer), if present.
 *   2. Local offline calculation via [calculateOffline] (JNI → C core).
 *   3. Network fetch from `api.praycalc.com` only if the JNI calculation fails
 *      (e.g. native lib load error) and location is available.
 * The watch never requires connectivity for its core function.
 */
class PrayerRepository(
    private val context: Context,
) {
    companion object {
        private const val TAG = "PrayerRepository"
        private const val BASE_URL = "https://api.praycalc.com/api/v1/times"
        private val KEY_METHOD = stringPreferencesKey("method")
        private val KEY_MADHAB = stringPreferencesKey("madhab")
        val KEY_SYNCED_DATA = stringPreferencesKey("synced_prayer_data")
        val KEY_SYNCED_LOCATION = stringPreferencesKey("synced_location")
    }

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)

    private val _prayerData = MutableStateFlow(PrayerData.Empty)
    val prayerData: StateFlow<PrayerData> = _prayerData.asStateFlow()

    private val _locationError = MutableStateFlow<String?>(null)
    val locationError: StateFlow<String?> = _locationError.asStateFlow()

    private var cachedDate: LocalDate? = null

    val settingsFlow: Flow<Settings> =
        context.dataStore.data.map { prefs ->
            Settings(
                method = prefs[KEY_METHOD] ?: "isna",
                madhab = prefs[KEY_MADHAB] ?: "shafii",
            )
        }

    init {
        refresh()
    }

    fun refresh() {
        scope.launch {
            try {
                val today = LocalDate.now()
                if (cachedDate == today && _prayerData.value.prayers.isNotEmpty()) return@launch

                val settings = getCurrentSettings()

                // 1. Try to use synced data from phone first (for consistency)
                val syncedData = getSyncedData()
                if (syncedData != null) {
                    _prayerData.value = syncedData
                    cachedDate = today
                    return@launch
                }

                // 2. Fall back to local calculation if no sync data
                val location = getLocation()
                if (location != null) {
                    _locationError.value = null
                    val (lat, lng) = location
                    val data =
                        calculateOffline(lat, lng, today, settings)
                            ?: fetchFromApi(lat, lng, today, settings)

                    if (data != null) {
                        _prayerData.value = data
                        cachedDate = today
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Failed to calculate prayer times", e)
            }
        }
    }

    /**
     * Calculate prayer times offline using the C core engine via JNI.
     */
    private fun calculateOffline(
        lat: Double,
        lng: Double,
        date: LocalDate,
        settings: Settings,
    ): PrayerData? =
        try {
            val times =
                PrayCalcNative.calculatePrayerTimes(
                    latitude = lat,
                    longitude = lng,
                    date = date,
                    method = settings.method,
                    madhab = settings.madhab,
                )

            val now = java.time.LocalTime.now()
            val prayerNames = listOf("Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha")
            val prayerLocalTimes =
                listOf(
                    times.fajr,
                    times.sunrise,
                    times.dhuhr,
                    times.asr,
                    times.maghrib,
                    times.isha,
                )

            // Find next prayer
            var nextIndex = 0
            for (i in prayerLocalTimes.indices) {
                if (prayerLocalTimes[i].isAfter(now)) {
                    nextIndex = i
                    break
                }
            }

            val prayers =
                prayerNames.mapIndexed { index, name ->
                    PrayerTime(
                        name = name,
                        time = prayerLocalTimes[index],
                        isNext = index == nextIndex,
                    )
                }

            PrayerData(
                prayers = prayers,
                nextPrayer = prayers[nextIndex],
                qibla = QiblaInfo(bearing = times.qiblaBearing, distance = 0.0),
                meta =
                    PrayerMeta(
                        method = settings.method,
                        madhab = settings.madhab,
                        timezone =
                            java.time.ZoneId
                                .systemDefault()
                                .id,
                        latitude = lat,
                        longitude = lng,
                    ),
            )
        } catch (e: Exception) {
            Log.w(TAG, "Offline calculation failed, falling back to API", e)
            null
        }

    /**
     * Fetch prayer times from the API as a fallback.
     */
    private fun fetchFromApi(
        lat: Double,
        lng: Double,
        date: LocalDate,
        settings: Settings,
    ): PrayerData? =
        try {
            val dateStr = date.format(DateTimeFormatter.ISO_LOCAL_DATE)
            val url =
                "$BASE_URL?lat=$lat&lng=$lng&date=$dateStr" +
                    "&method=${settings.method}&madhab=${settings.madhab}"
            val json = fetchJson(url)
            PrayerData.fromJson(json)
        } catch (e: Exception) {
            Log.e(TAG, "API fetch also failed", e)
            null
        }

    suspend fun updateMethod(method: String) {
        context.dataStore.edit { prefs -> prefs[KEY_METHOD] = method }
        cachedDate = null
        refresh()
    }

    suspend fun updateMadhab(madhab: String) {
        context.dataStore.edit { prefs -> prefs[KEY_MADHAB] = madhab }
        cachedDate = null
        refresh()
    }

    private suspend fun getSyncedData(): PrayerData? {
        val prefs =
            context.dataStore.data
                .map { it[KEY_SYNCED_DATA] }
                .firstOrNull()
        if (prefs == null) return null
        return try {
            PrayerData.fromJson(JSONObject(prefs))
        } catch (e: Exception) {
            null
        }
    }

    private suspend fun getCurrentSettings(): Settings {
        val prefs = context.dataStore.data.firstOrNull()
        return Settings(
            method = prefs?.get(KEY_METHOD) ?: "isna",
            madhab = prefs?.get(KEY_MADHAB) ?: "shafii",
        )
    }

    private suspend fun getLocation(): Pair<Double, Double>? {
        if (ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_FINE_LOCATION,
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            _locationError.value =
                "Location permission required. Grant location access in Settings or set your location in the PrayCalc app."
            Log.w(TAG, "Location permission not granted")
            return null
        }

        return try {
            val cancellationToken = CancellationTokenSource()
            val location =
                fusedLocationClient
                    .getCurrentLocation(
                        Priority.PRIORITY_BALANCED_POWER_ACCURACY,
                        cancellationToken.token,
                    ).await()

            if (location != null) {
                Pair(location.latitude, location.longitude)
            } else {
                _locationError.value = "Unable to determine location. Please enable GPS or set your location in the PrayCalc app."
                Log.w(TAG, "Location returned null")
                null
            }
        } catch (e: Exception) {
            _locationError.value = "Location unavailable. Please check GPS settings or set your location in the PrayCalc app."
            Log.w(TAG, "Location unavailable", e)
            null
        }
    }

    private fun fetchJson(urlStr: String): JSONObject {
        val url = URL(urlStr)
        val connection = url.openConnection() as HttpURLConnection
        connection.requestMethod = "GET"
        connection.connectTimeout = 10_000
        connection.readTimeout = 10_000
        connection.setRequestProperty("Accept", "application/json")

        try {
            val reader = BufferedReader(InputStreamReader(connection.inputStream))
            val response = reader.readText()
            reader.close()
            return JSONObject(response)
        } finally {
            connection.disconnect()
        }
    }
}
