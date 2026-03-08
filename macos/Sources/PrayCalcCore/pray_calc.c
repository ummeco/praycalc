/**
 * pray_calc.c — Prayer time calculation engine in C99.
 *
 * Uses the NREL SPA (nrel_spa.c) for solar position and computes prayer
 * times based on method-specific Fajr/Isha depression angles.
 *
 * Algorithm matches the TypeScript (smart/src/lib/prayer-calculator.ts)
 * and Dart (flutter/packages/pray_calc_dart/) implementations.
 */

#include "pray_calc.h"
#include "nrel_spa.h"
#include "qibla.h"
#include <math.h>
#include <stdio.h>
#include <string.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

/* ─── Method angle definitions ────────────────────────────────────────────── */

typedef struct {
    double fajr_angle;   /* solar depression angle for Fajr (degrees) */
    double isha_angle;   /* solar depression angle for Isha (degrees), 0 = use offset */
    double isha_offset;  /* minutes after Maghrib (only if isha_angle == 0) */
} MethodAngles;

static const MethodAngles METHOD_ANGLES[CALC_METHOD_COUNT] = {
    /* ISNA */       { 15.0,  15.0,  0.0 },
    /* MWL */        { 18.0,  17.0,  0.0 },
    /* Egypt */      { 19.5,  17.5,  0.0 },
    /* Umm al-Qura */{ 18.5,   0.0, 90.0 },
    /* Tehran */     { 17.7,  14.0,  0.0 },
    /* Karachi */    { 18.0,  18.0,  0.0 },
};

/* ─── Asr calculation ─────────────────────────────────────────────────────── */

/**
 * Compute Asr time as fractional hours.
 *
 * solar_noon: solar noon in fractional hours
 * latitude:   observer latitude in degrees
 * declination: solar declination in degrees
 * hanafi:     1 for Hanafi (shadow factor 2), 0 for Shafi'i (factor 1)
 */
static double compute_asr(double solar_noon, double latitude,
                           double declination, int hanafi) {
    double deg = M_PI / 180.0;
    double phi = latitude * deg;
    double delta = declination * deg;
    double shadow_factor = hanafi ? 2.0 : 1.0;

    /* Required solar altitude: tan(A) = 1 / (shadow_factor + tan(|phi - delta|)) */
    double x = fabs(phi - delta);
    double tan_a = 1.0 / (shadow_factor + tan(x));
    double sin_a = tan_a / sqrt(1.0 + tan_a * tan_a);

    /* cos(H0) = (sin(A) - sin(phi)*sin(delta)) / (cos(phi)*cos(delta)) */
    double cos_h0 = (sin_a - sin(phi) * sin(delta)) / (cos(phi) * cos(delta));

    if (cos_h0 < -1.0 || cos_h0 > 1.0) return NAN;

    double h0h = acos(cos_h0) / deg / 15.0;
    return solar_noon + h0h;
}

/* ─── Solar ephemeris (Meeus low-precision) ───────────────────────────────── */

/**
 * Compute solar declination for Asr calculation using Jean Meeus formulas.
 * This is the same approach as the Dart solar_ephemeris.dart.
 */
static double solar_declination_meeus(int year, int month, int day) {
    double deg = M_PI / 180.0;

    /* Julian Date at UTC noon */
    double a_val = (14.0 - month) / 12.0;
    int y = year + 4800 - (int)a_val;
    int m = month + 12 * (int)a_val - 3;
    double jd = day + (153.0 * m + 2) / 5.0 + 365.0 * y + y / 4.0 - y / 100.0 + y / 400.0 - 32045.5;

    double t = (jd - 2451545.0) / 36525.0;

    /* Mean anomaly M (degrees) */
    double M = fmod(357.52911 + 35999.05029 * t - 0.0001537 * t * t, 360.0);
    if (M < 0) M += 360.0;
    double M_rad = M * deg;

    /* Geometric mean longitude L0 */
    double l0 = fmod(280.46646 + 36000.76983 * t + 0.0003032 * t * t, 360.0);
    if (l0 < 0) l0 += 360.0;

    /* Equation of center C */
    double C = (1.914602 - 0.004817 * t - 0.000014 * t * t) * sin(M_rad) +
               (0.019993 - 0.000101 * t) * sin(2 * M_rad) +
               0.000289 * sin(3 * M_rad);

    /* Sun's true longitude */
    double sun_lon = l0 + C;

    /* Nutation correction */
    double omega = fmod(125.04 - 1934.136 * t, 360.0);
    if (omega < 0) omega += 360.0;
    double omega_rad = omega * deg;

    /* Apparent solar longitude */
    double lambda = sun_lon - 0.00569 - 0.00478 * sin(omega_rad);
    double lambda_rad = lambda * deg;

    /* Mean obliquity */
    double epsilon0 = 23.439291 - 0.013004 * t - 1.638e-7 * t * t + 5.036e-7 * t * t * t;
    double epsilon = (epsilon0 + 0.00256 * cos(omega_rad)) * deg;

    /* Solar declination */
    double sin_decl = sin(epsilon) * sin(lambda_rad);
    if (sin_decl > 1.0) sin_decl = 1.0;
    if (sin_decl < -1.0) sin_decl = -1.0;
    return asin(sin_decl) / deg;
}

