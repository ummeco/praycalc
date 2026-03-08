/**
 * qibla.h — Qibla bearing calculation.
 *
 * Computes the great-circle bearing from any point on Earth to the Ka'bah
 * in Mecca, Saudi Arabia. Uses the forward azimuth formula.
 */
#ifndef QIBLA_H
#define QIBLA_H

#ifdef __cplusplus
extern "C" {
#endif

/**
 * Compute Qibla bearing in degrees clockwise from north (0=N, 90=E, 180=S, 270=W).
 *
 * lat: observer latitude in degrees (-90 to 90)
 * lng: observer longitude in degrees (-180 to 180)
 */
double qibla_bearing(double lat, double lng);

/**
 * Compute haversine distance in km between two coordinate pairs.
 */
double qibla_distance_km(double lat1, double lng1, double lat2, double lng2);

#ifdef __cplusplus
}
#endif

#endif /* QIBLA_H */
