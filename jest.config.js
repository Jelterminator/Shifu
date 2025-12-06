module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: [
    "@testing-library/jest-native/extend-expect",
    "<rootDir>/tests/setup.ts",
  ],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)",
  ],
  testMatch: [
    "<rootDir>/src/**/*.test.{ts,tsx}",
    "<rootDir>/tests/**/*.{spec,test}.{ts,tsx}",
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@models/(.*)$": "<rootDir>/src/models/$1",
    "^@assets/(.*)$": "<rootDir>/assets/$1",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga|onnx)$":
      "<rootDir>/tests/__mocks__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/tests/__mocks__/styleMock.js",
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.spec.{ts,tsx}",
    "!src/**/index.ts",
    "!src/**/types.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  coverageReporters: ["text", "lcov", "html"],
  testEnvironment: "jsdom",
  verbose: true,
  cacheDirectory: ".jest/cache",
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,
};
