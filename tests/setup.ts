// Minimal test setup
import '@testing-library/jest-native/extend-expect';

// Pre-configure host component names to prevent detectHostComponentNames() from being called.
// That function renders RN components which triggers untransformed ESM specs in RN 0.81+.
// We access the internal config API since `hostComponentNames` is not exposed publicly.
// See: node_modules/@testing-library/react-native/build/helpers/host-component-names.js
/* eslint-disable @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */
const { configureInternal } = require('@testing-library/react-native/build/config');
configureInternal({
  hostComponentNames: {
    text: 'Text',
    textInput: 'TextInput',
    image: 'Image',
    switch: 'Switch',
    scrollView: 'ScrollView',
    modal: 'Modal',
  },
});
/* eslint-enable @typescript-eslint/no-var-requires, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call */

// Mock Expo Modules
jest.mock('expo-constants', () => ({
  manifest: { extra: { googleWebClientId: 'mock-client-id' } },
}));

jest.mock('expo-file-system', () => ({
  documentDirectory: 'file:///mock/document/directory/',
}));

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///mock/document/directory/',
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, isDirectory: true })),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  createDownloadResumable: jest.fn(() => ({
    downloadAsync: jest.fn(() => Promise.resolve({ uri: 'file:///mock/model.onnx' })),
  })),
}));

jest.mock('expo-crypto', () => ({
  randomUUID: jest.fn(() => 'mock-uuid'),
}));

jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn(),
    execAsync: jest.fn(),
  })),
  openDatabaseAsync: jest.fn(() =>
    Promise.resolve({
      execAsync: jest.fn(() => Promise.resolve()),
      withTransactionAsync: jest.fn(async (cb: () => Promise<void>) => await cb()),
      getFirstAsync: jest.fn(() => Promise.resolve(null)),
      getAllAsync: jest.fn(() => Promise.resolve([])),
      runAsync: jest.fn(() => Promise.resolve({ changes: 1, lastInsertRowId: 1 })),
    })
  ),
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

jest.mock('@xenova/transformers', () => ({
  AutoTokenizer: { from_pretrained: jest.fn() },
  pipeline: jest.fn(),
}));

jest.mock('onnxruntime-react-native', () => ({
  InferenceSession: { create: jest.fn() },
  Tensor: jest.fn(),
}));

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskRegisteredAsync: jest.fn(() => Promise.resolve(false)),
}));

jest.mock('expo-background-task', () => ({
  getStatusAsync: jest.fn(() => Promise.resolve(1)), // 1 is BackgroundTaskStatus.Available usually
  registerTaskAsync: jest.fn(() => Promise.resolve()),
  unregisterTaskAsync: jest.fn(() => Promise.resolve()),
  triggerTaskWorkerForTestingAsync: jest.fn(() => Promise.resolve()),
  BackgroundTaskStatus: { Restricted: 2, Available: 1 },
  BackgroundTaskResult: { Success: 1, Failed: 2 },
}));

jest.mock('expo-battery', () => ({
  getBatteryStateAsync: jest.fn(() => Promise.resolve(1)), // 1 is UNKNOWN
  BatteryState: { UNKNOWN: 1, CHARGING: 2, FULL: 3, UNPLUGGED: 4 },
}));
