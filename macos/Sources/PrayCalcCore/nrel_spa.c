/**
 * nrel_spa.c — NREL Solar Position Algorithm (SPA) in C99.
 *
 * Direct port from the pray_calc_dart Dart implementation (spa.dart),
 * which is itself a port of the nrel-spa JavaScript library (spa.js v2.0.1).
 *
 * Reference: Reda, I. and Andreas, A. (2004). Solar Position Algorithm for
 * Solar Radiation Applications. NREL/TP-560-34302.
 */

#include "nrel_spa.h"
#include <math.h>
#include <float.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

#define SUN_RADIUS 0.26667

/* ─── Earth Periodic Term Tables ─────────────────────────────────────────── */

/* L0 — 64 terms */
static const double L0_TERMS[][3] = {
    {175347046.0, 0, 0},
    {3341656.0, 4.6692568, 6283.07585},
    {34894.0, 4.6261, 12566.1517},
    {3497.0, 2.7441, 5753.3849},
    {3418.0, 2.8289, 3.5231},
    {3136.0, 3.6277, 77713.7715},
    {2676.0, 4.4181, 7860.4194},
    {2343.0, 6.1352, 3930.2097},
    {1324.0, 0.7425, 11506.7698},
    {1273.0, 2.0371, 529.691},
    {1199.0, 1.1096, 1577.3435},
    {990, 5.233, 5884.927},
    {902, 2.045, 26.298},
    {857, 3.508, 398.149},
    {780, 1.179, 5223.694},
    {753, 2.533, 5507.553},
    {505, 4.583, 18849.228},
    {492, 4.205, 775.523},
    {357, 2.92, 0.067},
    {317, 5.849, 11790.629},
    {284, 1.899, 796.298},
    {271, 0.315, 10977.079},
    {243, 0.345, 5486.778},
    {206, 4.806, 2544.314},
    {205, 1.869, 5573.143},
    {202, 2.458, 6069.777},
    {156, 0.833, 213.299},
    {132, 3.411, 2942.463},
    {126, 1.083, 20.775},
    {115, 0.645, 0.98},
    {103, 0.636, 4694.003},
    {102, 0.976, 15720.839},
    {102, 4.267, 7.114},
    {99, 6.21, 2146.17},
    {98, 0.68, 155.42},
    {86, 5.98, 161000.69},
    {85, 1.3, 6275.96},
    {85, 3.67, 71430.7},
    {80, 1.81, 17260.15},
    {79, 3.04, 12036.46},
    {75, 1.76, 5088.63},
    {74, 3.5, 3154.69},
    {74, 4.68, 801.82},
    {70, 0.83, 9437.76},
    {62, 3.98, 8827.39},
    {61, 1.82, 7084.9},
    {57, 2.78, 6286.6},
    {56, 4.39, 14143.5},
    {56, 3.47, 6279.55},
    {52, 0.19, 12139.55},
    {52, 1.33, 1748.02},
    {51, 0.28, 5856.48},
    {49, 0.49, 1194.45},
    {41, 5.37, 8429.24},
    {41, 2.4, 19651.05},
    {39, 6.17, 10447.39},
    {37, 6.04, 10213.29},
    {37, 2.57, 1059.38},
    {36, 1.71, 2352.87},
    {36, 1.78, 6812.77},
    {33, 0.59, 17789.85},
    {30, 0.44, 83996.85},
    {30, 2.74, 1349.87},
    {25, 3.16, 4690.48},
};
#define L0_COUNT 64

/* L1 — 34 terms */
static const double L1_TERMS[][3] = {
    {628331966747.0, 0, 0},
    {206059.0, 2.678235, 6283.07585},
    {4303.0, 2.6351, 12566.1517},
    {425.0, 1.59, 3.523},
    {119.0, 5.796, 26.298},
    {109.0, 2.966, 1577.344},
    {93, 2.59, 18849.23},
    {72, 1.14, 529.69},
    {68, 1.87, 398.15},
    {67, 4.41, 5507.55},
    {59, 2.89, 5223.69},
    {56, 2.17, 155.42},
    {45, 0.4, 796.3},
    {36, 0.47, 775.52},
    {29, 2.65, 7.11},
    {21, 5.34, 0.98},
    {19, 1.85, 5486.78},
    {19, 4.97, 213.3},
    {17, 2.99, 6275.96},
    {16, 0.03, 2544.31},
    {16, 1.43, 2146.17},
    {15, 1.21, 10977.08},
    {12, 2.83, 1748.02},
    {12, 3.26, 5088.63},
    {12, 5.27, 1194.45},
    {12, 2.08, 4694},
    {11, 0.77, 553.57},
    {10, 1.3, 6286.6},
    {10, 4.24, 1349.87},
    {9, 2.7, 242.73},
    {9, 5.64, 951.72},
    {8, 5.3, 2352.87},
    {6, 2.65, 9437.76},
    {6, 4.67, 4690.48},
};
#define L1_COUNT 34

/* L2 — 20 terms */
static const double L2_TERMS[][3] = {
    {52919.0, 0, 0},
    {8720.0, 1.0721, 6283.0758},
    {309.0, 0.867, 12566.152},
    {27, 0.05, 3.52},
    {16, 5.19, 26.3},
    {16, 3.68, 155.42},
    {10, 0.76, 18849.23},
    {9, 2.06, 77713.77},
    {7, 0.83, 775.52},
    {5, 4.66, 1577.34},
    {4, 1.03, 7.11},
    {4, 3.44, 5573.14},
    {3, 5.14, 796.3},
    {3, 6.05, 5507.55},
    {3, 1.19, 242.73},
    {3, 6.12, 529.69},
    {3, 0.31, 398.15},
    {3, 2.28, 553.57},
    {2, 4.38, 5223.69},
    {2, 3.75, 0.98},
};
#define L2_COUNT 20

