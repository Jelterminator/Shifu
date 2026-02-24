/**
 * WuXingEmblem.tsx
 *
 * A modern, calligraphic vector emblem representing the 5 elements
 * of Wu Xing in their Generative (Sheng) Cycle.
 * Designed to match the fluid Zen stroke aesthetic.
 */
import React from 'react';
import { Circle, G, Path, Svg } from 'react-native-svg';
import { PHASE_COLORS } from '../../constants/theme';
import { useThemeStore } from '../../stores/themeStore';
import { EarthIcon, FireIcon, MetalIcon, WaterIcon, WoodIcon } from './AppIcons';

export interface EmblemProps {
  size?: number;
}

export const WuXingEmblem: React.FC<EmblemProps> = ({ size = 200 }) => {
  const themeColors = useThemeStore(state => state.colors);

  return (
    <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      {/* Background Base - using theme colors for smooth integration */}
      <Circle cx="60" cy="60" r="56" fill={themeColors.surface} />
      <Circle cx="60" cy="60" r="56" stroke={themeColors.border} strokeWidth="1.5" />

      {/* ==========================================
          WOOD (Top) - Rotated 0°
          ========================================== */}
      <G transform="rotate(0 60 60)">
        {/* Calligraphic Sweeping Arrow (Wood -> Fire) */}
        <Path
          d="M 60 14 A 46 46 0 0 1 100.8 38.6"
          stroke={PHASE_COLORS.WOOD.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Fluid Arrowhead */}
        <Path
          d="M 98 28.5 Q 101.5 35 101 39 Q 95 38 88.5 35.5"
          stroke={PHASE_COLORS.WOOD.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Element Node Ring - Enso inspired */}
        <Path
          d="M 60 14 A 14 14 0 1 1 54 15.5"
          stroke={themeColors.border}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Wood Symbol */}
        <G transform="translate(48, 16) scale(1)">
          <WoodIcon color={PHASE_COLORS.WOOD.primary} size={24} />
        </G>
      </G>

      {/* ==========================================
          FIRE (Right) - Rotated 72°
          ========================================== */}
      <G transform="rotate(72 60 60)">
        {/* Calligraphic Sweeping Arrow (Fire -> Earth) */}
        <Path
          d="M 60 14 A 46 46 0 0 1 100.8 38.6"
          stroke={PHASE_COLORS.FIRE.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Fluid Arrowhead */}
        <Path
          d="M 98 28.5 Q 101.5 35 101 39 Q 95 38 88.5 35.5"
          stroke={PHASE_COLORS.FIRE.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Element Node Ring */}
        <Path
          d="M 60 14 A 14 14 0 1 1 54 15.5"
          stroke={themeColors.border}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Fire Symbol - Un-rotated so it faces upright */}
        <G transform="translate(60, 28) rotate(-72) translate(-12, -12)">
          <FireIcon color={PHASE_COLORS.FIRE.primary} size={24} />
        </G>
      </G>

      {/* ==========================================
          EARTH (Bottom Right) - Rotated 144°
          ========================================== */}
      <G transform="rotate(144 60 60)">
        {/* Calligraphic Sweeping Arrow (Earth -> Metal) */}
        <Path
          d="M 60 14 A 46 46 0 0 1 100.8 38.6"
          stroke={PHASE_COLORS.EARTH.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Fluid Arrowhead */}
        <Path
          d="M 98 28.5 Q 101.5 35 101 39 Q 95 38 88.5 35.5"
          stroke={PHASE_COLORS.EARTH.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Element Node Ring */}
        <Path
          d="M 60 14 A 14 14 0 1 1 54 15.5"
          stroke={themeColors.border}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Earth Symbol - Un-rotated */}
        <G transform="translate(60, 28) rotate(-144) translate(-12, -12)">
          <EarthIcon color={PHASE_COLORS.EARTH.primary} size={24} />
        </G>
      </G>

      {/* ==========================================
          METAL (Bottom Left) - Rotated 216°
          ========================================== */}
      <G transform="rotate(216 60 60)">
        {/* Calligraphic Sweeping Arrow (Metal -> Water) */}
        <Path
          d="M 60 14 A 46 46 0 0 1 100.8 38.6"
          stroke={PHASE_COLORS.METAL.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Fluid Arrowhead */}
        <Path
          d="M 98 28.5 Q 101.5 35 101 39 Q 95 38 88.5 35.5"
          stroke={PHASE_COLORS.METAL.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Element Node Ring */}
        <Path
          d="M 60 14 A 14 14 0 1 1 54 15.5"
          stroke={themeColors.border}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Metal Symbol - Un-rotated */}
        <G transform="translate(60, 28) rotate(-216) translate(-12, -12)">
          <MetalIcon color={PHASE_COLORS.METAL.primary} size={24} />
        </G>
      </G>

      {/* ==========================================
          WATER (Top Left) - Rotated 288°
          ========================================== */}
      <G transform="rotate(288 60 60)">
        {/* Calligraphic Sweeping Arrow (Water -> Wood) */}
        <Path
          d="M 60 14 A 46 46 0 0 1 100.8 38.6"
          stroke={PHASE_COLORS.WATER.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Fluid Arrowhead */}
        <Path
          d="M 98 28.5 Q 101.5 35 101 39 Q 95 38 88.5 35.5"
          stroke={PHASE_COLORS.WATER.primary}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Element Node Ring */}
        <Path
          d="M 60 14 A 14 14 0 1 1 54 15.5"
          stroke={themeColors.border}
          strokeWidth="1.5"
          strokeLinecap="round"
        />

        {/* Water Symbol - Un-rotated */}
        <G transform="translate(60, 28) rotate(-288) translate(-12, -12)">
          <WaterIcon color={PHASE_COLORS.WATER.primary} size={24} />
        </G>
      </G>

      {/* Inner Core Connecting Ring - representing Taiji/Center */}
      <Circle
        cx="60"
        cy="60"
        r="18"
        stroke={themeColors.border}
        strokeWidth="1.5"
        strokeDasharray="4 8"
        strokeLinecap="round"
      />
    </Svg>
  );
};
