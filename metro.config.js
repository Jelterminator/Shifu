// Force reload
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const { resolver } = config;

config.resolver = {
  ...resolver,
  sourceExts:
    process.env.EXPO_PLATFORM === 'web'
      ? ['web.tsx', 'web.ts', 'web.jsx', 'web.js', ...resolver.sourceExts]
      : resolver.sourceExts,
  assetExts: [...resolver.assetExts, 'wasm', 'db'],
};

module.exports = config;
