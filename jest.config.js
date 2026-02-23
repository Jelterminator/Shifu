module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-screens|react-native-safe-area-context|react-native-svg|react-native-mmkv|@testing-library/react-native|uuid|@xenova/transformers))',
  ],
  testMatch: [
    '<rootDir>/src/**/*.test.{ts,tsx}',
    '<rootDir>/tests/**/*.test.{ts,tsx}',
    '<rootDir>/scripts/**/*.ts',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@services/(.*)$': '<rootDir>/src/services/$1',
    '^@utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
    // Stub react-native 0.81 private ESM files that can't be transformed by Babel
    'react-native/src/private/specs_DEPRECATED/(.*)': '<rootDir>/tests/__mocks__/DebuggingOverlayNativeComponent.js',
    'react-native/src/private/(.*)': '<rootDir>/tests/__mocks__/DebuggingOverlayNativeComponent.js',
    'react-native/src/(.*)': '<rootDir>/tests/__mocks__/DebuggingOverlayNativeComponent.js',
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
