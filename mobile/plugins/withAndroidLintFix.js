const { withAppBuildGradle } = require('expo/config-plugins');

// expo-localization's native "locales" config plugin writes the NS*-prefixed
// permission strings (from locales/native/*.json — really only meaningful on
// iOS Info.plist) into per-locale Android `values-b+<lang>/strings.xml` files
// with no matching entry in the default `values/strings.xml`. That trips
// Android lint's fatal "ExtraTranslation" check on release builds even though
// the strings are unused on Android. Disable just that check.
module.exports = function withAndroidLintFix(config) {
  return withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      const contents = config.modResults.contents;
      if (!contents.includes("disable 'ExtraTranslation'")) {
        config.modResults.contents = contents.replace(
          /android\s*\{/,
          `android {\n    lint {\n        disable 'ExtraTranslation'\n    }\n`,
        );
      }
    }
    return config;
  });
};
