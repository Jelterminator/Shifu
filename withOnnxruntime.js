const { withMainApplication } = require('@expo/config-plugins');

module.exports = function withOnnxruntime(config) {
  return withMainApplication(config, config => {
    let contents = config.modResults.contents;

    // Check if already added
    if (!contents.includes('add(ai.onnxruntime.reactnative.OnnxruntimePackage())')) {
      // Replace the placeholder comment
      contents = contents.replace(
        '// add(MyReactNativePackage())',
        '// add(MyReactNativePackage())\n              add(ai.onnxruntime.reactnative.OnnxruntimePackage())'
      );
      config.modResults.contents = contents;
    }

    return config;
  });
};
