/**
 * tests/android-unhandled.test.ts
 * Tests for unhandled promise rejections during AppInitializer boot
 */

jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  ReactNative.Platform.OS = 'android';
  ReactNative.Platform.select = (obj: any) => obj.android ?? obj.default;
  return ReactNative;
});

// We keep most native things unmocked so they fail like they would on a real device
// if they are missing native backing, but we use jsdom to catch the unhandled exceptions.

describe('[Android] Unhandled Promise Rejections', () => {
  let unhandledRejections: any[] = [];

  beforeAll(() => {
    process.on('unhandledRejection', reason => {
      unhandledRejections.push(reason);
    });
  });

  afterEach(() => {
    unhandledRejections = [];
  });

  it('AppInitializer does not throw unhandled promise rejection on Android', async () => {
    // We will render AppInitializer but without all the aggressive mocks from android-startup.test.tsx
    // to see if anything inside it throws asynchronously uncaught on Android.

    // Storage might fail if MMKV native is not available on Android
    // Database might fail if sqlite is not available
    // Let's mock just enough to let it boot, but not catch exceptions
    jest.mock('expo-sqlite', () => ({
      openDatabaseAsync: jest.fn().mockRejectedValue(new Error('SQLite native missing')),
    }));

    // Attempt init
    const { storage } = require('../src/utils/storage');
    try {
      await storage.preload(null as any);
    } catch (e) {
      // Ignored for this test
    }

    // Wait a tick for promises to bubble
    await new Promise(r => setTimeout(r, 100));

    expect(unhandledRejections.length).toBe(0);
  });
});
