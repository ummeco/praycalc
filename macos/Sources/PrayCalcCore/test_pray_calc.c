/**
 * test_pray_calc.c — Validation test for the C prayer time engine.
 *
 * Tests prayer times for 10 reference cities across multiple calculation
 * methods and both Asr conventions. Validates that:
 *   - All prayer times are in expected ranges for each location
 *   - Prayer order is correct (Fajr < Sunrise < Dhuhr < Asr < Maghrib < Isha)
 *   - Qibla bearings are within expected ranges
 *   - Hanafi Asr is later than Shafi'i Asr
 *
 * Build: make test (or gcc -std=c99 -O2 -lm -o test_pray_calc ...)
 * Run:   ./test_pray_calc
 */

#include <stdio.h>
#include <stdlib.h>
#include <math.h>
#include <string.h>
#include "pray_calc.h"
#include "qibla.h"
#include "nrel_spa.h"

#define ARRAY_LEN(a) (sizeof(a) / sizeof((a)[0]))

/* ─── Test infrastructure ─────────────────────────────────────────────────── */

static int tests_run = 0;
static int tests_passed = 0;
static int tests_failed = 0;

static void check(int condition, const char *test_name) {
    tests_run++;
    if (condition) {
        tests_passed++;
    } else {
        tests_failed++;
        printf("  FAIL: %s\n", test_name);
    }
}

/* ─── Reference test cities ───────────────────────────────────────────────── */

typedef struct {
    const char *name;
    double lat;
    double lng;
    double tz;           /* UTC offset */
    double elevation;
    /* Expected Fajr range (local 24h) */
    double fajr_min, fajr_max;
    /* Expected Dhuhr range */
    double dhuhr_min, dhuhr_max;
    /* Expected Maghrib range */
    double maghrib_min, maghrib_max;
    /* Expected Qibla bearing range */
    double qibla_min, qibla_max;
} TestCity;

/* Test date: 2024-03-20 (near spring equinox for balanced day/night) */
#define TEST_YEAR  2024
#define TEST_MONTH 3
#define TEST_DAY   20

static const TestCity TEST_CITIES[] = {
    /* Mecca, Saudi Arabia */
    { "Mecca",     21.4225,  39.8262,  3.0, 277,
      4.0, 6.0,    11.5, 13.0,    17.5, 19.0,    0.0, 360.0 },

    /* New York, USA */
    { "New York",  40.7128, -74.0060, -4.0, 10,
      4.5, 6.5,    11.5, 13.5,    18.5, 20.0,    50.0, 70.0 },

    /* London, UK */
    { "London",    51.5074,  -0.1278,  0.0, 11,
      3.5, 6.5,    11.5, 13.0,    17.5, 19.5,    115.0, 125.0 },

    /* Tokyo, Japan */
    { "Tokyo",     35.6762, 139.6503,  9.0, 40,
      3.5, 5.5,    11.0, 12.5,    17.0, 18.5,    290.0, 300.0 },

    /* Sydney, Australia */
    { "Sydney",   -33.8688, 151.2093, 11.0, 58,
      3.5, 6.0,    11.5, 13.5,    17.5, 19.5,    275.0, 285.0 },

    /* Cairo, Egypt */
    { "Cairo",     30.0444,  31.2357,  2.0, 75,
      3.5, 5.5,    11.0, 13.0,    17.0, 19.0,    130.0, 140.0 },

    /* Istanbul, Turkey */
    { "Istanbul",  41.0082,  28.9784,  3.0, 39,
      3.5, 6.5,    11.5, 13.5,    17.5, 20.0,    147.0, 157.0 },

    /* Jakarta, Indonesia */
    { "Jakarta",   -6.2088, 106.8456,  7.0, 8,
      3.5, 5.5,    11.0, 12.5,    17.0, 18.5,    293.0, 298.0 },

    /* Karachi, Pakistan */
    { "Karachi",   24.8607,  67.0011,  5.0, 10,
      4.0, 6.0,    11.5, 13.0,    17.5, 19.0,    267.0, 272.0 },

    /* Lagos, Nigeria */
    { "Lagos",      6.5244,   3.3792,  1.0, 41,
      4.0, 6.0,    11.5, 13.5,    17.5, 19.5,    57.0, 65.0 },
};

