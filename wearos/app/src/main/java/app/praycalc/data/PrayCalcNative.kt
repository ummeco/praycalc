package app.praycalc.data

import java.time.LocalDate
import java.time.LocalTime
import java.time.ZoneId

/**
 * Kotlin wrapper around the C core prayer calculation library via JNI.
 * Provides offline prayer time calculation on Wear OS.
 */
object PrayCalcNative {
    init {
        System.loadLibrary("praycalc_native")
    }

    // -- JNI native methods --

    /**
     * Calculate prayer times. Returns double[7]:
     * [fajr, sunrise, dhuhr, asr, maghrib, isha, qibla_bearing]
     * Times are fractional hours since midnight (local time).
     */
    @JvmStatic
    private external fun nativeCalculateTimes(
        latitude: Double,
        longitude: Double,
        year: Int,
        month: Int,
        day: Int,
        timezone: Double,
        elevation: Double,
        method: Int,
        madhab: Int,
    ): DoubleArray

    /**
     * Calculate Qibla bearing in degrees from north.
     */
    @JvmStatic
    private external fun nativeQiblaBearing(
        latitude: Double,
        longitude: Double,
    ): Double

    // -- Calculation method constants (must match CalcMethod enum in C) --

    object Method {
        const val ISNA = 0
        const val MWL = 1
        const val EGYPT = 2
        const val UMM_AL_QURA = 3
        const val TEHRAN = 4
        const val KARACHI = 5

        fun fromApiKey(key: String): Int =
            when (key) {
                "isna" -> ISNA
                "mwl" -> MWL
                "egypt" -> EGYPT
                "umm_al_qura", "makkah" -> UMM_AL_QURA
                "tehran" -> TEHRAN
                "karachi" -> KARACHI
                else -> ISNA
            }
    }

    object Madhab {
        const val SHAFI = 0
        const val HANAFI = 1

        fun fromApiKey(key: String): Int =
            when (key) {
                "shafii", "shafi" -> SHAFI
                "hanafi" -> HANAFI
                else -> SHAFI
            }
    }

    // -- Public API --

    data class OfflinePrayerTimes(
        val fajr: LocalTime,
        val sunrise: LocalTime,
        val dhuhr: LocalTime,
        val asr: LocalTime,
        val maghrib: LocalTime,
        val isha: LocalTime,
        val qiblaBearing: Double,
    )

    /**
     * Calculate prayer times offline using the C core engine.
     *
     * @param latitude Observer latitude in degrees
     * @param longitude Observer longitude in degrees
     * @param date Date to calculate for (defaults to today)
     * @param elevation Meters above sea level (defaults to 0)
     * @param method Calculation method string key (e.g. "isna", "mwl")
     * @param madhab Madhab string key ("shafii" or "hanafi")
     * @return OfflinePrayerTimes with all prayer times as LocalTime
     */
    fun calculatePrayerTimes(
        latitude: Double,
        longitude: Double,
        date: LocalDate = LocalDate.now(),
        elevation: Double = 0.0,
        method: String = "isna",
        madhab: String = "shafii",
    ): OfflinePrayerTimes {
        val zone = ZoneId.systemDefault()
        val offset = zone.rules.getOffset(date.atStartOfDay())
        val timezoneHours = offset.totalSeconds / 3600.0

        val result =
            nativeCalculateTimes(
                latitude = latitude,
                longitude = longitude,
                year = date.year,
                month = date.monthValue,
                day = date.dayOfMonth,
                timezone = timezoneHours,
                elevation = elevation,
                method = Method.fromApiKey(method),
                madhab = Madhab.fromApiKey(madhab),
            )

        return OfflinePrayerTimes(
            fajr = fractionalHoursToLocalTime(result[0]),
            sunrise = fractionalHoursToLocalTime(result[1]),
            dhuhr = fractionalHoursToLocalTime(result[2]),
            asr = fractionalHoursToLocalTime(result[3]),
            maghrib = fractionalHoursToLocalTime(result[4]),
            isha = fractionalHoursToLocalTime(result[5]),
            qiblaBearing = result[6],
        )
    }

    /**
     * Calculate Qibla bearing from the given coordinates.
     * Returns degrees clockwise from north (0=N, 90=E, 180=S, 270=W).
     */
    fun getQiblaBearing(
        latitude: Double,
        longitude: Double,
    ): Double = nativeQiblaBearing(latitude, longitude)

    private fun fractionalHoursToLocalTime(hours: Double): LocalTime {
        if (hours.isNaN() || hours < 0 || hours >= 24) {
            return LocalTime.MIDNIGHT
        }
        val totalSeconds = (hours * 3600).toLong()
        val h = (totalSeconds / 3600).toInt()
        val m = ((totalSeconds % 3600) / 60).toInt()
        val s = (totalSeconds % 60).toInt()
        return LocalTime.of(h.coerceIn(0, 23), m.coerceIn(0, 59), s.coerceIn(0, 59))
    }
}
