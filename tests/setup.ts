import "@testing-library/jest-native/extend-expect";

// Mock React Native modules
jest.mock("react-native/Libraries/Animated/NativeAnimatedHelper");

// Mock Expo modules
jest.mock("expo-sqlite", () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn(),
    executeSql: jest.fn(),
  })),
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock device info
jest.mock("react-native-device-info", () => ({
  getVersion: jest.fn(() => "1.0.0"),
  getBuildNumber: jest.fn(() => "1"),
  getModel: jest.fn(() => "iPhone"),
}));

// Mock notifications
jest.mock("expo-notifications", () => ({
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
}));

// Silence warning logs in tests
global.console = {
  ...console,
  log: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock timers
jest.useFakeTimers();

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
});

afterEach(() => {
  jest.clearAllTimers();
});