/* ─── Test: prayer times for all cities ───────────────────────────────────── */

static void test_city_prayer_times(void) {
    printf("\n=== Prayer times for reference cities (2024-03-20, ISNA) ===\n\n");

    for (int i = 0; i < (int)ARRAY_LEN(TEST_CITIES); i++) {
        const TestCity *city = &TEST_CITIES[i];
        char desc[256];

        PrayCalcInput input;
        pray_calc_input_init(&input);
        input.latitude = city->lat;
        input.longitude = city->lng;
        input.year = TEST_YEAR;
        input.month = TEST_MONTH;
        input.day = TEST_DAY;
        input.timezone = city->tz;
        input.elevation = city->elevation;
        input.method = CALC_METHOD_ISNA;
        input.madhab = MADHAB_SHAFI;

        PrayCalcResult r = pray_calc_times(input);

        char fajr_s[8], rise_s[8], dhuhr_s[8], asr_s[8], magh_s[8], isha_s[8];
        pray_calc_format_time(r.fajr, fajr_s, sizeof(fajr_s));
        pray_calc_format_time(r.sunrise, rise_s, sizeof(rise_s));
        pray_calc_format_time(r.dhuhr, dhuhr_s, sizeof(dhuhr_s));
        pray_calc_format_time(r.asr, asr_s, sizeof(asr_s));
        pray_calc_format_time(r.maghrib, magh_s, sizeof(magh_s));
        pray_calc_format_time(r.isha, isha_s, sizeof(isha_s));

        printf("%-12s  Fajr=%s  Rise=%s  Dhuhr=%s  Asr=%s  Magh=%s  Isha=%s  Qibla=%.1f\n",
               city->name, fajr_s, rise_s, dhuhr_s, asr_s, magh_s, isha_s, r.qibla_bearing);

        /* Check all times are finite */
        snprintf(desc, sizeof(desc), "%s: all times finite", city->name);
        check(isfinite(r.fajr) && isfinite(r.sunrise) && isfinite(r.dhuhr) &&
              isfinite(r.asr) && isfinite(r.maghrib) && isfinite(r.isha), desc);

        /* Check prayer order: Fajr < Sunrise < Dhuhr < Asr < Maghrib < Isha */
        snprintf(desc, sizeof(desc), "%s: prayer order correct", city->name);
        check(r.fajr < r.sunrise && r.sunrise < r.dhuhr &&
              r.dhuhr < r.asr && r.asr < r.maghrib && r.maghrib < r.isha, desc);

        /* Check Fajr range */
        snprintf(desc, sizeof(desc), "%s: Fajr in range [%.1f, %.1f] (got %.2f)",
                 city->name, city->fajr_min, city->fajr_max, r.fajr);
        check(r.fajr >= city->fajr_min && r.fajr <= city->fajr_max, desc);

        /* Check Dhuhr range */
        snprintf(desc, sizeof(desc), "%s: Dhuhr in range [%.1f, %.1f] (got %.2f)",
                 city->name, city->dhuhr_min, city->dhuhr_max, r.dhuhr);
        check(r.dhuhr >= city->dhuhr_min && r.dhuhr <= city->dhuhr_max, desc);

        /* Check Maghrib range */
        snprintf(desc, sizeof(desc), "%s: Maghrib in range [%.1f, %.1f] (got %.2f)",
                 city->name, city->maghrib_min, city->maghrib_max, r.maghrib);
        check(r.maghrib >= city->maghrib_min && r.maghrib <= city->maghrib_max, desc);

        /* Check Qibla bearing */
        snprintf(desc, sizeof(desc), "%s: Qibla in range [%.1f, %.1f] (got %.2f)",
                 city->name, city->qibla_min, city->qibla_max, r.qibla_bearing);
        check(r.qibla_bearing >= city->qibla_min && r.qibla_bearing <= city->qibla_max, desc);
    }
}

