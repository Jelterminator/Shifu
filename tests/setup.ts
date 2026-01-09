// Minimal test setup
import '@testing-library/jest-native/extend-expect';

// Mock Expo Modules
jest.mock('expo-constants', () => ({
  manifest: { extra: { googleWebClientId: 'mock-client-id' } },
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/document/directory/',
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid'),
}));

jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn(),
    execAsync: jest.fn(),
  })),
}));

jest.mock('expo-calendar', () => ({
  requestCalendarPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  getCalendarsAsync: jest.fn(() => Promise.resolve([])),
  createCalendarAsync: jest.fn(() => Promise.resolve('calendar-id')),
}));

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationCategoryAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve([])),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ status: 'granted' })),
}));
