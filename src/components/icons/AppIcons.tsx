/**
 * AppIcons.tsx
 *
 * Authentic Calligraphic SVG icon components for the Shifu app.
 * Custom-crafted to exactly match the user's hand-drawn UI sketches.
 * Utilizes combined filled contour paths to include immense detail (shading,
 * grids, inner lines) while simulating genuine Shūfǎ ink pooling and brush pressure.
 */
import { Path, Svg } from 'react-native-svg';
import { PHASE_COLORS } from '../../constants/theme';
import { useThemeStore } from '../../stores/themeStore';
import * as GeneratedIcons from './AppIcons.generated';

export interface IconProps {
  color?: string;
  size?: number;
}

// InkFilter and displacement logic removed to achieve a cleaner, authentic calligraphic look
// matching the raw SVG assets precisely without artificial bleed.

// ---------------------------------------------------------------------------
// WU XING PHASE ICONS (Matched Exactly to Sketch 2 - Thick Calligraphy)
// ---------------------------------------------------------------------------

export const WoodIcon: React.FC<IconProps> = props => <GeneratedIcons.WoodIcon {...props} />;

export const FireIcon: React.FC<IconProps> = props => <GeneratedIcons.FireIcon {...props} />;

export const EarthIcon: React.FC<IconProps> = props => <GeneratedIcons.EarthIcon {...props} />;

export const MetalIcon: React.FC<IconProps> = props => <GeneratedIcons.MetalIcon {...props} />;

export const WaterIcon: React.FC<IconProps> = props => <GeneratedIcons.WaterIcon {...props} />;

// ---------------------------------------------------------------------------
// CORE TAB ICONS (Heavy Hand-drawn UI Feel)
// ---------------------------------------------------------------------------

export const AgendaIcon: React.FC<IconProps> = ({ color, size = 24 }) => {
  const themeColors = useThemeStore(state => state.colors);
  const resolvedColor = color || themeColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Page Outline - Body */}
      <Path
        fillRule="evenodd"
        d="M3 4 L21 4 L21 21 L3 21 Z M5 6 L19 6 L19 19 L5 19 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      {/* Binder Loops - Black Element */}
      <Path
        fillRule="evenodd"
        d="M6 1 L10 1 L10 5 L6 5 Z M7 2 L9 2 L9 4 L7 4 Z M14 1 L18 1 L18 5 L14 5 Z M15 2 L17 2 L17 4 L15 4 Z"
        fill={themeColors.text}
      />
      {/* Grid Lines - Black Element */}
      <Path
        d="M4 10 L20 9.5 L20 11.5 L4 12 Z M4 15 L20 14.5 L20 16.5 L4 17 Z M9 5 L9 20 L11 20 L11 5 Z M14 5 L14 20 L16 20 L16 5 Z"
        fill={themeColors.text}
      />
    </Svg>
  );
};

export const TasksIcon: React.FC<IconProps> = ({ color, size = 24 }) => {
  const themeColors = useThemeStore(state => state.colors);
  const resolvedColor = color || themeColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Checkbox Squares - Body */}
      <Path
        fillRule="evenodd"
        d="M2 3 L7 2.5 L7.5 7.5 L2.5 8 Z M3.5 4 L5.5 4 L5.5 6 L3.5 6 Z M2 10 L7 9.5 L7.5 14.5 L2.5 15 Z M3.5 11 L5.5 11 L5.5 13 L3.5 13 Z M2 17 L7 16.5 L7.5 21.5 L2.5 22 Z M3.5 18 L5.5 18 L5.5 20 L3.5 20 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      {/* Checks - Black Element */}
      <Path
        d="M2.5 5.5 L4.5 7 L8.5 2.5 L7.5 1.5 L4.5 5 L3 4 Z M2.5 12.5 L4.5 14 L8.5 9.5 L7.5 8.5 L4.5 12 L3 11 Z M2.5 19.5 L4.5 21 L8.5 16.5 L7.5 15.5 L4.5 19 L3 18 Z"
        fill={themeColors.text}
      />
      {/* List Lines - Black Element */}
      <Path
        d="M10 4.5 L22 4 L22 6 L10 6.5 Z M10 11.5 L20 11 L20 13 L10 13.5 Z M10 18.5 L21 18 L21 20 L10 20.5 Z"
        fill={themeColors.text}
      />
    </Svg>
  );
};