/* L3 — 7 terms */
static const double L3_TERMS[][3] = {
    {289.0, 5.844, 6283.076},
    {35, 0, 0},
    {17, 5.49, 12566.15},
    {3, 5.2, 155.42},
    {1, 4.72, 3.52},
    {1, 5.3, 18849.23},
    {1, 5.97, 242.73},
};
#define L3_COUNT 7

/* L4 — 3 terms */
static const double L4_TERMS[][3] = {
    {114.0, 3.142, 0},
    {8, 4.13, 6283.08},
    {1, 3.84, 12566.15},
};
#define L4_COUNT 3

/* L5 — 1 term */
static const double L5_TERMS[][3] = {
    {1, 3.14, 0},
};
#define L5_COUNT 1

/* B0 — 5 terms */
static const double B0_TERMS[][3] = {
    {280.0, 3.199, 84334.662},
    {102.0, 5.422, 5507.553},
    {80, 3.88, 5223.69},
    {44, 3.7, 2352.87},
    {32, 4, 1577.34},
};
#define B0_COUNT 5

/* B1 — 2 terms */
static const double B1_TERMS[][3] = {
    {9, 3.9, 5507.55},
    {6, 1.73, 5223.69},
};
#define B1_COUNT 2

/* R0 — 40 terms */
static const double R0_TERMS[][3] = {
    {100013989.0, 0, 0},
    {1670700.0, 3.0984635, 6283.07585},
    {13956.0, 3.05525, 12566.1517},
    {3084.0, 5.1985, 77713.7715},
    {1628.0, 1.1739, 5753.3849},
    {1576.0, 2.8469, 7860.4194},
    {925.0, 5.453, 11506.77},
    {542.0, 4.564, 3930.21},
    {472.0, 3.661, 5884.927},
    {346.0, 0.964, 5507.553},
    {329.0, 5.9, 5223.694},
    {307.0, 0.299, 5573.143},
    {243.0, 4.273, 11790.629},
    {212.0, 5.847, 1577.344},
    {186.0, 5.022, 10977.079},
    {175.0, 3.012, 18849.228},
    {110.0, 5.055, 5486.778},
    {98, 0.89, 6069.78},
    {86, 5.69, 15720.84},
    {86, 1.27, 161000.69},
    {65, 0.27, 17260.15},
    {63, 0.92, 529.69},
    {57, 2.01, 83996.85},
    {56, 5.24, 71430.7},
    {49, 3.25, 2544.31},
    {47, 2.58, 775.52},
    {45, 5.54, 9437.76},
    {43, 6.01, 6275.96},
    {39, 5.36, 4694},
    {38, 2.39, 8827.39},
    {37, 0.83, 19651.05},
    {37, 4.9, 12139.55},
    {36, 1.67, 12036.46},
    {35, 1.84, 2942.46},
    {33, 0.24, 7084.9},
    {32, 0.18, 5088.63},
    {32, 1.78, 398.15},
    {28, 1.21, 6286.6},
    {28, 1.9, 6279.55},
    {26, 4.59, 10447.39},
};
#define R0_COUNT 40

/* R1 — 10 terms */
static const double R1_TERMS[][3] = {
    {103019.0, 1.10749, 6283.07585},
    {1721.0, 1.0644, 12566.1517},
    {702.0, 3.142, 0},
    {32, 1.02, 18849.23},
    {31, 2.84, 5507.55},
    {25, 1.32, 5223.69},
    {18, 1.42, 1577.34},
    {10, 5.91, 10977.08},
    {9, 1.42, 6275.96},
    {9, 0.27, 5486.78},
};
#define R1_COUNT 10

/* R2 — 6 terms */
static const double R2_TERMS[][3] = {
    {4359.0, 5.7846, 6283.0758},
    {124.0, 5.579, 12566.152},
    {12, 3.14, 0},
    {9, 3.63, 77713.77},
    {6, 1.87, 5573.14},
    {3, 5.47, 18849.23},
};
#define R2_COUNT 6

/* R3 — 2 terms */
static const double R3_TERMS[][3] = {
    {145.0, 4.273, 6283.076},
    {7, 3.92, 12566.15},
};
#define R3_COUNT 2

/* R4 — 1 term */
static const double R4_TERMS[][3] = {
    {4, 2.56, 6283.08},
};
#define R4_COUNT 1

