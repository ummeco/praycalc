package com.praycalc.wear.data

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.util.Log
import androidx.core.content.ContextCompat
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
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

private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "praycalc_settings")

class PrayerRepository(private val context: Context) {

    companion object {
        private const val TAG = "PrayerRepository"
        private const val BASE_URL = "https://api.praycalc.com/api/v1/times"
        private val KEY_METHOD = stringPreferencesKey("method")
        private val KEY_MADHAB = stringPreferencesKey("madhab")
        private const val DEFAULT_LAT = 40.7128
        private const val DEFAULT_LNG = -74.0060
    }

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)

    private val _prayerData = MutableStateFlow(PrayerData.Empty)
    val prayerData: StateFlow<PrayerData> = _prayerData.asStateFlow()

    private var cachedDate: LocalDate? = null

    val settingsFlow: Flow<Settings> = context.dataStore.data.map { prefs ->
        Settings(
            method = prefs[KEY_METHOD] ?: "isna",
            madhab = prefs[KEY_MADHAB] ?: "shafii"
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

                val (lat, lng) = getLocation()
                val settings = getCurrentSettings()
                val dateStr = today.format(DateTimeFormatter.ISO_LOCAL_DATE)

                val url = "$BASE_URL?lat=$lat&lng=$lng&date=$dateStr" +
                    "&method=${settings.method}&madhab=${settings.madhab}"

                val json = fetchJson(url)
                val data = PrayerData.fromJson(json)
                _prayerData.value = data
                cachedDate = today
            } catch (e: Exception) {
                Log.e(TAG, "Failed to fetch prayer times", e)
            }
        }
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

    private suspend fun getCurrentSettings(): Settings {
        val prefs = context.dataStore.data
        var method = "isna"
        var madhab = "shafii"
        prefs.collect { p ->
            method = p[KEY_METHOD] ?: "isna"
            madhab = p[KEY_MADHAB] ?: "shafii"
        }
        return Settings(method, madhab)
    }

    private suspend fun getLocation(): Pair<Double, Double> {
        if (ContextCompat.checkSelfPermission(
                context, Manifest.permission.ACCESS_FINE_LOCATION
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            return Pair(DEFAULT_LAT, DEFAULT_LNG)
        }

        return try {
            val cancellationToken = CancellationTokenSource()
            val location = fusedLocationClient.getCurrentLocation(
                Priority.PRIORITY_BALANCED_POWER_ACCURACY,
                cancellationToken.token
            ).await()

            if (location != null) {
                Pair(location.latitude, location.longitude)
            } else {
                Pair(DEFAULT_LAT, DEFAULT_LNG)
            }
        } catch (e: Exception) {
            Log.w(TAG, "Location unavailable, using default", e)
            Pair(DEFAULT_LAT, DEFAULT_LNG)
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
