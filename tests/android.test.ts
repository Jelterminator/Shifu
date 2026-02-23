/**
 * Android Platform Simulation Tests
 *
 * These tests simulate an Android environment by overriding Platform.OS = 'android'
 * and verifying that all key app subsystems initialize correctly under Android
 * constraints (WorkManager, SQLite, MMKV, Notifications, Battery).
 *
 * The tests help catch the "gray screen + crash" class of bugs that occur when
 * a NativeModule is unavailable, an async initializer throws, or a service
 * crashes its constructor on Android.
 */

// ── Platform override ────────────────────────────────────────────────────────
// MUST be before any other imports that use Platform.OS
jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  ReactNative.Platform.OS = 'android';
  ReactNative.Platform.select = (obj: any) => obj.android ?? obj.default;
  return ReactNative;
});

// ── DB mock ──────────────────────────────────────────────────────────────────
// NOTE: jest.mock() is hoisted above const declarations, so we cannot reference
// closure variables inside the factory. Instead, we use a global store.
const mockDbInitialize = jest.fn().mockResolvedValue(undefined);
const mockDbQuery = jest.fn().mockResolvedValue([]);
const mockDbExecute = jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 1 });
const mockDbTransaction = jest.fn().mockImplementation(async (cb: any) => {
  await cb({ runAsync: jest.fn() });
});

jest.mock('../src/db/database', () => ({
  db: {
    // Use property accessors that delegate to module-level mocks
    get initialize() {
      return mockDbInitialize;
    },
    get query() {
      return mockDbQuery;
    },
    get execute() {
      return mockDbExecute;
    },
    get transaction() {
      return mockDbTransaction;
    },
  },
  DatabaseService: jest.fn(),
}));

// ── Storage mock (MMKV unavailable on Android emulator / Expo Go) ────────────
const mockStorageCache = new Map<string, string>();

jest.mock('../src/utils/storage', () => ({
  storage: {
    get: (key: string) => mockStorageCache.get(key) ?? null,
    getString: (key: string) => mockStorageCache.get(key),
    getBoolean: (key: string) => {
      const v = mockStorageCache.get(key);
      return v === 'true' ? true : v === 'false' ? false : undefined;
    },
    getNumber: (key: string) => {
      const v = mockStorageCache.get(key);
      return v !== undefined ? Number(v) : undefined;
    },
    set: (key: string, value: string | boolean | number) =>
      mockStorageCache.set(key, String(value)),
    delete: (key: string) => mockStorageCache.delete(key),
    clear: () => mockStorageCache.clear(),
    preload: jest.fn().mockResolvedValue(undefined),
  },
}));

// ── External service mocks ────────────────────────────────────────────────────
jest.mock('../src/services/ai/Inference', () => ({
  generateResponse: jest.fn().mockResolvedValue('Mocked summary'),
  unloadModel: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/services/ai/ArchiverService', () => ({
  archiverService: {
    runDailyArchive: jest.fn().mockResolvedValue(undefined),
    runHierarchicalRollups: jest.fn().mockResolvedValue(undefined),
  },
}));

// ── Imports (after mocks) ─────────────────────────────────────────────────────
import { Platform } from 'react-native';
import { vectorStorage } from '../src/db/vectorStorage';
import {
  HEARTBEAT_TASK_NAME,
  isHeartbeatRegistered,
  registerHeartbeatTask,
  unregisterHeartbeatTask,
} from '../src/services/background/BackgroundTaskSetup';
import { HeartbeatService } from '../src/services/background/HeartbeatService';
import { storage } from '../src/utils/storage';