/* Nutation Y terms [x0, x1, x2, x3, x4] */
static const int Y_TERMS[63][5] = {
    {0, 0, 0, 0, 1},
    {-2, 0, 0, 2, 2},
    {0, 0, 0, 2, 2},
    {0, 0, 0, 0, 2},
    {0, 1, 0, 0, 0},
    {0, 0, 1, 0, 0},
    {-2, 1, 0, 2, 2},
    {0, 0, 0, 2, 1},
    {0, 0, 1, 2, 2},
    {-2, -1, 0, 2, 2},
    {-2, 0, 1, 0, 0},
    {-2, 0, 0, 2, 1},
    {0, 0, -1, 2, 2},
    {2, 0, 0, 0, 0},
    {0, 0, 1, 0, 1},
    {2, 0, -1, 2, 2},
    {0, 0, -1, 0, 1},
    {0, 0, 1, 2, 1},
    {-2, 0, 2, 0, 0},
    {0, 0, -2, 2, 1},
    {2, 0, 0, 2, 2},
    {0, 0, 2, 2, 2},
    {0, 0, 2, 0, 0},
    {-2, 0, 1, 2, 2},
    {0, 0, 0, 2, 0},
    {-2, 0, 0, 2, 0},
    {0, 0, -1, 2, 1},
    {0, 2, 0, 0, 0},
    {2, 0, -1, 0, 1},
    {-2, 2, 0, 2, 2},
    {0, 1, 0, 0, 1},
    {-2, 0, 1, 0, 1},
    {0, -1, 0, 0, 1},
    {0, 0, 2, -2, 0},
    {2, 0, -1, 2, 1},
    {2, 0, 1, 2, 2},
    {0, 1, 0, 2, 2},
    {-2, 1, 1, 0, 0},
    {0, -1, 0, 2, 2},
    {2, 0, 0, 2, 1},
    {2, 0, 1, 0, 0},
    {-2, 0, 2, 2, 2},
    {-2, 0, 1, 2, 1},
    {2, 0, -2, 0, 1},
    {2, 0, 0, 0, 1},
    {0, -1, 1, 0, 0},
    {-2, -1, 0, 2, 1},
    {-2, 0, 0, 0, 1},
    {0, 0, 2, 2, 1},
    {-2, 0, 2, 0, 1},
    {-2, 1, 0, 2, 1},
    {0, 0, 1, -2, 0},
    {-1, 0, 1, 0, 0},
    {-2, 1, 0, 0, 0},
    {1, 0, 0, 0, 0},
    {0, 0, 1, 2, 0},
    {0, 0, -2, 2, 2},
    {-1, -1, 1, 0, 0},
    {0, 1, 1, 0, 0},
    {0, -1, 1, 2, 2},
    {2, -1, -1, 2, 2},
    {0, 0, 3, 2, 2},
    {2, -1, 0, 2, 2},
};

/* Nutation PE coefficients [psi_a, psi_b, eps_c, eps_d] */
static const double PE_TERMS[63][4] = {
    {-171996, -174.2, 92025, 8.9},
    {-13187, -1.6, 5736, -3.1},
    {-2274, -0.2, 977, -0.5},
    {2062, 0.2, -895, 0.5},
    {1426, -3.4, 54, -0.1},
    {712, 0.1, -7, 0},
    {-517, 1.2, 224, -0.6},
    {-386, -0.4, 200, 0},
    {-301, 0, 129, -0.1},
    {217, -0.5, -95, 0.3},
    {-158, 0, 0, 0},
    {129, 0.1, -70, 0},
    {123, 0, -53, 0},
    {63, 0, 0, 0},
    {63, 0.1, -33, 0},
    {-59, 0, 26, 0},
    {-58, -0.1, 32, 0},
    {-51, 0, 27, 0},
    {48, 0, 0, 0},
    {46, 0, -24, 0},
    {-38, 0, 16, 0},
    {-31, 0, 13, 0},
    {29, 0, 0, 0},
    {29, 0, -12, 0},
    {26, 0, 0, 0},
    {-22, 0, 0, 0},
    {21, 0, -10, 0},
    {17, -0.1, 0, 0},
    {16, 0, -8, 0},
    {-16, 0.1, 7, 0},
    {-15, 0, 9, 0},
    {-13, 0, 7, 0},
    {-12, 0, 6, 0},
    {11, 0, 0, 0},
    {-10, 0, 5, 0},
    {-8, 0, 3, 0},
    {7, 0, -3, 0},
    {-7, 0, 0, 0},
    {-7, 0, 3, 0},
    {-7, 0, 3, 0},
    {6, 0, 0, 0},
    {6, 0, -3, 0},
    {6, 0, -3, 0},
    {-6, 0, 3, 0},
    {-6, 0, 3, 0},
    {5, 0, 0, 0},
    {-5, 0, 3, 0},
    {-5, 0, 3, 0},
    {-5, 0, 3, 0},
    {4, 0, 0, 0},
    {4, 0, 0, 0},
    {4, 0, 0, 0},
    {-4, 0, 0, 0},
    {-4, 0, 0, 0},
    {-4, 0, 0, 0},
    {3, 0, 0, 0},
    {-3, 0, 0, 0},
    {-3, 0, 0, 0},
    {-3, 0, 0, 0},
    {-3, 0, 0, 0},
    {-3, 0, 0, 0},
    {-3, 0, 0, 0},
    {-3, 0, 0, 0},
};

/* ─── Internal SPA state ──────────────────────────────────────────────────── */

typedef struct {
    /* Inputs (copied from SpaInput) */
    int    year, month, day, hour, minute;
    double second, delta_ut1, delta_t, timezone;
    double longitude, latitude, elevation;
    double pressure, temperature;
    double slope, azm_rotation, atmos_refract;

    /* Intermediate */
    double jd, jc, jde, jce, jme;
    double l, b, r;
    double theta, beta;
    double x0, x1, x2, x3, x4;
    double del_psi, del_epsilon;
    double epsilon0, epsilon;
    double del_tau, lamda;
    double nu0, nu;
    double alpha, delta;
    double h;
    double xi, del_alpha, delta_prime, alpha_prime, h_prime;
    double e0, del_e, e;
    double eot;
    double srha, ssha, sta;

    /* Outputs */
    double zenith, azimuth_astro, azimuth, incidence;
    double suntransit, sunrise, sunset;
} SpaData;

