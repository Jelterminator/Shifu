const { withAppBuildGradle } = require('expo/config-plugins');

module.exports = function withAndroidPackagingOptions(config) {
  return withAppBuildGradle(config, config => {
    const buildGradle = config.modResults.contents;

    if (!buildGradle.includes("pickFirst 'lib/**/libreactnative.so'")) {
      config.modResults.contents = buildGradle.replace(
        /android\s*\{/,
        `android {
    packagingOptions {
        pickFirst 'lib/**/libreactnative.so'
        pickFirst 'lib/**/libc++_shared.so'
    }`
      );
    }

    return config;
  });
};
