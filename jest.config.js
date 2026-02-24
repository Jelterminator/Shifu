module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?|expo-.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-screens|react-native-safe-area-context|react-native-svg|react-native-mmkv|@testing-library/react-native|uuid|@xenova/transformers|@huggingface/transformers)',
  ],
  testMatch: [
    '<rootDir>/src/**/*.test.{ts,tsx}',
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/scripts/**/*.ts',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node', 'mjs'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@screens/*': '<rootDir>/src/screens/$1', // Added $1 if needed, but the user had "@screens/*": ["src/screens/*"] in tsconfig
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    // Force CommonJS for problematic navigation packages
    '^@react-navigation/native-stack$':
      '<rootDir>/node_modules/@react-navigation/native-stack/lib/commonjs/index.js',
    '^@react-navigation/native$':
      '<rootDir>/node_modules/@react-navigation/native/lib/commonjs/index.js',
    '^@react-navigation/bottom-tabs$':
      '<rootDir>/node_modules/@react-navigation/bottom-tabs/lib/commonjs/index.js',
    // Stub react-native 0.81+ private ESM files that can't be transformed by Babel
    'react-native/Libraries/Debugging/DebuggingOverlay':
      '<rootDir>/tests/__mocks__/DebuggingOverlayNativeComponent.js',
    'react-native/src/private/specs_DEPRECATED/components/DebuggingOverlayNativeComponent':
      '<rootDir>/tests/__mocks__/DebuggingOverlayNativeComponent.js',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.spec.{ts,tsx}',
    '!src/**/index.ts',
    '!src/**/types.ts',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  clearMocks: true,
};