/* ─── Math utilities ──────────────────────────────────────────────────────── */

static double deg2rad(double d) { return (M_PI / 180.0) * d; }
static double rad2deg(double r) { return (180.0 / M_PI) * r; }

static double limit_degrees(double d) {
    d /= 360.0;
    double limited = 360.0 * (d - floor(d));
    if (limited < 0) limited += 360.0;
    return limited;
}

static double limit_degrees180pm(double d) {
    d /= 360.0;
    double limited = 360.0 * (d - floor(d));
    if (limited < -180.0) limited += 360.0;
    else if (limited > 180.0) limited -= 360.0;
    return limited;
}

static double limit_degrees180(double d) {
    d /= 180.0;
    double limited = 180.0 * (d - floor(d));
    if (limited < 0) limited += 180.0;
    return limited;
}

static double limit_zero2one(double v) {
    double limited = v - floor(v);
    if (limited < 0) limited += 1.0;
    return limited;
}

static double limit_minutes(double minutes) {
    double limited = minutes;
    if (limited < -20.0) limited += 1440.0;
    else if (limited > 20.0) limited -= 1440.0;
    return limited;
}

static double third_order_polynomial(double a, double b, double c, double d, double x) {
    return ((a * x + b) + c) * x + d;
}

/* ─── Julian Date functions ───────────────────────────────────────────────── */

static double julian_day(int year, int month, int day, int hour, int minute,
                          double second, double dut1, double tz) {
    double day_decimal = day + (hour - tz + (minute + (second + dut1) / 60.0) / 60.0) / 24.0;
    int y = year, m = month;
    if (m < 3) { m += 12; y--; }
    double jd = floor(365.25 * (y + 4716.0)) + floor(30.6001 * (m + 1)) + day_decimal - 1524.5;
    if (jd > 2299160.0) {
        double a = floor(y / 100.0);
        jd += 2 - a + floor(a / 4.0);
    }
    return jd;
}

static double julian_century(double jd) { return (jd - 2451545.0) / 36525.0; }
static double julian_ephemeris_day(double jd, double dt) { return jd + dt / 86400.0; }
static double julian_ephemeris_century(double jde) { return (jde - 2451545.0) / 36525.0; }
static double julian_ephemeris_millennium(double jce) { return jce / 10.0; }

/* ─── Periodic term summation ─────────────────────────────────────────────── */

static double earth_periodic_term_summation(const double terms[][3], int count, double jme) {
    double sum = 0;
    for (int i = 0; i < count; i++) {
        sum += terms[i][0] * cos(terms[i][1] + terms[i][2] * jme);
    }
    return sum;
}

static double earth_values(const double *term_sum, int count, double jme) {
    double sum = 0;
    for (int i = 0; i < count; i++) {
        sum += term_sum[i] * pow(jme, i);
    }
    return sum / 1.0e8;
}

static double earth_heliocentric_longitude(double jme) {
    double sum[6];
    sum[0] = earth_periodic_term_summation(L0_TERMS, L0_COUNT, jme);
    sum[1] = earth_periodic_term_summation(L1_TERMS, L1_COUNT, jme);
    sum[2] = earth_periodic_term_summation(L2_TERMS, L2_COUNT, jme);
    sum[3] = earth_periodic_term_summation(L3_TERMS, L3_COUNT, jme);
    sum[4] = earth_periodic_term_summation(L4_TERMS, L4_COUNT, jme);
    sum[5] = earth_periodic_term_summation(L5_TERMS, L5_COUNT, jme);
    return limit_degrees(rad2deg(earth_values(sum, 6, jme)));
}

static double earth_heliocentric_latitude(double jme) {
    double sum[2];
    sum[0] = earth_periodic_term_summation(B0_TERMS, B0_COUNT, jme);
    sum[1] = earth_periodic_term_summation(B1_TERMS, B1_COUNT, jme);
    return rad2deg(earth_values(sum, 2, jme));
}

static double earth_radius_vector(double jme) {
    double sum[5];
    sum[0] = earth_periodic_term_summation(R0_TERMS, R0_COUNT, jme);
    sum[1] = earth_periodic_term_summation(R1_TERMS, R1_COUNT, jme);
    sum[2] = earth_periodic_term_summation(R2_TERMS, R2_COUNT, jme);
    sum[3] = earth_periodic_term_summation(R3_TERMS, R3_COUNT, jme);
    sum[4] = earth_periodic_term_summation(R4_TERMS, R4_COUNT, jme);
    return earth_values(sum, 5, jme);
}

static double geocentric_longitude(double l) {
    double theta = l + 180.0;
    if (theta >= 360.0) theta -= 360.0;
    return theta;
}

/* ─── X anomaly terms ─────────────────────────────────────────────────────── */