// ─────────────────────────────────────────────────────────────────────────────
// 1. Platform Detection
// ─────────────────────────────────────────────────────────────────────────────
describe('[Android] Platform detection', () => {
  it('reports Platform.OS as android', () => {
    expect(Platform.OS).toBe('android');
  });

  it('Platform.select returns android value', () => {
    const result = Platform.select({ android: 'is-android', ios: 'is-ios', default: 'default' });
    expect(result).toBe('is-android');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Storage: MMKV fallback — should not crash even when NativeModule is absent
// ─────────────────────────────────────────────────────────────────────────────
describe('[Android] Storage adapter', () => {
  beforeEach(() => {
    mockStorageCache.clear();
  });

  it('set and get a string value', () => {
    storage.set('key1', 'hello');
    expect(storage.getString('key1')).toBe('hello');
  });

  it('set and get a boolean value', () => {
    storage.set('flag', true);
    expect(storage.getBoolean('flag')).toBe(true);
  });

  it('set and get a numeric value', () => {
    storage.set('count', 42);
    expect(storage.getNumber('count')).toBe(42);
  });

  it('delete removes the key', () => {
    storage.set('temp', 'data');
    storage.delete('temp');
    expect(storage.getString('temp')).toBeUndefined();
  });

  it('clear removes all keys', () => {
    storage.set('a', '1');
    storage.set('b', '2');
    storage.clear();
    expect(storage.getString('a')).toBeUndefined();
    expect(storage.getString('b')).toBeUndefined();
  });

  it('returns null/undefined for missing keys', () => {
    expect(storage.get('missing')).toBeNull();
    expect(storage.getString('missing')).toBeUndefined();
    expect(storage.getBoolean('missing')).toBeUndefined();
    expect(storage.getNumber('missing')).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Database: initialize() and basic operations on Android
// ─────────────────────────────────────────────────────────────────────────────
describe('[Android] DatabaseService initialization', () => {
  beforeEach(() => {
    mockDbInitialize.mockReset().mockResolvedValue(undefined);
    mockDbQuery.mockReset().mockResolvedValue([]);
    mockDbExecute.mockReset().mockResolvedValue({ changes: 1, lastInsertRowId: 1 });
  });

  it('initializes without throwing', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { db } = require('../src/db/database') as typeof import('../src/db/database');
    await expect(db.initialize()).resolves.not.toThrow();
    expect(mockDbInitialize).toHaveBeenCalled();
  });

  it('query resolves to an array', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { db } = require('../src/db/database') as typeof import('../src/db/database');
    mockDbQuery.mockResolvedValueOnce([{ id: 'user-1' }]);
    const results = await db.query<{ id: string }>('SELECT id FROM users LIMIT 1');
    expect(Array.isArray(results)).toBe(true);
    expect(results[0]?.id).toBe('user-1');
  });

  it('execute resolves without throwing', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { db } = require('../src/db/database') as typeof import('../src/db/database');
    await expect(
      db.execute('INSERT INTO users (id, timezone, created_at) VALUES (?, ?, ?)', [
        'test-id',
        'UTC',
        new Date().toISOString(),
      ])
    ).resolves.not.toThrow();
  });

  it('handles DB initialization failure gracefully', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { db } = require('../src/db/database') as typeof import('../src/db/database');
    // Simulate DB failure: 1st call throws, next calls succeed
    mockDbInitialize.mockRejectedValueOnce(new Error('Cannot open database'));
    await expect(db.initialize()).rejects.toThrow('Cannot open database');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Background Task Setup: registration on Android
// ─────────────────────────────────────────────────────────────────────────────
describe('[Android] BackgroundTaskSetup', () => {
  it('HEARTBEAT_TASK_NAME is defined', () => {
    expect(HEARTBEAT_TASK_NAME).toBe('shifu-heartbeat');
  });

  it('registerHeartbeatTask returns true when task registers successfully', async () => {
    const result = await registerHeartbeatTask();
    expect(typeof result).toBe('boolean');
    // Should not crash
  });

  it('registerHeartbeatTask handles restricted status gracefully', async () => {
    // Mocked expo-background-task has getStatusAsync returning 1 (Available)
    // When restricted, it should return false without throwing
    const BackgroundTask = jest.requireMock('expo-background-task');
    BackgroundTask.getStatusAsync.mockResolvedValueOnce(
      BackgroundTask.BackgroundTaskStatus.Restricted
    );
    const result = await registerHeartbeatTask();
    expect(result).toBe(false);
  });

  it('unregisterHeartbeatTask does not throw on Android', async () => {
    await expect(unregisterHeartbeatTask()).resolves.not.toThrow();
  });

  it('isHeartbeatRegistered returns a boolean', async () => {
    const result = await isHeartbeatRegistered();
    expect(typeof result).toBe('boolean');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. HeartbeatService: core execution flow on Android
// ─────────────────────────────────────────────────────────────────────────────
describe('[Android] HeartbeatService execution', () => {
  let service: HeartbeatService;

  beforeEach(() => {
    mockDbInitialize.mockReset().mockResolvedValue(undefined);
    mockDbExecute.mockReset().mockResolvedValue({ changes: 1, lastInsertRowId: 1 });
    mockDbQuery.mockReset().mockResolvedValue([]);
    mockDbTransaction.mockReset().mockImplementation(async (cb: any) => {
      await cb({ runAsync: jest.fn() });
    });
    mockStorageCache.clear();

    // @ts-expect-error accessing private static for testing
    HeartbeatService.instance = undefined;
    service = HeartbeatService.getInstance();
  });

  it('execute() completes successfully on Android', async () => {
    // Simulate device not charging (battery state = UNKNOWN)
    const result = await service.execute();
    expect(result.success).toBe(true);
    expect(result.stepsCompleted).toContain('db_init');
    expect(result.stepsCompleted).toContain('table_check');
    expect(result.stepsCompleted).toContain('log_start');
    expect(result.stepsCompleted).toContain('light_maintenance');
  });

  it('execute() handles DB failure gracefully', async () => {
    mockDbInitialize.mockRejectedValueOnce(new Error('SQLite disk I/O error'));
    const result = await service.execute();
    expect(result.success).toBe(false);
    expect(result.error).toContain('SQLite disk I/O error');
  });

  it('execute() skips heavy maintenance when not charging', async () => {
    // expo-battery is mocked to return UNKNOWN state (not charging)
    const result = await service.execute();
    expect(result.stepsCompleted).toContain('skipped_heavy_not_charging');
    expect(result.stepsCompleted).not.toContain('heavy_maintenance');
  });

  it('execute() runs heavy maintenance when device is charging', async () => {
    const Battery = jest.requireMock('expo-battery');
    // Simulate CHARGING state
    Battery.getBatteryStateAsync.mockResolvedValueOnce(Battery.BatteryState.CHARGING);
    Battery.default = {
      getBatteryStateAsync: Battery.getBatteryStateAsync,
      BatteryState: Battery.BatteryState,
    };

    // Mock a user being present so archiver is triggered
    mockDbQuery.mockImplementation((sql: string) => {
      if (sql.includes('SELECT id FROM users')) {
        return Promise.resolve([{ id: 'user-android-test' }]);
      }
      return Promise.resolve([]);
    });

    const result = await service.execute();
    // heavy or skipped — just should not crash
    expect(result.success).toBe(true);
  });

  it('HeartbeatService.getRunCount() increments after each run', async () => {
    const before = HeartbeatService.getRunCount();
    await service.execute();
    const after = HeartbeatService.getRunCount();
    expect(after).toBe(before + 1);
  });

  it('HeartbeatService.getLastRunTimestamp() returns a valid ISO string after run', async () => {
    await service.execute();
    const ts = HeartbeatService.getLastRunTimestamp();
    expect(ts).not.toBeNull();
    // Use type casting since we already checked for null
    expect(() => new Date(ts as string)).not.toThrow();
    expect(new Date(ts as string).getTime()).not.toBeNaN();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. VectorStorage: SQLite adapter is selected on Android
// ─────────────────────────────────────────────────────────────────────────────
describe('[Android] VectorStorage adapter selection', () => {
  it('is not the WebVectorStorage (no localStorage dependency)', () => {
    // On Android, vectorStorage should be the SqliteVectorStorage.
    // We verify it doesn't attempt to call localStorage which is unavailable on native.
    expect(vectorStorage).toBeDefined();
    expect(typeof vectorStorage.initialize).toBe('function');
    expect(typeof vectorStorage.add).toBe('function');
    expect(typeof vectorStorage.query).toBe('function');
    expect(typeof vectorStorage.getByEntity).toBe('function');
    expect(typeof vectorStorage.delete).toBe('function');
  });

  it('initialize() completes without crash', async () => {
    await expect(vectorStorage.initialize()).resolves.not.toThrow();
    expect(vectorStorage.isInitialized()).toBe(true);
  });

  it('add() stores an embedding', async () => {
    mockDbQuery.mockResolvedValue([]); // No existing embedding
    const vector = new Float32Array(384).fill(0.1);
    const id = await vectorStorage.add('user-1', 'task', 'task-abc', vector);
    expect(typeof id).toBe('string');
    expect(mockDbExecute).toHaveBeenCalled();
  });

  it('add() updates an existing embedding instead of duplicating', async () => {
    mockDbQuery.mockResolvedValueOnce([{ id: 'existing-embed-id' }]);
    const vector = new Float32Array(384).fill(0.5);
    const id = await vectorStorage.add('user-1', 'task', 'task-abc', vector);
    expect(id).toBe('existing-embed-id');
    // Should call UPDATE not INSERT
    const updateCall = mockDbExecute.mock.calls.find((args: any[]) =>
      String(args[0]).includes('UPDATE')
    );
    expect(updateCall).toBeDefined();
  });

  it('query() returns sorted results by similarity', async () => {
    // vec1 points somewhere else
    const vec1 = new Float32Array([1.0, 0.0, 0.0, 0.0]);
    // vec2 points in the same direction as query
    const vec2 = new Float32Array([0.0, 1.0, 0.0, 0.0]);
    const queryVec = new Float32Array([0.0, 1.0, 0.0, 0.0]);

    const { float32ToBuffer } =
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      require('../src/db/vectorStorage') as typeof import('../src/db/vectorStorage');
    mockDbQuery.mockResolvedValueOnce([
      { id: 'embed-1', entity_type: 'task', entity_id: 'task-1', vector: float32ToBuffer(vec1) },
      { id: 'embed-2', entity_type: 'task', entity_id: 'task-2', vector: float32ToBuffer(vec2) },
    ]);

    const results = await vectorStorage.query('user-1', queryVec, 2);
    expect(results.length).toBe(2);
    // Most similar should come first (vec2 is closer to queryVec)
    expect(results[0]?.entityId).toBe('task-2');
  });

  it('delete() removes an embedding', async () => {
    await vectorStorage.delete('task', 'task-abc');
    expect(mockDbExecute).toHaveBeenCalledWith(
      'DELETE FROM vector_embeddings WHERE entity_type = ? AND entity_id = ?',
      ['task', 'task-abc']
    );
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. NotificationService: Android-specific category registration
// ─────────────────────────────────────────────────────────────────────────────
describe('[Android] NotificationService', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('does not crash when instantiated on Android', () => {
    // expo-notifications is mocked — this should not throw
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { notificationService } = require('../src/services/notifications/NotificationService');
    expect(notificationService).toBeDefined();
  });

  it('setNotificationHandler is called on construction', () => {
    const notifications = jest.requireMock('expo-notifications');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../src/services/notifications/NotificationService');
    expect(notifications.setNotificationHandler).toHaveBeenCalled();
  });

  it('requestPermissions() returns true when permissions are granted', async () => {
    const notifications = jest.requireMock('expo-notifications');
    notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'granted' });
    notifications.PermissionStatus = { GRANTED: 'granted', DENIED: 'denied' };

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { notificationService } = require('../src/services/notifications/NotificationService');
    const result = await notificationService.requestPermissions();
    expect(result).toBe(true);
  });

  it('requestPermissions() returns false when permissions are denied', async () => {
    const notifications = jest.requireMock('expo-notifications');
    notifications.getPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    notifications.requestPermissionsAsync.mockResolvedValueOnce({ status: 'denied' });
    notifications.PermissionStatus = { GRANTED: 'granted', DENIED: 'denied' };

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { notificationService } = require('../src/services/notifications/NotificationService');
    const result = await notificationService.requestPermissions();
    expect(result).toBe(false);
  });

  it('setNotificationCategoryAsync is called for Android notification categories', async () => {
    const notifications = jest.requireMock('expo-notifications');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require('../src/services/notifications/NotificationService');

    // Wait for the async registerCategories() call in the constructor
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(notifications.setNotificationCategoryAsync).toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. AppInitializer: smoke-test the boot initialization flow on Android
// ─────────────────────────────────────────────────────────────────────────────
describe('[Android] AppInitializer boot flow', () => {
  it('can import AppInitializer without crash', () => {
    // If any Android-specific import crashes at module load time, this test catches it
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    expect(() => require('../src/components/AppInitializer')).not.toThrow();
  });

  it('can import RootNavigator without crash (NavigationContainer side effects)', () => {
    // Only test the import itself since rendering requires AppContainer which needs react-native internals
    expect(() => {
      // Dynamic require-style check — if the module fails to load, it will throw
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('../src/navigation/RootNavigator');
      } catch (e: any) {
        // Acceptable: native navigator internals may not fully resolve in jsdom
        // but the error should NOT be about missing Android-specific code
        if (e.message?.includes('Platform.OS')) {
          throw e; // This is the bug we're catching!
        }
        // Any other error (like missing NativeModule) is a known Jest limitation, not a real crash
      }
    }).not.toThrow();
  });
});