/* ─── Test: all calculation methods ───────────────────────────────────────── */

static void test_all_methods(void) {
    printf("\n=== All calculation methods (New York, 2024-03-20) ===\n\n");

    const char *method_names[] = {
        "ISNA", "MWL", "Egypt", "Umm al-Qura", "Tehran", "Karachi"
    };

    for (int m = 0; m < CALC_METHOD_COUNT; m++) {
        PrayCalcInput input;
        pray_calc_input_init(&input);
        input.latitude = 40.7128;
        input.longitude = -74.0060;
        input.year = TEST_YEAR;
        input.month = TEST_MONTH;
        input.day = TEST_DAY;
        input.timezone = -4.0;
        input.method = m;
        input.madhab = MADHAB_SHAFI;

        PrayCalcResult r = pray_calc_times(input);

        char fajr_s[8], isha_s[8];
        pray_calc_format_time(r.fajr, fajr_s, sizeof(fajr_s));
        pray_calc_format_time(r.isha, isha_s, sizeof(isha_s));

        printf("  %-12s  Fajr=%s  Isha=%s\n", method_names[m], fajr_s, isha_s);

        char desc[256];
        snprintf(desc, sizeof(desc), "Method %s: all times finite", method_names[m]);
        check(isfinite(r.fajr) && isfinite(r.isha), desc);

        snprintf(desc, sizeof(desc), "Method %s: prayer order correct", method_names[m]);
        check(r.fajr < r.sunrise && r.sunrise < r.dhuhr &&
              r.dhuhr < r.asr && r.asr < r.maghrib && r.maghrib < r.isha, desc);
    }
}

/* ─── Test: Hanafi vs Shafi'i Asr ─────────────────────────────────────────── */

static void test_hanafi_vs_shafii(void) {
    printf("\n=== Hanafi vs Shafi'i Asr (Cairo, 2024-03-20) ===\n\n");

    PrayCalcInput shafi_input;
    pray_calc_input_init(&shafi_input);
    shafi_input.latitude = 30.0444;
    shafi_input.longitude = 31.2357;
    shafi_input.year = TEST_YEAR;
    shafi_input.month = TEST_MONTH;
    shafi_input.day = TEST_DAY;
    shafi_input.timezone = 2.0;
    shafi_input.method = CALC_METHOD_EGYPT;
    shafi_input.madhab = MADHAB_SHAFI;

    PrayCalcInput hanafi_input = shafi_input;
    hanafi_input.madhab = MADHAB_HANAFI;

    PrayCalcResult shafi_r = pray_calc_times(shafi_input);
    PrayCalcResult hanafi_r = pray_calc_times(hanafi_input);

    char shafi_asr[8], hanafi_asr[8];
    pray_calc_format_time(shafi_r.asr, shafi_asr, sizeof(shafi_asr));
    pray_calc_format_time(hanafi_r.asr, hanafi_asr, sizeof(hanafi_asr));

    printf("  Shafi'i Asr = %s  (%.4f hrs)\n", shafi_asr, shafi_r.asr);
    printf("  Hanafi  Asr = %s  (%.4f hrs)\n", hanafi_asr, hanafi_r.asr);

    check(hanafi_r.asr > shafi_r.asr, "Hanafi Asr is later than Shafi'i Asr");

    /* Non-Asr times should be identical */
    check(fabs(shafi_r.fajr - hanafi_r.fajr) < 0.001,
          "Fajr same for both madhabs");
    check(fabs(shafi_r.dhuhr - hanafi_r.dhuhr) < 0.001,
          "Dhuhr same for both madhabs");
    check(fabs(shafi_r.maghrib - hanafi_r.maghrib) < 0.001,
          "Maghrib same for both madhabs");
}