static double mean_elongation_moon_sun(double jce) {
    return third_order_polynomial(1.0/189474.0, -0.0019142, 445267.11148, 297.85036, jce);
}
static double mean_anomaly_sun(double jce) {
    return third_order_polynomial(-1.0/300000.0, -0.0001603, 35999.05034, 357.52772, jce);
}
static double mean_anomaly_moon(double jce) {
    return third_order_polynomial(1.0/56250.0, 0.0086972, 477198.867398, 134.96298, jce);
}
static double argument_latitude_moon(double jce) {
    return third_order_polynomial(1.0/327270.0, -0.0036825, 483202.017538, 93.27191, jce);
}
static double ascending_longitude_moon(double jce) {
    return third_order_polynomial(1.0/450000.0, 0.0020708, -1934.136261, 125.04452, jce);
}

/* ─── Nutation ────────────────────────────────────────────────────────────── */

static double xy_term_summation(int i, const double x[5]) {
    double sum = 0;
    for (int j = 0; j < 5; j++) {
        sum += x[j] * Y_TERMS[i][j];
    }
    return sum;
}

static void nutation_longitude_and_obliquity(double jce, const double x[5],
                                              double *del_psi, double *del_epsilon) {
    double sum_psi = 0, sum_epsilon = 0;
    for (int i = 0; i < 63; i++) {
        double xy_sum = deg2rad(xy_term_summation(i, x));
        sum_psi += (PE_TERMS[i][0] + jce * PE_TERMS[i][1]) * sin(xy_sum);
        sum_epsilon += (PE_TERMS[i][2] + jce * PE_TERMS[i][3]) * cos(xy_sum);
    }
    *del_psi = sum_psi / 36000000.0;
    *del_epsilon = sum_epsilon / 36000000.0;
}

static double ecliptic_mean_obliquity(double jme) {
    double u = jme / 10.0;
    return 84381.448 +
        u * (-4680.93 +
            u * (-1.55 +
                u * (1999.25 +
                    u * (-51.38 +
                        u * (-249.67 +
                            u * (-39.05 +
                                u * (7.12 +
                                    u * (27.87 + u * (5.79 + u * 2.45)))))))));
}

/* ─── Geocentric functions ────────────────────────────────────────────────── */

static double geocentric_right_ascension(double lamda, double epsilon, double beta) {
    double lamda_rad = deg2rad(lamda);
    double epsilon_rad = deg2rad(epsilon);
    return limit_degrees(rad2deg(atan2(
        sin(lamda_rad) * cos(epsilon_rad) - tan(deg2rad(beta)) * sin(epsilon_rad),
        cos(lamda_rad)
    )));
}

static double geocentric_declination(double beta, double epsilon, double lamda) {
    double beta_rad = deg2rad(beta);
    double epsilon_rad = deg2rad(epsilon);
    return rad2deg(asin(
        sin(beta_rad) * cos(epsilon_rad) +
        cos(beta_rad) * sin(epsilon_rad) * sin(deg2rad(lamda))
    ));
}

static double observer_hour_angle(double nu, double longitude, double alpha) {
    return limit_degrees(nu + longitude - alpha);
}

static void right_ascension_parallax_and_topocentric_dec(
    double latitude, double elevation, double xi, double h_angle,
    double delta, double *del_alpha, double *delta_prime) {
    double lat_rad = deg2rad(latitude);
    double xi_rad = deg2rad(xi);
    double h_rad = deg2rad(h_angle);
    double delta_rad = deg2rad(delta);
    double u = atan(0.99664719 * tan(lat_rad));
    double y = 0.99664719 * sin(u) + elevation * sin(lat_rad) / 6378140.0;
    double x = cos(u) + elevation * cos(lat_rad) / 6378140.0;
    double da_rad = atan2(
        -x * sin(xi_rad) * sin(h_rad),
        cos(delta_rad) - x * sin(xi_rad) * cos(h_rad)
    );
    *delta_prime = rad2deg(atan2(
        (sin(delta_rad) - y * sin(xi_rad)) * cos(da_rad),
        cos(delta_rad) - x * sin(xi_rad) * cos(h_rad)
    ));
    *del_alpha = rad2deg(da_rad);
}

static double topocentric_elevation_angle(double latitude, double delta_prime, double h_prime) {
    double lat_rad = deg2rad(latitude);
    double dp_rad = deg2rad(delta_prime);
    return rad2deg(asin(
        sin(lat_rad) * sin(dp_rad) + cos(lat_rad) * cos(dp_rad) * cos(deg2rad(h_prime))
    ));
}

static double atmospheric_refraction_correction(double pressure, double temperature,
                                                  double atmos_refract, double e0) {
    double del_e = 0;
    if (e0 >= -1.0 * (SUN_RADIUS + atmos_refract)) {
        del_e = (pressure / 1010.0) * (283.0 / (273.0 + temperature)) *
                1.02 / (60.0 * tan(deg2rad(e0 + 10.3 / (e0 + 5.11))));
    }
    return del_e;
}

static double topocentric_azimuth_angle_astro(double h_prime, double latitude, double delta_prime) {
    double hp_rad = deg2rad(h_prime);
    double lat_rad = deg2rad(latitude);
    return limit_degrees(rad2deg(atan2(
        sin(hp_rad),
        cos(hp_rad) * sin(lat_rad) - tan(deg2rad(delta_prime)) * cos(lat_rad)
    )));
}

/* ─── Sidereal time & sun mean longitude ──────────────────────────────────── */

static double greenwich_mean_sidereal_time(double jd, double jc) {
    return limit_degrees(280.46061837 +
        360.98564736629 * (jd - 2451545.0) +
        jc * jc * (0.000387933 - jc / 38710000.0));
}

