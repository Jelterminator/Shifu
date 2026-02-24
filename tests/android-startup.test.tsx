/**
 * android-startup.test.tsx
 *
 * Renders <AppInitializer> (not the full App) in a simulated Android environment
 * to verify the initialization hook—DB, storage preload, user identity, and services—
 * doesn't crash or produce a permanent gray screen.
 */

// ── Suppress @testing-library/react-native host detection (requires full RN native layer) ──
jest.mock(
  '@testing-library/react-native/src/helpers/host-component-names',
  () => ({
    getHostComponentNames: jest.fn(() => ({ Text: 'Text', TextInput: 'TextInput', View: 'View' })),
  }),
  { virtual: true }
);

// ── Platform override (MUST be first) ───────────────────────────────────────
jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');
  ReactNative.Platform.OS = 'android';
  ReactNative.Platform.select = (obj: any) => obj.android ?? obj.default;
  return ReactNative;
});

// ── DB mock ──────────────────────────────────────────────────────────────────
const mockDbExecute = jest.fn().mockResolvedValue({ changes: 1, lastInsertRowId: 1 });
const mockDbQuery = jest.fn().mockResolvedValue([]);
const mockDbInitialize = jest.fn().mockResolvedValue(undefined);

jest.mock('../src/db/database', () => ({
  db: {
    get initialize() {
      return mockDbInitialize;
    },
    get query() {
      return mockDbQuery;
    },
    get execute() {
      return mockDbExecute;
    },
    transaction: jest.fn().mockImplementation(async (cb: any) => {
      await cb({ runAsync: jest.fn() });
    }),
  },
}));

jest.mock('../src/utils/storage', () => {
  const mockCache = new Map<string, string>();
  return {
    storage: {
      get: (k: string) => mockCache.get(k) ?? null,
      getString: (k: string) => mockCache.get(k),
      getBoolean: (k: string) => {
        const v = mockCache.get(k);
        return v === 'true' ? true : v === 'false' ? false : undefined;
      },
      getNumber: (k: string) => (mockCache.has(k) ? Number(mockCache.get(k)) : undefined),
      set: (k: string, v: any) => mockCache.set(k, String(v)),
      delete: (k: string) => mockCache.delete(k),
      clear: () => mockCache.clear(),
      preload: jest.fn().mockResolvedValue(undefined),
    },
  };
});

// ── All service mocks ─────────────────────────────────────────────────────────
jest.mock('../src/services/background', () => ({
  registerHeartbeatTask: jest.fn().mockResolvedValue(true),
}));

jest.mock('../src/services/data/Anchors', () => ({
  anchorsService: { initialize: jest.fn() },
}));

jest.mock('../src/services/data/PhaseManager', () => ({
  phaseManager: { initialize: jest.fn() },
}));

jest.mock('../src/services/notifications/NotificationService', () => ({
  notificationService: { requestPermissions: jest.fn().mockResolvedValue(true) },
}));

jest.mock('../src/stores/userStore', () => {
  const mockState = { user: null, setUser: jest.fn() };
  const mockStore = (selector: any): any => {
    return typeof selector === 'function' ? selector(mockState) : mockState;
  };
  mockStore.getState = () => mockState;
  return { useUserStore: mockStore };
});

import { render, waitFor } from '@testing-library/react-native';
import { Platform, Text } from 'react-native';
import { AppInitializer } from '../src/components/AppInitializer';

const ChildContent = (): React.JSX.Element => <Text testID="app-content">App Loaded</Text>;

describe('[Android] AppInitializer startup', () => {
  beforeEach(() => {
    // Reset only what we need — do not call clearAllMocks as it would wipe our mock implementations
    mockDbInitialize.mockReset().mockResolvedValue(undefined);
    mockDbQuery.mockReset().mockResolvedValue([]);
    mockDbExecute.mockReset().mockResolvedValue({ changes: 1, lastInsertRowId: 1 });
  });

  it('Platform.OS is android in this test', () => {
    expect(Platform.OS).toBe('android');
  });

  it('renders children after successful initialization (happy path)', async () => {
    const { getByTestId } = render(
      <AppInitializer>
        <ChildContent />
      </AppInitializer>
    );

    await waitFor(() => getByTestId('app-content'), { timeout: 5000 });
    expect(getByTestId('app-content')).toBeTruthy();
  });

  it('shows children even when DB throws (error recovery path)', async () => {
    mockDbInitialize.mockRejectedValueOnce(new Error('SQLite failed on Android'));

    const { getByTestId } = render(
      <AppInitializer>
        <ChildContent />
      </AppInitializer>
    );

    await waitFor(() => getByTestId('app-content'), { timeout: 5000 });
    expect(getByTestId('app-content')).toBeTruthy();
  });

  it('calls db.initialize() on boot', async () => {
    render(
      <AppInitializer>
        <ChildContent />
      </AppInitializer>
    );

    await waitFor(() => expect(mockDbInitialize).toHaveBeenCalled(), { timeout: 5000 });
  });

  it('calls storage.preload() on boot', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { storage } = require('../src/utils/storage');
    render(
      <AppInitializer>
        <ChildContent />
      </AppInitializer>
    );

    await waitFor(() => expect(storage.preload).toHaveBeenCalled(), { timeout: 5000 });
  });

  it('creates a new user if none exists in DB', async () => {
    mockDbQuery.mockResolvedValue([]);

    render(
      <AppInitializer>
        <ChildContent />
      </AppInitializer>
    );

    await waitFor(
      () =>
        expect(mockDbExecute).toHaveBeenCalledWith(
          expect.stringContaining('INSERT INTO users'),
          expect.any(Array)
        ),
      { timeout: 5000 }
    );
  });

  it('rehydrates from DB user if store is empty but DB has a user', async () => {
    mockDbQuery.mockResolvedValue([
      { id: 'db-user-1', timezone: 'Europe/Amsterdam', spiritual_practices: '[]' },
    ]);

    const { getByTestId } = render(
      <AppInitializer>
        <ChildContent />
      </AppInitializer>
    );

    await waitFor(() => getByTestId('app-content'), { timeout: 5000 });
    const insertCalls = mockDbExecute.mock.calls.filter((args: any[]) =>
      String(args[0]).includes('INSERT INTO users')
    );
    expect(insertCalls).toHaveLength(0);
  });

  it('registers the heartbeat task on Android for an onboarded user', async () => {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { registerHeartbeatTask } = require('../src/services/background');
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { storage } = require('../src/utils/storage');

    storage.getBoolean = jest.fn().mockReturnValue(true);
    storage.getString = jest.fn().mockReturnValue(undefined);

    mockDbQuery.mockResolvedValue([
      { id: 'onboarded-user', timezone: 'UTC', spiritual_practices: '[]' },
    ]);

    render(
      <AppInitializer>
        <ChildContent />
      </AppInitializer>
    );

    await waitFor(() => expect(registerHeartbeatTask).toHaveBeenCalled(), { timeout: 5000 });
  });

  it('does not get stuck in the gray-screen (ActivityIndicator) forever', async () => {
    const { queryByTestId } = render(
      <AppInitializer>
        <ChildContent />
      </AppInitializer>
    );

    await waitFor(
      () => {
        expect(queryByTestId('app-content')).toBeTruthy();
      },
      { timeout: 5000 }
    );
  });
});
