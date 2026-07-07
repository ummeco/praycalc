/**
 * Purpose: @bacons/apple-targets config for the iOS WidgetKit "Next Prayer" widget
 *   target. Declares a `widget` extension target that shares an App Group with the
 *   main app (so the RN side's ExtensionStorage writes are readable by the Swift
 *   TimelineProvider), pulls PrayCalc brand colors into Assets.xcassets, and links
 *   SwiftUI + WidgetKit. Consumed by the config plugin during `expo prebuild`.
 * Inputs: the resolved ExpoConfig (for the main app's App Group entitlement).
 * Outputs: a target config object (type "widget") — see @bacons/apple-targets Config.
 * Constraints: The App Group MUST match app.json ios.entitlements — it is derived
 *   from there rather than re-typed so the two can never drift. deploymentTarget 16.0
 *   is the floor for the SwiftUI/WidgetKit APIs used (accessoryWidget/StaticConfig).
 * SPORT: REGISTRY-APPS.md#praycalc-mobile-feature-16-home-widgets
 */

/** @type {import('@bacons/apple-targets/app.plugin').ConfigFunction} */
module.exports = (config) => {
  const appGroups =
    config.ios?.entitlements?.['com.apple.security.application-groups'] ?? [
      'group.com.praycalc.praycalcApp',
    ];

  return {
    type: 'widget',
    name: 'NextPrayerWidget',
    displayName: 'Next Prayer',
    deploymentTarget: '16.0',
    frameworks: ['SwiftUI', 'WidgetKit'],
    // Brand palette (src/constants/colors.ts DarkColors) exposed to Swift as Color("…").
    colors: {
      WidgetBackground: '#0D2F17', // brand.deep
      WidgetAccent: '#C9F27A', // brand.light
    },
    entitlements: {
      'com.apple.security.application-groups': appGroups,
    },
  };
};
