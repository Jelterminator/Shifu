/**
 * tests/android-polyfills.test.ts
 * Tests the polyfills initialized in App.tsx to see if they crash on Android.
 */

jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  ReactNative.Platform.OS = 'android';
  ReactNative.Platform.select = (obj: any) => obj.android ?? obj.default;
  return ReactNative;
});

// We want expo-crypto to reflect its native Android limitations (if any)
// No mocks for expo-crypto so it tries to use the native module.

describe('[Android] App.tsx polyfills', () => {
  it('crypto polyfill does not crash when evaluated', () => {
    expect(() => {
      // Replicate the exact polyfill logic from App.tsx
      require('react-native-get-random-values');
    }).not.toThrow();
  });

  it('crypto polyfill actually works or throws gracefully when used', () => {
    // Replicate the exact polyfill logic from App.tsx
    require('react-native-get-random-values');

    // Try to use it (UUID needs this)
    const arr = new Uint8Array(16);
    expect(() => {
      global.crypto.getRandomValues(arr);
    }).not.toThrow();
  });
});