static double sun_mean_longitude(double jme) {
    return limit_degrees(280.4664567 +
        jme * (360007.6982779 +
            jme * (0.03032028 +
                jme * (1.0/49931.0 + jme * (-1.0/15300.0 + jme * (-1.0/2000000.0))))));
}

static double eot_calc(double m, double alpha, double del_psi, double epsilon) {
    return limit_minutes(4.0 * (m - 0.0057183 - alpha + del_psi * cos(deg2rad(epsilon))));
}

/* ─── RTS (Rise/Transit/Set) ──────────────────────────────────────────────── */

static double approx_sun_transit_time(double alpha_zero, double longitude, double nu) {
    return (alpha_zero - longitude - nu) / 360.0;
}

static double sun_hour_angle_at_rise_set(double latitude, double delta_zero, double h0_prime) {
    double h0 = -99999;
    double lat_rad = deg2rad(latitude);
    double dz_rad = deg2rad(delta_zero);
    double arg = (sin(deg2rad(h0_prime)) - sin(lat_rad) * sin(dz_rad)) /
                 (cos(lat_rad) * cos(dz_rad));
    if (fabs(arg) <= 1.0) {
        h0 = limit_degrees180(rad2deg(acos(arg)));
    }
    return h0;
}

static void approx_sun_rise_and_set(double m_rts[3], double h0) {
    double h0_dfrac = h0 / 360.0;
    m_rts[1] = limit_zero2one(m_rts[0] - h0_dfrac); /* sunrise */
    m_rts[2] = limit_zero2one(m_rts[0] + h0_dfrac); /* sunset */
    m_rts[0] = limit_zero2one(m_rts[0]);             /* transit */
}

static double rts_alpha_delta_prime(const double ad[3], double n) {
    double a = ad[1] - ad[0];
    double b = ad[2] - ad[1];
    if (fabs(a) >= 2.0) a = limit_zero2one(a);
    if (fabs(b) >= 2.0) b = limit_zero2one(b);
    return ad[1] + n * (a + b + (b - a) * n) / 2.0;
}

static double rts_sun_altitude(double latitude, double delta_prime, double h_prime) {
    double lat_rad = deg2rad(latitude);
    double dp_rad = deg2rad(delta_prime);
    return rad2deg(asin(
        sin(lat_rad) * sin(dp_rad) + cos(lat_rad) * cos(dp_rad) * cos(deg2rad(h_prime))
    ));
}

static double sun_rise_and_set(const double m_rts[3], const double h_rts[3],
                                const double delta_prime[3], double latitude,
                                const double h_prime[3], double h0_prime, int sun) {
    return m_rts[sun] +
        (h_rts[sun] - h0_prime) /
        (360.0 * cos(deg2rad(delta_prime[sun])) * cos(deg2rad(latitude)) *
         sin(deg2rad(h_prime[sun])));
}

static double dayfrac_to_local_hr(double dayfrac, double timezone) {
    return 24.0 * limit_zero2one(dayfrac + timezone / 24.0);
}

/* ─── Core geocentric calculation ─────────────────────────────────────────── */

static void calculate_geocentric_sun_ra_and_dec(SpaData *spa) {
    spa->jc  = julian_century(spa->jd);
    spa->jde = julian_ephemeris_day(spa->jd, spa->delta_t);
    spa->jce = julian_ephemeris_century(spa->jde);
    spa->jme = julian_ephemeris_millennium(spa->jce);

    spa->l = earth_heliocentric_longitude(spa->jme);
    spa->b = earth_heliocentric_latitude(spa->jme);
    spa->r = earth_radius_vector(spa->jme);

    spa->theta = geocentric_longitude(spa->l);
    spa->beta  = -spa->b;

    double x[5];
    x[0] = spa->x0 = mean_elongation_moon_sun(spa->jce);
    x[1] = spa->x1 = mean_anomaly_sun(spa->jce);
    x[2] = spa->x2 = mean_anomaly_moon(spa->jce);
    x[3] = spa->x3 = argument_latitude_moon(spa->jce);
    x[4] = spa->x4 = ascending_longitude_moon(spa->jce);

    nutation_longitude_and_obliquity(spa->jce, x, &spa->del_psi, &spa->del_epsilon);

    spa->epsilon0 = ecliptic_mean_obliquity(spa->jme);
    spa->epsilon  = spa->del_epsilon + spa->epsilon0 / 3600.0;
    spa->del_tau  = -20.4898 / (3600.0 * spa->r);
    spa->lamda    = spa->theta + spa->del_psi + spa->del_tau;
    spa->nu0      = greenwich_mean_sidereal_time(spa->jd, spa->jc);
    spa->nu       = spa->nu0 + spa->del_psi * cos(deg2rad(spa->epsilon));
    spa->alpha    = geocentric_right_ascension(spa->lamda, spa->epsilon, spa->beta);
    spa->delta    = geocentric_declination(spa->beta, spa->epsilon, spa->lamda);
}

/* ─── EOT + RTS ───────────────────────────────────────────────────────────── */

