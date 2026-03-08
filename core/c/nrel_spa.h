/**
 * nrel_spa.h — NREL Solar Position Algorithm (SPA) in C99.
 *
 * Port of the NREL SPA (Reda & Andreas, 2004, NREL/TP-560-34302).
 * Accurate to +/-0.0003 degrees for solar zenith angle.
 *
 * This is a direct port from the pray_calc_dart Dart implementation,
 * which itself is a port of the nrel-spa JavaScript library (spa.js v2.0.1).
 */
#ifndef NREL_SPA_H
#define NREL_SPA_H

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Input parameters for the SPA calculation.
 */
typedef struct {
    int    year;
    int    month;
    int    day;
    int    hour;
    int    minute;
    double second;
    double delta_ut1;      /* fractional second difference UT1-UTC (-1..1) */
    double delta_t;        /* seconds difference TT-UT (default: 67) */
    double timezone;       /* UTC offset in hours */
    double longitude;      /* degrees (-180..180, west negative) */
    double latitude;       /* degrees (-90..90, south negative) */
    double elevation;      /* meters above sea level */
    double pressure;       /* mbar (default: 1013.25) */
    double temperature;    /* degrees C (default: 15) */
    double slope;          /* surface slope in degrees */
    double azm_rotation;   /* surface azimuth rotation in degrees */
    double atmos_refract;  /* atmospheric refraction at sunrise/sunset (default: 0.5667) */
} SpaInput;

/**
 * Output results from the SPA calculation.
 */
typedef struct {
    double zenith;         /* topocentric zenith angle (degrees) */
    double azimuth;        /* topocentric azimuth (degrees, eastward from north) */
    double sunrise;        /* local sunrise (fractional hours) */
    double solar_noon;     /* local sun transit (fractional hours) */
    double sunset;         /* local sunset (fractional hours) */
    double declination;    /* geocentric sun declination (degrees) */
} SpaResult;

/**
 * Sunrise/sunset pair for a custom zenith angle.
 */
typedef struct {
    double sunrise;
    double sunset;
} SpaAnglesResult;

/**
 * Initialize an SpaInput with sensible defaults.
 * Sets pressure=1013.25, temperature=15, delta_t=67, atmos_refract=0.5667.
 */
void spa_input_init(SpaInput *input);

/**
 * Run the full SPA calculation.
 *
 * Returns 0 on success, nonzero error code on failure.
 * On success, result is populated with zenith, azimuth, sunrise, solar_noon, sunset.
 */
int spa_calculate(const SpaInput *input, SpaResult *result);

/**
 * Compute sunrise/sunset for a custom zenith angle, given a completed SPA result.
 *
 * zenith_angle: the desired zenith angle in degrees (e.g. 96 for civil twilight).
 * solar_noon:   the solar noon from SpaResult.
 * declination:  the declination from SpaResult (internal use).
 * latitude:     observer latitude in degrees.
 *
 * Returns SpaAnglesResult with sunrise/sunset in fractional hours.
 * If the angle is unreachable, sunrise and sunset are set to NAN.
 */
SpaAnglesResult spa_custom_angle(double zenith_angle, double solar_noon,
                                  double declination, double latitude);

#ifdef __cplusplus
}
#endif

#endif /* NREL_SPA_H */
