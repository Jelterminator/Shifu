module.exports = {
  preset: "react-native",
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  transform: {
    "^.+\\.[jt]sx?$": "babel-jest"
  },
  transformIgnorePatterns: [
    "node_modules/(?!(react-native|@react-native|react-native-vector-icons|expo|@expo)/)"
  ],
  testMatch: [
    "<rootDir>/src/**/*.test.{ts,tsx}",
    "<rootDir>/tests/**/*.test.{ts,tsx}"
  ],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@components/(.*)$": "<rootDir>/src/components/$1",
    "^@services/(.*)$": "<rootDir>/src/services/$1",
    "^@utils/(.*)$": "<rootDir>/src/utils/$1",
    "^@models/(.*)$": "<rootDir>/src/models/$1",
    "^@assets/(.*)$": "<rootDir>/assets/$1",
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/tests/__mocks__/fileMock.js",
    "\\.(css|less)$": "<rootDir>/tests/__mocks__/styleMock.js"
  },
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.test.{ts,tsx}",
    "!src/**/*.spec.{ts,tsx}",
    "!src/**/index.ts",
    "!src/**/types.ts"
  ],
  coverageReporters: ["text", "lcov", "html"],
  testEnvironment: "node",
  clearMocks: true
};
