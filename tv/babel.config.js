/**
 * Purpose: Babel config for PrayCalc TV — required by both Metro (bundling) and
 *   Jest (test transform, via the "react-native" jest preset's babel-jest transform).
 * Constraints: react-native-tvos 0.74.5-0 is a fork of RN 0.74.5; the standard
 *   @react-native/babel-preset for that RN minor line is what both Metro's default
 *   transformer and jest-config's babel-jest expect to find at the project root.
 * SPORT: praycalc/tv root
 */
module.exports = {
  presets: ['module:@react-native/babel-preset'],
};