static void calculate_eot_and_sun_rise_transit_set(SpaData *spa) {
    double h0_prime = -1.0 * (SUN_RADIUS + spa->atmos_refract);

    /* Clone for RTS calculation */
    SpaData sun_rts = *spa;
    sun_rts.hour = 0;
    sun_rts.minute = 0;
    sun_rts.second = 0.0;
    sun_rts.delta_ut1 = 0.0;
    sun_rts.timezone = 0.0;
    sun_rts.jd = julian_day(sun_rts.year, sun_rts.month, sun_rts.day,
                             sun_rts.hour, sun_rts.minute, sun_rts.second,
                             sun_rts.delta_ut1, sun_rts.timezone);

    double m = sun_mean_longitude(spa->jme);
    spa->eot = eot_calc(m, spa->alpha, spa->del_psi, spa->epsilon);

    calculate_geocentric_sun_ra_and_dec(&sun_rts);
    double nu = sun_rts.nu;
    sun_rts.delta_t = 0;

    /* Compute alpha and delta for JD-1, JD, JD+1 */
    double alpha_arr[3], delta_arr[3];
    sun_rts.jd--;
    for (int i = 0; i < 3; i++) {
        calculate_geocentric_sun_ra_and_dec(&sun_rts);
        alpha_arr[i] = sun_rts.alpha;
        delta_arr[i] = sun_rts.delta;
        sun_rts.jd++;
    }

    double m_rts[3];
    m_rts[0] = approx_sun_transit_time(alpha_arr[1], spa->longitude, nu);
    double h0 = sun_hour_angle_at_rise_set(spa->latitude, delta_arr[1], h0_prime);

    if (h0 >= 0) {
        approx_sun_rise_and_set(m_rts, h0);

        double nu_rts[3], alpha_p[3], delta_p[3], h_p[3], h_rts[3];
        for (int i = 0; i < 3; i++) {
            nu_rts[i] = nu + 360.985647 * m_rts[i];
            double n = m_rts[i] + spa->delta_t / 86400.0;
            alpha_p[i] = rts_alpha_delta_prime(alpha_arr, n);
            delta_p[i] = rts_alpha_delta_prime(delta_arr, n);
            h_p[i] = limit_degrees180pm(nu_rts[i] + spa->longitude - alpha_p[i]);
            h_rts[i] = rts_sun_altitude(spa->latitude, delta_p[i], h_p[i]);
        }

        spa->srha = h_p[1];
        spa->ssha = h_p[2];
        spa->sta  = h_rts[0];

        spa->suntransit = dayfrac_to_local_hr(m_rts[0] - h_p[0] / 360.0, spa->timezone);
        spa->sunrise = dayfrac_to_local_hr(
            sun_rise_and_set(m_rts, h_rts, delta_p, spa->latitude, h_p, h0_prime, 1),
            spa->timezone);
        spa->sunset = dayfrac_to_local_hr(
            sun_rise_and_set(m_rts, h_rts, delta_p, spa->latitude, h_p, h0_prime, 2),
            spa->timezone);
    } else {
        spa->srha = spa->ssha = spa->sta = -99999;
        spa->suntransit = spa->sunrise = spa->sunset = -99999;
    }
}

/* ─── Full SPA calculation ────────────────────────────────────────────────── */

static int spa_calculate_internal(SpaData *spa) {
    /* Validate inputs */
    if (spa->year < -2000 || spa->year > 6000) return 1;
    if (spa->month < 1 || spa->month > 12) return 2;
    if (spa->day < 1 || spa->day > 31) return 3;
    if (spa->hour < 0 || spa->hour > 24) return 4;
    if (spa->minute < 0 || spa->minute > 59) return 5;
    if (spa->second < 0 || spa->second >= 60) return 6;
    if (spa->pressure < 0 || spa->pressure > 5000) return 12;
    if (spa->temperature <= -273 || spa->temperature > 6000) return 13;
    if (spa->delta_ut1 <= -1 || spa->delta_ut1 >= 1) return 17;
    if (spa->hour == 24 && spa->minute > 0) return 5;
    if (spa->hour == 24 && spa->second > 0) return 6;
    if (fabs(spa->delta_t) > 8000) return 7;
    if (fabs(spa->timezone) > 18) return 8;
    if (fabs(spa->longitude) > 180) return 9;
    if (fabs(spa->latitude) > 90) return 10;
    if (fabs(spa->atmos_refract) > 5) return 16;
    if (spa->elevation < -6500000) return 11;

    spa->jd = julian_day(spa->year, spa->month, spa->day, spa->hour, spa->minute,
                          spa->second, spa->delta_ut1, spa->timezone);

    calculate_geocentric_sun_ra_and_dec(spa);

    spa->h  = observer_hour_angle(spa->nu, spa->longitude, spa->alpha);
    spa->xi = 8.794 / (3600.0 * spa->r);

    right_ascension_parallax_and_topocentric_dec(
        spa->latitude, spa->elevation, spa->xi, spa->h, spa->delta,
        &spa->del_alpha, &spa->delta_prime);

    spa->alpha_prime = spa->alpha + spa->del_alpha;
    spa->h_prime     = spa->h - spa->del_alpha;

    spa->e0 = topocentric_elevation_angle(spa->latitude, spa->delta_prime, spa->h_prime);
    spa->del_e = atmospheric_refraction_correction(
        spa->pressure, spa->temperature, spa->atmos_refract, spa->e0);
    spa->e = spa->e0 + spa->del_e;

    spa->zenith = 90.0 - spa->e;
    spa->azimuth_astro = topocentric_azimuth_angle_astro(
        spa->h_prime, spa->latitude, spa->delta_prime);
    spa->azimuth = limit_degrees(spa->azimuth_astro + 180.0);

    /* Always compute RTS for prayer time purposes */
    calculate_eot_and_sun_rise_transit_set(spa);

    return 0;
}

