/**
 * pray_calc_jni.c — JNI bridge for the PrayCalc C core library.
 *
 * Exposes pray_calc_times() and qibla_bearing() to Kotlin/Java
 * via the PrayCalcNative class.
 */

#include <jni.h>
#include "pray_calc.h"
#include "qibla.h"

/**
 * Calculate prayer times for the given parameters.
 *
 * Returns a double array of 7 elements:
 *   [0] fajr, [1] sunrise, [2] dhuhr, [3] asr,
 *   [4] maghrib, [5] isha, [6] qibla_bearing
 *
 * All prayer times are fractional hours since midnight (local time).
 */
JNIEXPORT jdoubleArray JNICALL
Java_app_praycalc_data_PrayCalcNative_nativeCalculateTimes(
    JNIEnv *env,
    jclass clazz,
    jdouble latitude,
    jdouble longitude,
    jint year,
    jint month,
    jint day,
    jdouble timezone,
    jdouble elevation,
    jint method,
    jint madhab
) {
    PrayCalcInput input;
    pray_calc_input_init(&input);

    input.latitude = latitude;
    input.longitude = longitude;
    input.year = year;
    input.month = month;
    input.day = day;
    input.timezone = timezone;
    input.elevation = elevation;
    input.method = method;
    input.madhab = madhab;

    PrayCalcResult result = pray_calc_times(input);

    jdoubleArray output = (*env)->NewDoubleArray(env, 7);
    if (output == NULL) return NULL;

    jdouble values[7] = {
        result.fajr,
        result.sunrise,
        result.dhuhr,
        result.asr,
        result.maghrib,
        result.isha,
        result.qibla_bearing
    };

    (*env)->SetDoubleArrayRegion(env, output, 0, 7, values);
    return output;
}

/**
 * Calculate Qibla bearing from the given coordinates.
 * Returns degrees clockwise from north.
 */
JNIEXPORT jdouble JNICALL
Java_app_praycalc_data_PrayCalcNative_nativeQiblaBearing(
    JNIEnv *env,
    jclass clazz,
    jdouble latitude,
    jdouble longitude
) {
    return qibla_bearing(latitude, longitude);
}
