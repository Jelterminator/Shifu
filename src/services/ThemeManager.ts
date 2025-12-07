import { storage } from '@utils/storage';
import type { WuXingPhase } from './PhaseManager';

type ThemeMode = 'light' | 'dark' | 'system' | 'phase-aware';

interface ThemeManagerState {
  mode: ThemeMode;
  isDark: boolean;
  currentPhase: WuXingPhase | null;
  phaseColor: string;
}

export class ThemeManager {
  private mode: ThemeMode = 'phase-aware';
  private isDark: boolean = false;
  private currentPhase: WuXingPhase | null = null;
  private phaseColor: string = ''; // Default color will be set when phase is assigned

  constructor() {
    this.loadTheme();
  }

  private loadTheme(): void {
    const savedMode = storage.get('theme_mode') as ThemeMode | null;
    if (savedMode && ['light', 'dark', 'system', 'phase-aware'].includes(savedMode)) {
      this.mode = savedMode;
    }
    this.updateTheme();
  }

  setTheme(mode: ThemeMode): void {
    this.mode = mode;
    storage.set('theme_mode', mode);
    this.updateTheme();
  }

  /**
   * Update theme based on current Wu Xing phase.
   */
  setCurrentPhase(phase: WuXingPhase): void {
    this.currentPhase = phase;
    this.phaseColor = phase.color;
    this.updateTheme();
  }

  /**
   * Get current theme configuration.
   */
  getTheme(): ThemeManagerState {
    return {
      mode: this.mode,
      isDark: this.isDark,
      currentPhase: this.currentPhase,
      phaseColor: this.phaseColor,
    };
  }

  /**
   * Get colors based on current theme and phase.
   */
  getColors(): {
    primary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  } {
    return {
      primary: this.phaseColor,
      background: this.isDark ? '#1A1A1A' : '#F8F9FA',
      surface: this.isDark ? '#2A2A2A' : '#FFFFFF',
      text: this.isDark ? '#FFFFFF' : '#1A1A1A',
      textSecondary: this.isDark ? '#B0B0B0' : '#9E9E9E',
    };
  }

  private updateTheme(): void {
    switch (this.mode) {
      case 'phase-aware':
        // Use phase color as primary, adjust brightness based on phase
        // Simple logic: Water (night hours) => Dark mode, others => Light mode
        // Or strictly check Roman Hours for night time (12-23 is night in our logic)
        if (this.currentPhase) {
          const isNight = this.currentPhase.romanHours.some(h => h >= 12);
          this.isDark = isNight;
        } else {
          this.isDark = false;
        }
        break;
      case 'dark':
        this.isDark = true;
        break;
      case 'light':
        this.isDark = false;
        break;
      case 'system':
        // Placeholder: integrate with Appearance API later
        this.isDark = false;
        break;
    }
  }
}

export const themeManager = new ThemeManager();
