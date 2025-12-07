const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts =
  process.env.EXPO_PLATFORM === 'web'
    ? ['web.tsx', 'web.ts', 'web.jsx', 'web.js', ...config.resolver.sourceExts]
    : config.resolver.sourceExts;

module.exports = config;