export const HabitsIcon: React.FC<IconProps> = ({ color, size = 24 }) => {
  const themeColors = useThemeStore(state => state.colors);
  const resolvedColor = color || themeColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Circular Arcs - Body */}
      <Path
        d="M6 6 C10 2, 18 4, 17 6 C13 3, 9 5, 6 6 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      <Path
        d="M20 9 C22 16, 15 21, 14 19 C18 20, 20 14, 20 9 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      <Path
        d="M12 21 C4 18, 2 10, 4 9 C2 12, 6 18, 12 21 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      {/* Arrowheads - Black Element */}
      <Path d="M15 2 L19 5 L15 8 L14 7 L17 5 L14 3 Z" fill={themeColors.text} />
      <Path d="M11 18 L16 21 L19 16 L17 15 L15 18 L12 16 Z" fill={themeColors.text} />
      <Path d="M3 14 L5 8 L10 11 L9 13 L6 11 L4 15 Z" fill={themeColors.text} />
    </Svg>
  );
};

export const JournalIcon: React.FC<IconProps> = ({ color, size = 24 }) => {
  const themeColors = useThemeStore(state => state.colors);
  const resolvedColor = color || themeColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Book Outline - Body */}
      <Path
        fillRule="evenodd"
        d="M11.5 2 C6 1, 2 4, 2 4 L2 20 C2 20, 6 17, 11.5 18 C17 17, 22 20, 22 20 L22 4 C22 4, 17 1, 11.5 2 Z M10.5 4.5 C7 4, 4 5.5, 4 5.5 L4 17.5 C4 17.5, 7 16, 10.5 16.5 L10.5 4.5 Z M12.5 4.5 L12.5 16.5 C16 16, 19 17.5, 19 17.5 L19 5.5 C19 5.5, 16 4, 12.5 4.5 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      {/* Page Lines - Black Element */}
      <Path
        d="M5 7 L9 6.5 L9 8.5 L5 9 Z M5 10 L9 9.5 L9 11.5 L5 12 Z M5 13 L9 12.5 L9 14.5 L5 15 Z M14 6.5 L18 7 L18 9 L14 8.5 Z M14 9.5 L18 10 L18 12 L14 11.5 Z M14 12.5 L18 13 L18 15 L14 14.5 Z"
        fill={themeColors.text}
      />
    </Svg>
  );
};

export const ChatIcon: React.FC<IconProps> = ({ color, size = 24 }) => {
  const themeColors = useThemeStore(state => state.colors);
  const resolvedColor = color || themeColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Chat Bubble - Body */}
      <Path
        fillRule="evenodd"
        d="M3 6 C3 1, 21 1, 21 8 C21 15, 15 18, 9 17 L2 22 L4 15 C2 13, 1 9, 3 6 Z M5 7 C4 10, 5 12, 6 13.5 L5 18 L9 15 C13 16, 18 13, 19 9 C20 4, 6 3, 5 7 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      {/* Speech Lines - Black Element */}
      <Path
        d="M7 7 L17 6 L17 8 L7 9 Z M8 10 L16 9 L16 11 L8 12 Z M9 13 L14 12 L14 14 L9 15 Z"
        fill={themeColors.text}
      />
    </Svg>
  );
};

