import { useThemeStore } from '../../src/stores/themeStore';
import { storage } from '../../src/utils/storage';

// Mock storage
jest.mock('../../src/utils/storage', () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
  },
}));

describe('themeStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state? Zustand mocks can be tricky.
    // For simple testing we iterate on the hook/store actions.
    const { setTheme } = useThemeStore.getState();
    setTheme('phase-aware'); // Reset to default
  });

  it('should update mode and persist', () => {
    const { setTheme } = useThemeStore.getState();
    setTheme('dark');

    const state = useThemeStore.getState();
    expect(state.mode).toBe('dark');
    expect(state.isDark).toBe(true);
    expect(storage.set).toHaveBeenCalledWith('theme_mode', 'dark');
  });

  it('should update phase and adjust isDark', () => {
    const { setCurrentPhase } = useThemeStore.getState();
    const mockNightPhase = {
      name: 'WATER',
      startTime: new Date(),
      endTime: new Date(),
      color: '#Blue',
      romanHours: [13, 14], // Night hours
      qualities: '',
      idealTasks: [],
    };

    // @ts-expect-error - Testing improper input type for resilience
    setCurrentPhase(mockNightPhase);
    const state = useThemeStore.getState();

    expect(state.phaseColor).toBe('#Blue');
    expect(state.isDark).toBe(true);
  });
});
