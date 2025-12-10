import { useUserStore } from '../../src/stores/userStore';
import { storage } from '../../src/utils/storage';

// Mock storage
jest.mock('../../src/utils/storage', () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
    getBoolean: jest.fn(),
    getString: jest.fn(),
  },
}));

describe('userStore', () => {
  const TEST_USER = {
    id: 'test-id',
    name: 'Test User',
    email: 'test@example.com',
    timezone: 'UTC',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with default empty user', () => {
    const state = useUserStore.getState();
    expect(state.user.id).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });

  it('should set user and update state', () => {
    const store = useUserStore.getState();

    store.setUser(TEST_USER);

    const newState = useUserStore.getState();
    expect(newState.user).toEqual(TEST_USER);
    expect(newState.isAuthenticated).toBe(true);
    // Check storage persistence
    expect(storage.set).toHaveBeenCalled();
  });

  it('should clear user on logout', () => {
    const store = useUserStore.getState();
    store.setUser(TEST_USER);

    // now clear
    store.clearUser();

    const newState = useUserStore.getState();
    expect(newState.user.id).toBeNull();
    expect(newState.isAuthenticated).toBe(false);
  });
});
