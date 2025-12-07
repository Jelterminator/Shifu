import { ThemeManager } from '../../src/services/ThemeManager';
import { storage } from '../../src/utils/storage';

// Mock storage
jest.mock('../../src/utils/storage', () => ({
  storage: {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clear: jest.fn(),
  },
}));

describe('ThemeManager', () => {
  let themeManager: ThemeManager;

  beforeEach(() => {
    jest.clearAllMocks();
    themeManager = new ThemeManager();
  });

  it('should load theme from storage on init', () => {
    (storage.get as jest.Mock).mockReturnValue('dark');
    const newManager = new ThemeManager(); // Re-init to trigger constructor
    expect(newManager.getTheme().mode).toBe('dark');
    expect(newManager.getTheme().isDark).toBe(true);
  });

  it('should set theme and persist', () => {
    themeManager.setTheme('light');
    expect(storage.set).toHaveBeenCalledWith('theme_mode', 'light');
    expect(themeManager.getTheme().mode).toBe('light');
    expect(themeManager.getTheme().isDark).toBe(false);
  });

  it('should update colors based on phase in phase-aware mode', () => {
    themeManager.setTheme('phase-aware');
    
    const mockNightPhase = {
        name: 'WATER',
        startTime: new Date(),
        endTime: new Date(),
        color: '#Blue',
        romanHours: [13, 14], // Night hours
        qualities: '',
        idealTasks: []    
    };

    // @ts-ignore
    themeManager.setCurrentPhase(mockNightPhase);
    
    const theme = themeManager.getTheme();
    expect(theme.isDark).toBe(true); // Night hours -> Dark
    expect(theme.phaseColor).toBe('#Blue');
    
    // Check colors
    const colors = themeManager.getColors();
    expect(colors.primary).toBe('#Blue');
    expect(colors.background).toBe('#1A1A1A'); // Dark bg
  });
});
