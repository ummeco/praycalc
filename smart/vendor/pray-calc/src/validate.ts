/**
 * Input validation for public API boundaries.
 */

/**
 * Validate geographic and atmospheric inputs for prayer time computation.
 *
 * @throws {RangeError} if any parameter is out of its valid range
 */
export function validateInputs(lat: number, lng: number, tz?: number, elevation?: number): void {
  if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
    throw new RangeError(`latitude must be between -90 and 90, got ${lat}`);
  }
  if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
    throw new RangeError(`longitude must be between -180 and 180, got ${lng}`);
  }
  if (tz !== undefined && (!Number.isFinite(tz) || tz < -14 || tz > 14)) {
    throw new RangeError(`timezone offset must be between -14 and 14, got ${tz}`);
  }
  if (elevation !== undefined && (!Number.isFinite(elevation) || elevation < -500)) {
    throw new RangeError(`elevation must be >= -500m, got ${elevation}`);
  }
}