/* ─── Public API ──────────────────────────────────────────────────────────── */

void spa_input_init(SpaInput *input) {
    input->year = 2000;
    input->month = 1;
    input->day = 1;
    input->hour = 12;
    input->minute = 0;
    input->second = 0.0;
    input->delta_ut1 = 0.0;
    input->delta_t = 67.0;
    input->timezone = 0.0;
    input->longitude = 0.0;
    input->latitude = 0.0;
    input->elevation = 0.0;
    input->pressure = 1013.25;
    input->temperature = 15.0;
    input->slope = 0.0;
    input->azm_rotation = 0.0;
    input->atmos_refract = 0.5667;
}

/* ---------------------------------------------------------------------------
 * Polar-day/night presentation helpers.
 *
 * The reference implementation writes SPA_NO_EVENT (-99999) into srha, ssha, sta,
 * suntransit, sunrise and sunset when the sun does not cross the horizon on the
 * requested day. The port above stays faithful to that. These helpers exist so no
 * sentinel crosses the public API: it is a FINITE number, so every isnan() guard in
 * every caller accepted it and treated it as a real time (PKG-09).
 * --------------------------------------------------------------------------- */

#define SPA_NO_EVENT (-99999.0)

/* True when a raw field carries the "no such event" sentinel rather than a time.
 * A magnitude test, not equality: the sentinel is arithmetic-poisoned downstream
 * (a custom angle offsets it by hours, giving -100002.015 and similar). */
int spa_is_no_event(double value) {
    return !isfinite(value) || value <= SPA_NO_EVENT + 1000.0;
}

/* Present a raw rise/set field to callers, mapping "no such event" to NAN. */
double spa_present_rts(double value) {
    return spa_is_no_event(value) ? NAN : value;
}

/* Local solar transit in fractional hours of local clock time.
 *
 * The sun crosses the local meridian every day everywhere on Earth, so solar noon is
 * always defined -- but the reference blanks it alongside the genuinely absent sunrise
 * and sunset, which cost Dhuhr and Asr on every polar day (PKG-05). The equation of
 * time is computed unconditionally before that branch, so transit is recoverable:
 *
 *     transit = 12 - (4 * (longitude - 15 * timezone) + eot) / 60
 *
 * Used ONLY where the reference has nothing to offer; where it produces a transit that
 * value passes through untouched, so no existing result moves. */
double spa_transit_from_eot(const SpaData *d) {
    double time_correction_minutes = 4.0 * (d->longitude - 15.0 * d->timezone) + d->eot;
    double transit = 12.0 - time_correction_minutes / 60.0;
    if (!isfinite(transit)) return NAN;
    transit = fmod(transit, 24.0);
    if (transit < 0) transit += 24.0;
    return transit;
}

int spa_calculate(const SpaInput *input, SpaResult *result) {
    SpaData d;

    d.year = input->year;
    d.month = input->month;
    d.day = input->day;
    d.hour = input->hour;
    d.minute = input->minute;
    d.second = input->second;
    d.delta_ut1 = input->delta_ut1;
    d.delta_t = input->delta_t;
    d.timezone = input->timezone;
    d.longitude = input->longitude;
    d.latitude = input->latitude;
    d.elevation = input->elevation;
    d.pressure = input->pressure;
    d.temperature = input->temperature;
    d.slope = input->slope;
    d.azm_rotation = input->azm_rotation;
    d.atmos_refract = input->atmos_refract;

    int rc = spa_calculate_internal(&d);
    if (rc != 0) return rc;

    result->zenith = d.zenith;
    result->azimuth = d.azimuth;
    /* The reference writes SPA_NO_EVENT into these when the sun does not cross the
     * horizon. It is a finite number, so callers checking isnan() -- exactly what
     * pray_calc.h documents -- accepted it as a real time (PKG-09). Present NAN. */
    result->sunrise = spa_present_rts(d.sunrise);
    /* Solar transit happens every day at every latitude even when sunrise does not,
     * so recover it rather than discarding Dhuhr and Asr along with it (PKG-05). */
    result->solar_noon = spa_is_no_event(d.suntransit)
                             ? spa_transit_from_eot(&d)
                             : d.suntransit;
    result->sunset = spa_present_rts(d.sunset);
    result->declination = d.delta;

    return 0;
}

SpaAnglesResult spa_custom_angle(double zenith_angle, double solar_noon,
                                  double declination, double latitude) {
    SpaAnglesResult r;
    double phi = latitude * M_PI / 180.0;
    double delta_rad = declination * M_PI / 180.0;
    double z = zenith_angle * M_PI / 180.0;
    double cos_h0 = (cos(z) - sin(phi) * sin(delta_rad)) / (cos(phi) * cos(delta_rad));
    if (cos_h0 < -1.0 || cos_h0 > 1.0) {
        r.sunrise = NAN;
        r.sunset = NAN;
        return r;
    }
    /* A depression angle can be reachable on a day with no sunrise, but these times are
     * offsets from solar transit -- a sentinel transit yielded finite, plausible, wholly
     * wrong values such as -100002.015 (PKG-09). */
    if (spa_is_no_event(solar_noon)) {
        r.sunrise = NAN;
        r.sunset = NAN;
        return r;
    }
    double h0h = acos(cos_h0) * 180.0 / M_PI / 15.0;
    r.sunrise = solar_noon - h0h;
    r.sunset = solar_noon + h0h;
    return r;
}