/* ─── Test: Qibla bearing ─────────────────────────────────────────────────── */

static void test_qibla(void) {
    printf("\n=== Qibla bearing tests ===\n\n");

    /* From Mecca itself, bearing is technically undefined but should not crash */
    double mecca_qibla = qibla_bearing(21.4225, 39.8262);
    printf("  Mecca to Ka'bah:   %.2f (any value ok, no crash)\n", mecca_qibla);
    check(isfinite(mecca_qibla), "Mecca qibla is finite");

    /* New York: should be approximately 58-59 degrees (NE) */
    double ny_qibla = qibla_bearing(40.7128, -74.0060);
    printf("  New York to Ka'bah: %.2f (expected ~58-59)\n", ny_qibla);
    check(ny_qibla >= 55.0 && ny_qibla <= 62.0, "NY qibla in range [55, 62]");

    /* Sydney: should be approximately 277-279 degrees (WNW) */
    double syd_qibla = qibla_bearing(-33.8688, 151.2093);
    printf("  Sydney to Ka'bah:   %.2f (expected ~277-279)\n", syd_qibla);
    check(syd_qibla >= 275.0 && syd_qibla <= 285.0, "Sydney qibla in range [275, 285]");

    /* Distance from NY to Ka'bah: approximately 10,300 km */
    double ny_dist = qibla_distance_km(40.7128, -74.0060, 21.4225, 39.8262);
    printf("  New York to Ka'bah: %.0f km (expected ~10200-10400)\n", ny_dist);
    check(ny_dist >= 10000 && ny_dist <= 10500, "NY-Mecca distance in range");
}

/* ─── Test: SPA solar position ────────────────────────────────────────────── */

static void test_spa_basic(void) {
    printf("\n=== SPA basic solar position test ===\n\n");

    SpaInput spa_in;
    spa_input_init(&spa_in);
    spa_in.year = 2024;
    spa_in.month = 6;
    spa_in.day = 21; /* Summer solstice */
    spa_in.hour = 12;
    spa_in.minute = 0;
    spa_in.second = 0.0;
    spa_in.timezone = 0.0;
    spa_in.latitude = 0.0;   /* Equator */
    spa_in.longitude = 0.0;

    SpaResult spa_out;
    int rc = spa_calculate(&spa_in, &spa_out);

    printf("  Equator noon summer solstice:\n");
    printf("    Zenith:   %.4f (expected ~66-67, tropic tilt)\n", spa_out.zenith);
    printf("    Azimuth:  %.4f\n", spa_out.azimuth);
    printf("    Sunrise:  %.4f hrs\n", spa_out.sunrise);
    printf("    Noon:     %.4f hrs\n", spa_out.solar_noon);
    printf("    Sunset:   %.4f hrs\n", spa_out.sunset);

    check(rc == 0, "SPA returns success");
    check(spa_out.zenith > 0 && spa_out.zenith < 90, "Zenith in valid range");
    check(spa_out.sunrise > 4.0 && spa_out.sunrise < 8.0, "Sunrise in reasonable range");
    check(spa_out.solar_noon > 11.0 && spa_out.solar_noon < 13.0, "Noon in reasonable range");
    check(spa_out.sunset > 16.0 && spa_out.sunset < 20.0, "Sunset in reasonable range");
}

/* ─── Test: format_time ───────────────────────────────────────────────────── */

