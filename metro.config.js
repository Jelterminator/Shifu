// Force reload
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

const { resolver } = config;

config.resolver = {
  ...resolver,
  sourceExts:
    process.env.EXPO_PLATFORM === 'web'
      ? ['mjs', 'web.tsx', 'web.ts', 'web.jsx', 'web.js', ...resolver.sourceExts]
      : resolver.sourceExts,
  assetExts: [...resolver.assetExts, 'wasm', 'db', 'onnx', 'bin'],
  // Enable package exports for @huggingface/transformers ONLY on web.
  // Native builds (onnxruntime-react-native) do not support/need this package.
  unstable_enablePackageExports: process.env.EXPO_PLATFORM === 'web',
  // Redirect onnxruntime-web to our CDN-loading shim on web.
  // Metro cannot parse onnxruntime-web's dist files (they use webpackIgnore syntax).
  resolveRequest: (context, moduleName, platform) => {
    if (
      platform === 'web' &&
      (moduleName === 'onnxruntime-web' || moduleName.startsWith('onnxruntime-web/'))
    ) {
      return {
        filePath: path.resolve(__dirname, 'src/shims/onnxruntime-web.js'),
        type: 'sourceFile',
      };
    }
    if (
      platform === 'web' &&
      (moduleName === 'onnxruntime-node' || moduleName.startsWith('onnxruntime-node/'))
    ) {
      return {
        filePath: path.resolve(__dirname, 'src/shims/onnxruntime-node.js'),
        type: 'sourceFile',
      };
    }

    if (platform === 'web' && moduleName === '@huggingface/transformers') {
      return {
        filePath: path.resolve(__dirname, 'src/shims/transformers-lib.js'),
        type: 'sourceFile',
      };
    }

    if (platform === 'web' && moduleName === 'onnxruntime-common') {
      return {
        filePath: path.resolve(__dirname, 'src/shims/onnxruntime-web.js'),
        type: 'sourceFile',
      };
    }

    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = config;
