import { create } from 'zustand';
import type { WuXingPhase } from '../services/PhaseManager';
import { storage } from '../utils/storage';

type ThemeMode = 'light' | 'dark' | 'system' | 'phase-aware';

interface ThemeColors {
  primary: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
}

interface ThemeState {
  mode: ThemeMode;
  isDark: boolean;
  currentPhase: WuXingPhase | null;
  phaseColor: string;
  colors: ThemeColors;
  
  setTheme: (mode: ThemeMode) => void;
  setCurrentPhase: (phase: WuXingPhase) => void;
}

const DEFAULT_COLOR = '#4A7C59'; // WOOD

const getColors = (isDark: boolean, phaseColor: string): ThemeColors => ({
  primary: phaseColor,
  background: isDark ? '#1A1A1A' : '#F8F9FA',
  surface: isDark ? '#2A2A2A' : '#FFFFFF',
  text: isDark ? '#FFFFFF' : '#1A1A1A',
  textSecondary: isDark ? '#B0B0B0' : '#9E9E9E',
});

const calculateIsDark = (mode: ThemeMode, phase: WuXingPhase | null): boolean => {
  switch (mode) {
    case 'phase-aware':
      if (phase) {
        // Water (night hours 12-23) => Dark mode
        return phase.romanHours.some((h) => h >= 12);
      }
      return false;
    case 'dark':
      return true;
    case 'light':
      return false;
    case 'system':
      return false; // Todo: hook into Appearance
    default:
      return false;
  }
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: (storage.get('theme_mode') as ThemeMode) || 'phase-aware',
  isDark: false,
  currentPhase: null,
  phaseColor: DEFAULT_COLOR,
  colors: getColors(false, DEFAULT_COLOR),

  setTheme: (mode) => {
    const { currentPhase } = get();
    const isDark = calculateIsDark(mode, currentPhase);
    const phaseColor = currentPhase ? currentPhase.color : DEFAULT_COLOR;
    
    storage.set('theme_mode', mode);
    
    set({
      mode,
      isDark,
      colors: getColors(isDark, phaseColor),
    });
  },

  setCurrentPhase: (phase) => {
    const { mode } = get();
    const isDark = calculateIsDark(mode, phase);
    const phaseColor = phase.color;

    set({
      currentPhase: phase,
      isDark,
      phaseColor,
      colors: getColors(isDark, phaseColor),
    });
  },
}));
