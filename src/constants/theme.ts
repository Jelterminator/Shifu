import { Platform } from 'react-native';

/**
 * Theme constants for the Shifu app
 * Based on DESIGN.md specifications
 */

/**
 * Wu Xing Phase Colors - Each phase has primary, light, and dark variants
 */
export const PHASE_COLORS = {
  WOOD: { primary: '#4A7C59', light: '#7FA88E', dark: '#2D5A3A' },
  FIRE: { primary: '#E63946', light: '#FF6B78', dark: '#B8252F' },
  EARTH: { primary: '#C49551', light: '#E0B478', dark: '#9A7138' },
  METAL: { primary: '#A8AAAD', light: '#D1D3D6', dark: '#6F7175' },
  WATER: { primary: '#457B9D', light: '#6B9FBF', dark: '#2D5571' },
} as const;

/**
 * Phase icons for display
 */
export const PHASE_ICONS: Record<string, string> = {
  WOOD: '🌳',
  FIRE: '🔥',
  EARTH: '🟤',
  METAL: '⚪',
  WATER: '💧',
};

/**
 * Neutral colors for backgrounds and text
 */
export const NEUTRAL_COLORS = {
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  divider: '#E0E0E0',
  disabled: '#9E9E9E',
} as const;

/**
 * Semantic colors for status indicators
 */
export const SEMANTIC_COLORS = {
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',
} as const;

/**
 * Mood colors for journal ratings (1-5 stars)
 */
export const MOOD_COLORS: Record<number, string> = {
  1: '#F44336', // Red - Depressed
  2: '#FF9800', // Orange - Low
  3: '#FFC107', // Yellow - Neutral
  4: '#8BC34A', // Light Green - Good
  5: '#4CAF50', // Green - Ecstatic
};

/**
 * Urgency tier colors for tasks (T1-T6)
 */
export const URGENCY_COLORS = {
  T1: '#F44336', // Critical - Red
  T2: '#FF9800', // High - Orange
  T3: '#FFC107', // Medium - Yellow
  T4: '#4CAF50', // Normal - Green
  T5: '#2196F3', // Low - Blue
  T6: '#9E9E9E', // Chores - Gray
} as const;

/**
 * Typography scale
 */
export const TYPOGRAPHY = {
  display: { fontSize: 32, fontWeight: '700' as const },
  heading1: { fontSize: 24, fontWeight: '700' as const },
  heading2: { fontSize: 20, fontWeight: '600' as const },
  heading3: { fontSize: 18, fontWeight: '600' as const },
  bodyLarge: { fontSize: 16, fontWeight: '400' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  bodySmall: { fontSize: 12, fontWeight: '400' as const },
  caption: { fontSize: 11, fontWeight: '400' as const },
} as const;

/**
 * Spacing scale (base unit: 4px)
 */
export const SPACING = {
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
} as const;

/**
 * Shadow levels for elevation
 * Using Platform.select to avoid deprecation warnings on web
 */
export const SHADOWS = {
  level0: {},
  level1: Platform.select({
    web: { boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.06)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
  }),
  level2: Platform.select({
    web: { boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.08)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
  }),
  level3: Platform.select({
    web: { boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.12)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  }),
  level4: Platform.select({
    web: { boxShadow: '0px 16px 32px rgba(0, 0, 0, 0.16)' },
    default: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.16,
      shadowRadius: 32,
      elevation: 16,
    },
  }),
};

/**
 * Border radius values
 */
export const BORDER_RADIUS = {
  small: 4,
  medium: 8,
  large: 16,
  circle: 999,
} as const;

/**
 * Days of the week abbreviations
 */
export const WEEKDAY_ABBREVIATIONS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

/**
 * Days lookup array
 */
export const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

/**
 * Phases lookup array
 */
export const PHASES = ['WOOD', 'FIRE', 'EARTH', 'METAL', 'WATER'] as const;

/**
 * Component dimensions
 */
export const DIMENSIONS = {
  BAR_HEIGHT: 60,
} as const;