export const BotIcon: React.FC<IconProps> = ({ color, size = 24 }) => {
  const themeColors = useThemeStore(state => state.colors);
  const resolvedColor = color || themeColors.text; // Default to text color for bot
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Face Outline & Chin - Body */}
      <Path
        d="M3 8 C10 6, 14 6, 21 8 L21 11 C14 8.5, 10 8.5, 3 11 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      <Path
        d="M12 15 C9 17, 7 20, 5 22 C8 19, 10 18, 12 17 Z M12 15 C15 17, 17 20, 19 22 C16 19, 14 18, 12 17 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      {/* Topknot, Eyes, Chin Point - Black Elements */}
      <Path
        fillRule="evenodd"
        d="M8 4 C8 1, 16 1, 16 4 C16 6, 8 6, 8 4 Z M10 3.5 C10 2.5, 14 2.5, 14 3.5 C14 4.5, 10 4.5, 10 3.5 Z"
        fill={themeColors.text}
      />
      <Path
        d="M5 14 C7 11.5, 9 11.5, 11 14 C9 12.5, 7 12.5, 5 14 Z M13 14 C15 11.5, 17 11.5, 19 14 C17 12.5, 15 12.5, 13 14 Z"
        fill={themeColors.text}
      />
      <Path
        d="M11 18 L13 18 C13 21, 12.5 24, 12 24 C11.5 24, 11 21, 11 18 Z"
        fill={themeColors.text}
      />
    </Svg>
  );
};

// ---------------------------------------------------------------------------
// UTILITY & LIST ICONS
// ---------------------------------------------------------------------------

export const SettingsIcon: React.FC<IconProps> = ({ color, size = 24 }) => {
  const themeColors = useThemeStore(state => state.colors);
  const resolvedColor = color || themeColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Gear Main - Body */}
      <Path
        fillRule="evenodd"
        d="M9 4 L15 4 L18 9 L15 19 L9 20 L5 14 Z M10 6 L6.5 13 L10 17 L14 16 L16 10 L13 5 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      {/* Gear Teeth & Secondary - Black Element */}
      <Path
        d="M11 0 L14 0 L13 5 L12 5 Z M19 4 L23 6 L18 9 L17 8 Z M20 13 L24 16 L18 17 L17 16 Z M14 20 L16 24 L11 23 L12 21 Z M5 18 L1 21 L5 16 L6 17 Z M2 10 L0 6 L6 7 L6 8 Z"
        fill={themeColors.text}
      />
      {/* Inner Hub - Black Element */}
      <Path
        fillRule="evenodd"
        d="M10 10 C14 10, 14 14, 10 14 C6 14, 6 10, 10 10 Z M10.5 11 C8 11, 8 13, 10.5 13 C13 13, 13 11, 10.5 11 Z"
        fill={themeColors.text}
      />
    </Svg>
  );
};

export const HomeIcon: React.FC<IconProps> = ({ color, size = 24 }) => {
  const themeColors = useThemeStore(state => state.colors);
  const resolvedColor = color || themeColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Roof & Walls - Body */}
      <Path
        d="M12 2 L3 11 L5 13 L12 6 L19 13 L21 11 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      <Path
        d="M6 10 L8 10 L8 18 L6 18 Z M16 10 L18 10 L18 18 L16 18 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      {/* Ground & Door - Black Elements */}
      <Path d="M1 18 L23 17 L23 20 L1 21 Z" fill={themeColors.text} />
      <Path d="M11 12 L13 12 L13 18 L11 18 Z" fill={themeColors.text} />
    </Svg>
  );
};

export const DumbbellIcon: React.FC<IconProps> = ({ color, size = 24 }) => {
  const themeColors = useThemeStore(state => state.colors);
  const resolvedColor = color || themeColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Main Plates - Body */}
      <Path
        d="M6 6 L9 6 L8 18 L5 17 Z M15 6 L18 6 L19 18 L16 18 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      {/* Handle Bar - Black Element */}
      <Path d="M4 11 L20 10 L20 13 L4 14 Z" fill={themeColors.text} />
      {/* Outer Weights - Black Element */}
      <Path d="M2 8 L5 8 L4 16 L1 15 Z M19 7 L22 8 L23 16 L20 15 Z" fill={themeColors.text} />
    </Svg>
  );
};

