/**
 * tests/android-stability.test.ts
 *
 * Stability tests for Android-specific crash scenarios.
 */

// ── Platform override (MUST be first) ───────────────────────────────────────
jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  ReactNative.Platform.OS = 'android';
  ReactNative.Platform.select = (obj: any) => obj.android ?? obj.default;
  return ReactNative;
});

// ── Dependency Mocks ─────────────────────────────────────────────────────────

let mockDocDirectory: string | null = 'file:///test/docs/';

jest.mock('expo-file-system/legacy', () => ({
  get documentDirectory() {
    return mockDocDirectory;
  },
  getInfoAsync: jest.fn().mockResolvedValue({ exists: true }),
  makeDirectoryAsync: jest.fn().mockResolvedValue(undefined),
  createDownloadResumable: jest.fn().mockReturnValue({
    downloadAsync: jest.fn().mockResolvedValue({ uri: 'file:///test/docs/models/test.onnx' }),
  }),
}));

jest.mock('expo-task-manager', () => ({
  defineTask: jest.fn(),
  isTaskRegisteredAsync: jest.fn().mockResolvedValue(false),
  unregisterTaskAsync: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('expo-background-task', () => ({
  getStatusAsync: jest.fn().mockResolvedValue('available'),
  registerTaskAsync: jest.fn().mockResolvedValue(undefined),
  unregisterTaskAsync: jest.fn().mockResolvedValue(undefined),
  BackgroundTaskResult: { Success: 1, Failed: 0 },
  BackgroundTaskStatus: { Available: 'available', Restricted: 'restricted' },
}));

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn().mockResolvedValue({
    execAsync: jest.fn().mockResolvedValue(undefined),
    getFirstAsync: jest.fn().mockResolvedValue({ user_version: 0 }),
    runAsync: jest.fn().mockResolvedValue({ changes: 0, lastInsertRowId: 0 }),
    getAllAsync: jest.fn().mockResolvedValue([]),
    withTransactionAsync: jest.fn().mockImplementation(async cb => {
      return await cb({ runAsync: jest.fn() });
    }),
  }),
}));

jest.mock('../src/utils/storage', () => ({
  storage: {
    get: jest.fn(),
    getString: jest.fn(),
    getBoolean: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    preload: jest.fn().mockResolvedValue(undefined),
  },
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────
import * as SQLite from 'expo-sqlite';
import * as TaskManager from 'expo-task-manager';
import { DatabaseService } from '../src/db/database';
import { ModelLoader } from '../src/services/ai/ModelLoader';
import { registerHeartbeatTask } from '../src/services/background/BackgroundTaskSetup';

describe('[Android] Stability & Crash Prevention', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDocDirectory = 'file:///test/docs/';
  });

  describe('ModelLoader (FileSystem.documentDirectory issues)', () => {
    it('handles null documentDirectory without crashing', async () => {
      mockDocDirectory = null;
      await expect(ModelLoader.initialize()).resolves.toBeUndefined();
      const path = await ModelLoader.getModelPath('test.onnx');
      expect(path).toBeNull();
    });

    it('throws meaningful error if ensureModel is called without documentDirectory', async () => {
      mockDocDirectory = null;
      await expect(ModelLoader.ensureModel('http://test.com/m.onnx', 'm.onnx')).rejects.toThrow(
        'FileSystem.documentDirectory is unavailable'
      );
    });
  });

  describe('DatabaseService (Migration stability)', () => {
    it('handles migration SQL errors gracefully during initialization', async () => {
      const dbService = new DatabaseService();
      const dbInstance = await SQLite.openDatabaseAsync('test.db');
      (dbInstance.execAsync as jest.Mock).mockRejectedValueOnce(
        new Error('SQLiteException: no such table: users')
      );

      await expect(dbService.initialize()).rejects.toThrow('SQLiteException');
    });
  });

  describe('Background Tasks (Native linkage)', () => {
    it('registerHeartbeatTask handles missing TaskManager gracefully', async () => {
      (TaskManager.isTaskRegisteredAsync as jest.Mock).mockRejectedValue(
        new Error('Native module missing')
      );
      const result = await registerHeartbeatTask();
      expect(result).toBe(false);
    });
  });
});
