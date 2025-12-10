import { useThemeStore } from '../../src/stores/themeStore';
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

describe('themeStore', () => {
  const DEFAULT_COLOR = '#4A7C59';

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state by re-creating or manually resetting
    // Since useThemeStore is a global singleton-like hook in this setup,
    // we need to be careful. The `createStore` implementation might persist state.
    // For this test, we rely on public setters to clean up if needed, or assume isolation if Jest resets modules.
    // Ideally, `createStore` would export a way to reset.
    // For now, we just test the transitions.
  });

  it('should initialize with default values', () => {
    const state = useThemeStore.getState();
    expect(state.mode).toBeDefined(); // 'phase-aware' default
    expect(state.colors).toBeDefined();
    expect(state.phaseColor).toBe(DEFAULT_COLOR);
  });

  it('should toggle theme mode', () => {
    const store = useThemeStore.getState();

    // Switch to dark
    store.setTheme('dark');
    const darkState = useThemeStore.getState();
    expect(darkState.mode).toBe('dark');
    expect(darkState.isDark).toBe(true);
    expect(storage.set).toHaveBeenCalledWith('theme_mode', 'dark');

    // Switch to light
    store.setTheme('light');
    const lightState = useThemeStore.getState();
    expect(lightState.mode).toBe('light');
    expect(lightState.isDark).toBe(false);
  });

  it('should handle phase-aware updates', () => {
    const store = useThemeStore.getState();
    store.setTheme('phase-aware');

    const mockPhase = {
      name: 'WATER',
      romanHours: [22, 23], // Late night
      color: '#0000FF',
      startTime: new Date(),
      endTime: new Date(),
    };

    // @ts-expect-error - mock partial phase
    store.setCurrentPhase(mockPhase);

    const state = useThemeStore.getState();
    expect(state.currentPhase).toBe(mockPhase);
    expect(state.phaseColor).toBe('#0000FF');
    // Water phase at night should trigger dark mode if logic holds
    // implementation: phase.romanHours.some(h => h >= 12) -> 22 >= 12 is true.
    expect(state.isDark).toBe(true);
  });
});