export const ListIcon: React.FC<IconProps> = ({ color, size = 24 }) => {
  const themeColors = useThemeStore(state => state.colors);
  const resolvedColor = color || themeColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* List Lines - Body */}
      <Path
        d="M8 5 L21 4 L21 7 L8 8 Z M8 11 L20 10 L20 13 L8 14 Z M8 17 L21 16 L21 19 L8 20 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      {/* Bullet Points - Black Element */}
      <Path
        d="M3 5 C5 4, 6 6, 4 7 C2 8, 1 5, 3 5 Z M3 11 C5 10, 6 12, 4 13 C2 14, 1 11, 3 11 Z M3 17 C5 16, 6 18, 4 19 C2 20, 1 17, 3 17 Z"
        fill={themeColors.text}
      />
    </Svg>
  );
};

export const CheckCircleIcon: React.FC<IconProps> = ({ color, size = 64 }) => {
  const themeColors = useThemeStore(state => state.colors);
  const resolvedColor = color || themeColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        d="M12 1 C5 1, 1 5, 1 12 C1 19, 5 23, 12 23 C19 23, 23 19, 23 12 C23 5, 19 1, 12 1 Z M12 3 C17 3, 20 6, 20 12 C20 18, 17 21, 12 21 C7 21, 3 18, 3 12 C3 6, 7 3, 12 3 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      <Path d="M6 12 L10 16 L18 7 L16 5 L9 13 L7 10 Z" fill={themeColors.text} />
    </Svg>
  );
};

export const ComputerIcon: React.FC<IconProps> = ({ color, size = 24 }) => {
  const themeColors = useThemeStore(state => state.colors);
  const resolvedColor = color || themeColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        d="M2 3 L22 3 L21 16 L3 17 Z M4 5 L20 5 L19 14 L5 15 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      <Path d="M11 16 L13 16 L13 20 L11 20 Z" fill={themeColors.text} />
      <Path d="M7 19 L17 19 L18 21 L6 22 Z" fill={themeColors.text} />
    </Svg>
  );
};

export const UrgentIcon: React.FC<IconProps> = ({ color, size = 16 }) => {
  const resolvedColor = color || PHASE_COLORS.FIRE.primary;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M10 2 L14 2 L13 15 L11 15 Z" fill={resolvedColor} />
      <Path d="M10 19 C14 18, 15 22, 11 23 C8 22, 8 19, 10 19 Z" fill={resolvedColor} />
    </Svg>
  );
};

export const TimerIcon: React.FC<IconProps> = ({ color, size = 16 }) => {
  const themeColors = useThemeStore(state => state.colors);
  const resolvedColor = color || themeColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 2 L20 2 L20 5 L4 5 Z M4 19 L20 19 L20 22 L4 22 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      <Path
        fillRule="evenodd"
        d="M5 5 L12 12 L19 5 L16 5 L12 9 L8 5 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      <Path
        fillRule="evenodd"
        d="M12 12 L19 19 L5 19 L8 19 L12 15 L16 19 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      <Path d="M10 16 L14 16 L13 19 L11 19 Z M11 5 L13 5 L12 8 Z" fill={themeColors.text} />
    </Svg>
  );
};

export const BoltIcon: React.FC<IconProps> = ({ color, size = 24 }) => {
  const themeColors = useThemeStore(state => state.colors);
  const resolvedColor = color || themeColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14 2 L8 12 L12 13 L9 22 L17 11 L13 10 Z" fill={resolvedColor} />
    </Svg>
  );
};

export const SendIcon: React.FC<IconProps> = ({ color, size = 24 }) => {
  const themeColors = useThemeStore(state => state.colors);
  const resolvedColor = color || themeColors.background;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        d="M3 10 L21 3 L13 21 L10 14 L3 10 Z M6 10 L18 5 L12 18 L10 13 L6 10 Z M10 13 L15 8 L11 14 Z"
        fill={resolvedColor}
      />
    </Svg>
  );
};

