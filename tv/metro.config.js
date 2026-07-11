/**
 * Metro configuration for PrayCalc TV (bare react-native-tvos).
 * Required by createBundleReleaseJsAndAssets in release builds — dev worked on
 * Metro defaults, but the Gradle bundle task refuses to run without a config file.
 * https://reactnative.dev/docs/metro
 */
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

/** @type {import('metro-config').MetroConfig} */
const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
