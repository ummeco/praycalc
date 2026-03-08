/**
 * qibla.c — Qibla bearing and distance calculation.
 *
 * Port of web/lib/qibla.ts. Uses the forward azimuth (initial bearing)
 * formula on the great circle to the Ka'bah center coordinates.
 */

#include "qibla.h"
#include <math.h>

#ifndef M_PI
#define M_PI 3.14159265358979323846
#endif

/* Exact center of the Ka'bah, Masjid al-Haram, Mecca */
#define KAABA_LAT 21.422511
#define KAABA_LNG 39.826150

static double to_rad(double d) { return d * M_PI / 180.0; }

double qibla_bearing(double lat, double lng) {
    double phi1 = to_rad(lat);
    double phi2 = to_rad(KAABA_LAT);
    double d_lambda = to_rad(KAABA_LNG - lng);

    double y = sin(d_lambda) * cos(phi2);
    double x = cos(phi1) * sin(phi2) - sin(phi1) * cos(phi2) * cos(d_lambda);

    double bearing = atan2(y, x) * 180.0 / M_PI;
    return fmod(bearing + 360.0, 360.0);
}

double qibla_distance_km(double lat1, double lng1, double lat2, double lng2) {
    const double R = 6371.0;
    double d_lat = to_rad(lat2 - lat1);
    double d_lng = to_rad(lng2 - lng1);
    double a = sin(d_lat / 2) * sin(d_lat / 2) +
               cos(to_rad(lat1)) * cos(to_rad(lat2)) *
               sin(d_lng / 2) * sin(d_lng / 2);
    return R * 2.0 * atan2(sqrt(a), sqrt(1.0 - a));
}