export const SuitcaseIcon: React.FC<IconProps> = ({ color, size = 24 }) => {
  const themeColors = useThemeStore(state => state.colors);
  const resolvedColor = color || themeColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        d="M9 3 L15 3 L15 6 L9 6 Z M11 5 L13 5 L13 6 L11 6 Z"
        fill={themeColors.text}
      />
      <Path
        fillRule="evenodd"
        d="M3 7 L21 7 L20 19 L4 19 Z M5 9 L19 9 L18 17 L6 17 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      <Path d="M7 7 L9 7 L9 19 L7 19 Z M15 7 L17 7 L17 19 L15 19 Z" fill={themeColors.text} />
    </Svg>
  );
};

export const PrayerIcon: React.FC<IconProps> = ({ color, size = 24 }) => {
  const themeColors = useThemeStore(state => state.colors);
  const resolvedColor = color || themeColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 22 L11 15 L9 13 L2 20 Z M20 22 L13 15 L15 13 L22 20 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      <Path
        d="M1 18 L5 16 L7 19 L3 21 Z M23 18 L19 16 L17 19 L21 21 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      <Path
        fillRule="evenodd"
        d="M12 4 C9 6, 9 13, 11 15 L13 15 C15 13, 15 6, 12 4 Z M12 6 C13 8, 13 12, 12 13 C11 12, 11 8, 12 6 Z"
        fill={themeColors.text}
      />
    </Svg>
  );
};

export const LightbulbIcon: React.FC<IconProps> = ({ color, size = 24 }) => {
  const themeColors = useThemeStore(state => state.colors);
  const resolvedColor = color || themeColors.text;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        fillRule="evenodd"
        d="M12 1 C6 1, 4 7, 8 14 L9 16 L15 16 L16 14 C20 7, 18 1, 12 1 Z M12 3 C16 3, 17 7, 14 13 L10 13 C7 7, 8 3, 12 3 Z"
        fill={resolvedColor}
        fillOpacity={color ? 0.8 : 0.4}
      />
      <Path
        d="M11 6 C8 8, 8 12, 10 15 L11 15 C9 12, 10 9, 11 8 Z M13 6 C16 8, 16 12, 14 15 L13 15 C15 12, 14 9, 13 8 Z"
        fill={themeColors.text}
      />
      <Path
        d="M8 17 L16 17 L15 19 L9 19 Z M9 20 L15 20 L14 22 L10 22 Z M10 23 L14 23 L13 24 L11 24 Z"
        fill={themeColors.text}
      />
    </Svg>
  );
};

// ---------------------------------------------------------------------------
// LOOKUP MAPS
// ---------------------------------------------------------------------------

export const StreakIcon: React.FC<IconProps> = ({ color, size = 16 }) => {
  const resolvedColor = color || PHASE_COLORS.FIRE.primary;
  return <FireIcon color={resolvedColor} size={size} />;
};

export const PHASE_ICON_COMPONENTS: Record<string, React.FC<IconProps>> = {
  WOOD: WoodIcon,
  FIRE: FireIcon,
  EARTH: EarthIcon,
  METAL: MetalIcon,
  WATER: WaterIcon,
};

export const TAB_ICONS: Record<string, React.FC<IconProps>> = {
  Agenda: AgendaIcon,
  Tasks: TasksIcon,
  Habits: HabitsIcon,
  Journal: JournalIcon,
  Chat: ChatIcon,
};

export const LIST_ICONS: Record<string, React.FC<IconProps>> = {
  work: SuitcaseIcon,
  home: HomeIcon,
  computer: ComputerIcon,
  fitness: DumbbellIcon,
  prayer: PrayerIcon,
  default: ListIcon,
};

export const LIST_ICON_KEYS: { key: string; label: string }[] = [
  { key: 'work', label: 'Work' },
  { key: 'home', label: 'Home' },
  { key: 'computer', label: 'Computer' },
  { key: 'fitness', label: 'Fitness' },
  { key: 'prayer', label: 'Spirit' },
];