static void test_format_time(void) {
    printf("\n=== Format time tests ===\n\n");

    char buf[8];

    pray_calc_format_time(5.5, buf, sizeof(buf));
    printf("  5.5 hrs -> %s (expected 05:30)\n", buf);
    check(strcmp(buf, "05:30") == 0, "5.5 -> 05:30");

    pray_calc_format_time(12.0, buf, sizeof(buf));
    printf("  12.0 hrs -> %s (expected 12:00)\n", buf);
    check(strcmp(buf, "12:00") == 0, "12.0 -> 12:00");

    pray_calc_format_time(0.0, buf, sizeof(buf));
    printf("  0.0 hrs -> %s (expected 00:00)\n", buf);
    check(strcmp(buf, "00:00") == 0, "0.0 -> 00:00");

    pray_calc_format_time(23.75, buf, sizeof(buf));
    printf("  23.75 hrs -> %s (expected 23:45)\n", buf);
    check(strcmp(buf, "23:45") == 0, "23.75 -> 23:45");

    pray_calc_format_time(NAN, buf, sizeof(buf));
    printf("  NAN -> %s (expected --:--)\n", buf);
    check(strcmp(buf, "--:--") == 0, "NAN -> --:--");

    pray_calc_format_time(-1.0, buf, sizeof(buf));
    printf("  -1.0 -> %s (expected --:--)\n", buf);
    check(strcmp(buf, "--:--") == 0, "-1.0 -> --:--");
}

/* ─── Test: seasonal variation ────────────────────────────────────────────── */

static void test_seasonal_variation(void) {
    printf("\n=== Seasonal variation (London) ===\n\n");

    PrayCalcInput input;
    pray_calc_input_init(&input);
    input.latitude = 51.5074;
    input.longitude = -0.1278;
    input.timezone = 0.0;
    input.method = CALC_METHOD_MWL;
    input.madhab = MADHAB_SHAFI;

    /* Summer solstice */
    input.year = 2024; input.month = 6; input.day = 21;
    PrayCalcResult summer = pray_calc_times(input);

    /* Winter solstice */
    input.month = 12; input.day = 21;
    PrayCalcResult winter = pray_calc_times(input);

    char s_fajr[8], s_magh[8], w_fajr[8], w_magh[8];
    pray_calc_format_time(summer.fajr, s_fajr, sizeof(s_fajr));
    pray_calc_format_time(summer.maghrib, s_magh, sizeof(s_magh));
    pray_calc_format_time(winter.fajr, w_fajr, sizeof(w_fajr));
    pray_calc_format_time(winter.maghrib, w_magh, sizeof(w_magh));

    printf("  Summer (Jun 21): Fajr=%s  Maghrib=%s\n", s_fajr, s_magh);
    printf("  Winter (Dec 21): Fajr=%s  Maghrib=%s\n", w_fajr, w_magh);

    /* At 51.5N with MWL's 18-degree Fajr angle, summer Fajr may be NaN
       (sun never reaches 18 degrees below horizon). That's correct behavior.
       If Fajr IS computable in both, summer should be earlier. */
    if (isfinite(summer.fajr) && isfinite(winter.fajr)) {
        check(summer.fajr < winter.fajr, "Summer Fajr earlier than winter in London");
    } else {
        /* NaN Fajr in summer at high latitude with deep angle is expected */
        check(!isfinite(summer.fajr), "Summer Fajr is NaN at high lat with MWL 18deg (expected)");
    }

    /* Summer Maghrib should be later than winter Maghrib */
    check(summer.maghrib > winter.maghrib, "Summer Maghrib later than winter in London");
}

/* ─── Main ────────────────────────────────────────────────────────────────── */

int main(void) {
    printf("PrayCalc C Core — Test Suite\n");
    printf("=============================\n");

    test_spa_basic();
    test_city_prayer_times();
    test_all_methods();
    test_hanafi_vs_shafii();
    test_qibla();
    test_format_time();
    test_seasonal_variation();

    printf("\n=============================\n");
    printf("Results: %d passed, %d failed, %d total\n",
           tests_passed, tests_failed, tests_run);

    return tests_failed > 0 ? 1 : 0;
}
