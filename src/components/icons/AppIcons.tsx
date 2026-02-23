/**
 * AppIcons.tsx
 *
 * Refined Modern Minimalist SVG icon components for the Shifu app.
 * drop-in replacement for the original file.
 */
import React from 'react';
import { Circle, G, Line, Path, Rect, Svg } from 'react-native-svg';

export interface IconProps {
  color?: string;
  size?: number;
}

// ---------------------------------------------------------------------------
// TAB BAR ICONS
// ---------------------------------------------------------------------------

export const AgendaIcon: React.FC<IconProps> = ({ color = '#000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="4" width="18" height="17" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M3 9h18M9 2v4M15 2v4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <Path
      d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01M16 17h.01"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </Svg>
);

export const TasksIcon: React.FC<IconProps> = ({ color = '#000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const HabitsIcon: React.FC<IconProps> = ({ color = '#000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <G stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* Arrow 1 */}
      <G transform="rotate(0 12 12)">
        <Path d="M 12 4 A 8 8 0 0 1 20 12" />
        {/* Asymmetrical wings force the arrowhead to align with the circular curve */}
        <Path d="M 21.8 10.2 L 20 12 L 17.4 9.4" />
      </G>
      {/* Arrow 2 */}
      <G transform="rotate(120 12 12)">
        <Path d="M 12 4 A 8 8 0 0 1 20 12" />
        <Path d="M 21.8 10.2 L 20 12 L 17.4 9.4" />
      </G>
      {/* Arrow 3 */}
      <G transform="rotate(240 12 12)">
        <Path d="M 12 4 A 8 8 0 0 1 20 12" />
        <Path d="M 21.8 10.2 L 20 12 L 17.4 9.4" />
      </G>
    </G>
  </Svg>
);

export const JournalIcon: React.FC<IconProps> = ({ color = '#000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path d="M8 7h6M8 11h8" stroke={color} strokeWidth="2" strokeLinecap="round" opacity={0.3} />
  </Svg>
);

export const ChatIcon: React.FC<IconProps> = ({ color = '#000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ---------------------------------------------------------------------------
// WU XING PHASE ICONS
// ---------------------------------------------------------------------------

export const WoodIcon: React.FC<IconProps> = ({ color = '#4A7C59', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2v15M12 7l6 3M12 12l-5 3M9 21h6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" opacity={0.15} />
  </Svg>
);

export const FireIcon: React.FC<IconProps> = ({ color = '#E63946', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 22a7 7 0 0 0 7-7c0-4-3.5-7-6-12-1 3-2 5-2 6-1-1-2-1-3-1-3 2-4 5-4 8a7 7 0 0 0 8 6z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const EarthIcon: React.FC<IconProps> = ({ color = '#C49551', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 20h20M5 15h14M8 10h8M11 5h2"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </Svg>
);

export const MetalIcon: React.FC<IconProps> = ({ color = '#A8AAAD', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <Rect
      x="9"
      y="9"
      width="6"
      height="6"
      rx="1"
      stroke={color}
      strokeWidth="2"
      fill={color}
      fillOpacity={0.15}
    />
  </Svg>
);

export const WaterIcon: React.FC<IconProps> = ({ color = '#457B9D', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M2 12c2-2 3 2 5 0s3-2 5 0 3 2 5 0 3-2 5 0M2 17c2-2 3 2 5 0s3-2 5 0 3 2 5 0 3-2 5 0M2 7c2-2 3 2 5 0s3-2 5 0 3 2 5 0 3-2 5 0"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

// ---------------------------------------------------------------------------
// STREAK / MISC ICONS
// ---------------------------------------------------------------------------

export const StreakIcon: React.FC<IconProps> = ({ color = '#E63946', size = 16 }) => (
  <FireIcon color={color} size={size} />
);

export const TimerIcon: React.FC<IconProps> = ({ color = '#000', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 2h12M6 22h12M7 22c0-5 2-7 5-10 3 3 5 5 5 10M7 2c0 5 2 7 5 10 3-3 5-5 5-10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const BoltIcon: React.FC<IconProps> = ({ color = '#000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"
      stroke={color}
      strokeWidth="2"
      fill={color}
      fillOpacity={0.15}
      strokeLinejoin="round"
    />
  </Svg>
);

export const ListIcon: React.FC<IconProps> = ({ color = '#000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="5" width="18" height="14" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M7 10h10M7 14h6" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const BotIcon: React.FC<IconProps> = ({ color = '#000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Top Bun */}
    <Circle cx="12" cy="3.5" r="2.5" fill={color} />
    {/* Side Hair flowing down to frame the negative-space face */}
    <Path
      d="M9.5 4.5 C 7 5.5, 4.5 8, 4.5 13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    <Path
      d="M14.5 4.5 C 17 5.5, 19.5 8, 19.5 13"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Wise Eyebrows */}
    <Path
      d="M6 10c1.5-1 3.5-1 4.5 0M18 10c-1.5-1-3.5-1-4.5 0"
      stroke={color}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Long Drooping Mustache */}
    <Path
      d="M12 14c-1.5 0-3.5 1-6 6M12 14c1.5 0 3.5 1 6 6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Pointed Beard */}
    <Path d="M12 15l-1.5 5 1.5 3 1.5-3z" fill={color} />
  </Svg>
);

export const SendIcon: React.FC<IconProps> = ({ color = '#fff', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const CheckCircleIcon: React.FC<IconProps> = ({ color = '#000', size = 64 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2" fill={color} fillOpacity={0.05} />
    <Path
      d="M8 12l3 3 5-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const SettingsIcon: React.FC<IconProps> = ({ color = '#000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    <Path
      d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
      stroke={color}
      strokeWidth="2"
    />
  </Svg>
);

export const LightbulbIcon: React.FC<IconProps> = ({ color = '#000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M9 18h6m-3 3v-3m0-16a7 7 0 0 1 7 7c0 2.5-2 4.5-3 6h-8c-1-1.5-3-3.5-3-6a7 7 0 0 1 7-7z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export const UrgentIcon: React.FC<IconProps> = ({ color = '#E63946', size = 16 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Outer Ring with subtle background tint */}
    <Circle cx="12" cy="12" r="10" fill={color} fillOpacity={0.15} stroke={color} strokeWidth="2" />

    {/* Exclamation Line */}
    <Line x1="12" y1="7" x2="12" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />

    {/* Exclamation Dot */}
    <Circle cx="12" cy="17" r="1.25" fill={color} />
  </Svg>
);

export const SuitcaseIcon: React.FC<IconProps> = ({ color = '#000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="3" y="7" width="18" height="13" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" stroke={color} strokeWidth="2" />
  </Svg>
);

export const HomeIcon: React.FC<IconProps> = ({ color = '#000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Roof and walls separated to guarantee pixel-perfect alignment */}
    <Path
      d="M3 10L12 3l9 7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 10v11h14V10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 21v-6h6v6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ComputerIcon: React.FC<IconProps> = ({ color = '#000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="3" width="20" height="13" rx="2" stroke={color} strokeWidth="2" />
    <Path d="M7 21h10M12 16v5" stroke={color} strokeWidth="2" strokeLinecap="round" />
  </Svg>
);

export const DumbbellIcon: React.FC<IconProps> = ({ color = '#000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M6 12h12M2 8h4v8H2V8zm18 0h4v8h-4V8zM6 10h2v4H6v-4zm10 0h2v4h-2v-4z"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
  </Svg>
);

export const PrayerIcon: React.FC<IconProps> = ({ color = '#000', size = 24 }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Minimalist folded hands pointing upward */}
    <Path
      d="M8 21v-4c0-1.5 1-3 2.5-4L12 11l1.5 2c1.5 1 2.5 2.5 2.5 4v4"
      stroke={color}
      strokeWidth="2"
      strokeLinejoin="round"
    />
    <Path
      d="M12 11V4a1 1 0 0 0-2 0v7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 11V4a1 1 0 0 1 2 0v7"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// ---------------------------------------------------------------------------
// LOOKUP MAPS
// ---------------------------------------------------------------------------

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