/* ─── Public API ──────────────────────────────────────────────────────────── */

void pray_calc_input_init(PrayCalcInput *input) {
    memset(input, 0, sizeof(*input));
    input->method = CALC_METHOD_ISNA;
    input->madhab = MADHAB_SHAFI;
}

PrayCalcResult pray_calc_times(PrayCalcInput input) {
    PrayCalcResult result;
    memset(&result, 0, sizeof(result));

    /* Clamp method to valid range */
    int method = input.method;
    if (method < 0 || method >= CALC_METHOD_COUNT) method = CALC_METHOD_ISNA;
    const MethodAngles *angles = &METHOD_ANGLES[method];

    /* Run SPA for the given date at local noon */
    SpaInput spa_in;
    spa_input_init(&spa_in);
    spa_in.year = input.year;
    spa_in.month = input.month;
    spa_in.day = input.day;
    spa_in.hour = 12;
    spa_in.minute = 0;
    spa_in.second = 0.0;
    spa_in.timezone = input.timezone;
    spa_in.latitude = input.latitude;
    spa_in.longitude = input.longitude;
    spa_in.elevation = input.elevation;

    SpaResult spa_out;
    int rc = spa_calculate(&spa_in, &spa_out);
    if (rc != 0) {
        /* SPA failed, set everything to NAN */
        result.fajr = result.sunrise = result.dhuhr = NAN;
        result.asr = result.maghrib = result.isha = NAN;
        result.qibla_bearing = qibla_bearing(input.latitude, input.longitude);
        return result;
    }

    /* Basic times from SPA */
    double sunrise_time = spa_out.sunrise;
    double solar_noon = spa_out.solar_noon;
    double sunset_time = spa_out.sunset;

    /* Dhuhr: solar noon + 2 minutes safety margin */
    double dhuhr_time = solar_noon + 2.0 / 60.0;

    /* Maghrib = sunset */
    double maghrib_time = sunset_time;

    /* Fajr: use custom angle for the method's Fajr depression */
    double fajr_zenith = 90.0 + angles->fajr_angle;
    SpaAnglesResult fajr_angle_result = spa_custom_angle(
        fajr_zenith, solar_noon, spa_out.declination, input.latitude);
    double fajr_time = fajr_angle_result.sunrise;

    /* Isha: either angle-based or offset-based */
    double isha_time;
    if (angles->isha_angle > 0) {
        double isha_zenith = 90.0 + angles->isha_angle;
        SpaAnglesResult isha_angle_result = spa_custom_angle(
            isha_zenith, solar_noon, spa_out.declination, input.latitude);
        isha_time = isha_angle_result.sunset;
    } else {
        /* Umm al-Qura: Isha = Maghrib + offset minutes */
        isha_time = maghrib_time + angles->isha_offset / 60.0;
    }

    /* Asr: compute using Meeus declination (same approach as Dart) */
    double decl = solar_declination_meeus(input.year, input.month, input.day);
    double asr_time = compute_asr(solar_noon, input.latitude, decl,
                                   input.madhab == MADHAB_HANAFI);

    /* Qibla bearing */
    double qibla = qibla_bearing(input.latitude, input.longitude);

    result.fajr = fajr_time;
    result.sunrise = sunrise_time;
    result.dhuhr = dhuhr_time;
    result.asr = asr_time;
    result.maghrib = maghrib_time;
    result.isha = isha_time;
    result.qibla_bearing = qibla;

    return result;
}

char *pray_calc_format_time(double hours, char *buf, int buf_size) {
    if (buf_size < 6) {
        if (buf_size > 0) buf[0] = '\0';
        return buf;
    }
    if (!isfinite(hours) || hours < 0 || hours >= 24.0) {
        snprintf(buf, buf_size, "--:--");
        return buf;
    }
    int h = (int)floor(hours);
    int m = (int)round((hours - h) * 60.0);
    if (m >= 60) { h++; m = 0; }
    if (h >= 24) h = 0;
    snprintf(buf, buf_size, "%02d:%02d", h, m);
    return buf;
}
