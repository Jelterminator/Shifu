
// Mock MMKV native module globally to prevent crash during import
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    getBoolean: jest.fn(),
    getNumber: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  })),
}));

// Mocks
jest.mock('../src/utils/storage', () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
    getBoolean: jest.fn(),
    getString: jest.fn(),
  },
}));

import '../src/services/data/Anchors';

test('imports', () => {
    expect(1).toBe(1);
});
