/**
 * android-imports.test.ts
 * Tests whether requiring key files on Android causes a synchronous top-level crash.
 */

// ── Platform override ────────────────────────────────────────────────────────
jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  ReactNative.Platform.OS = 'android';
  ReactNative.Platform.select = (obj: any) => obj.android ?? obj.default;
  return ReactNative;
});

// Mock react-native-screens to prevent complex native component dependency loops
jest.mock('react-native-screens', () => {
  const View = require('react-native').View;
  return {
    enableScreens: jest.fn(),
    screensEnabled: jest.fn(() => false),
    ScreenContainer: View,
    Screen: View,
    NativeScreen: View,
    NativeScreenContainer: View,
    ScreenStack: View,
    ScreenStackHeaderConfig: View,
    ScreenStackHeaderLeftView: View,
    ScreenStackHeaderCenterView: View,
    ScreenStackHeaderRightView: View,
    ScreenStackHeaderSubview: View,
    SearchBar: View,
    FullWindowOverlay: View,
  };
});

// Mock navigation packages to avoid ESM/SyntaxErrors in node_modules during import tests
jest.mock('@react-navigation/native', () => ({
  NavigationContainer: ({ children }: any) => children,
  useNavigation: () => ({ navigate: jest.fn() }),
  useRoute: () => ({ params: {} }),
  useFocusEffect: jest.fn(),
  createNavigationContainerRef: jest.fn(),
}));

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: jest.fn(() => ({
    Navigator: ({ children }: any) => children,
    Screen: () => null,
  })),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: jest.fn(() => ({
    Navigator: ({ children }: any) => children,
    Screen: () => null,
  })),
}));

// Mock expo-location to avoid ESM/SyntaxErrors
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  PermissionStatus: { GRANTED: 'granted' },
}));

// We are intentionally NOT mocking `expo-*` modules here to see if their
// top-level code throws an exception when the native module is missing.

describe('[Android] Top-Level Imports', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('App.tsx imports without crashing', () => {
    expect(() => require('../App.tsx')).not.toThrow();
  });

  it('src/utils/storage.ts imports without crashing', () => {
    expect(() => require('../src/utils/storage')).not.toThrow();
  });

  it('src/db/database.ts imports without crashing', () => {
    expect(() => require('../src/db/database')).not.toThrow();
  });

  it('src/services/background/BackgroundTaskSetup.ts imports without crashing', () => {
    expect(() => require('../src/services/background/BackgroundTaskSetup')).not.toThrow();
  });

  it('src/services/notifications/NotificationService.ts imports without crashing', () => {
    expect(() => require('../src/services/notifications/NotificationService')).not.toThrow();
  });

  it('src/services/data/PhaseManager.ts imports without crashing', () => {
    expect(() => require('../src/services/data/PhaseManager')).not.toThrow();
  });

  it('src/components/AppInitializer.tsx imports without crashing', () => {
    expect(() => require('../src/components/AppInitializer')).not.toThrow();
  });
});
