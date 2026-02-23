/**
 * WuXingEmblem.tsx
 * * A mathematically precise, infinitely scalable vector emblem representing
 * the 5 elements of Wu Xing in their Generative (Sheng) Cycle.
 * Designed to match the modern, mature aesthetic of the Shifu app.
 */
import React from 'react';
import { Circle, G, Path, Rect, Svg } from 'react-native-svg';

export interface EmblemProps {
  size?: number;
}

const COLORS = {
  WOOD: '#4A7C59',
  FIRE: '#E63946',
  EARTH: '#C49551',
  METAL: '#A8AAAD',
  WATER: '#457B9D',
};

export const WuXingEmblem: React.FC<EmblemProps> = ({ size = 200 }) => (
  <Svg width={size} height={size} viewBox="0 0 120 120" fill="none">
    {/* Background Base to give it the deep "crest" feel */}
    <Circle cx="60" cy="60" r="56" fill="#121212" />
    <Circle cx="60" cy="60" r="56" stroke="#2A2A2A" strokeWidth="2" />

    {/* ==========================================
        WOOD (Top) - Rotated 0°
        ========================================== */}
    <G transform="rotate(0 60 60)">
      {/* Outer Connecting Arrow (Wood -> Fire) */}
      <Path
        d="M 60 14 A 46 46 0 0 1 100.8 38.6"
        stroke={COLORS.WOOD}
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* Arrowhead */}
      <Path
        d="M 104.3 28.9 L 101 39 L 88.7 35.0"
        stroke={COLORS.WOOD}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Element Node Ring */}
      <Circle cx="60" cy="28" r="14" stroke={COLORS.WOOD} strokeWidth="2.5" />

      {/* Wood Symbol */}
      <G transform="translate(48, 16) scale(1)">
        <Path
          d="M12 2v15M12 7l6 3M12 12l-5 3M9 21h6"
          stroke={COLORS.WOOD}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </G>

    {/* ==========================================
        FIRE (Right) - Rotated 72°
        ========================================== */}
    <G transform="rotate(72 60 60)">
      {/* Outer Connecting Arrow (Fire -> Earth) */}
      <Path
        d="M 60 14 A 46 46 0 0 1 100.8 38.6"
        stroke={COLORS.FIRE}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Path
        d="M 104.3 28.9 L 101 39 L 88.7 35.0"
        stroke={COLORS.FIRE}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Element Node Ring */}
      <Circle cx="60" cy="28" r="14" stroke={COLORS.FIRE} strokeWidth="2.5" />

      {/* Fire Symbol - Un-rotated so it faces upright */}
      <G transform="translate(60, 28) rotate(-72) translate(-12, -12)">
        <Path
          d="M12 22a7 7 0 0 0 7-7c0-4-3.5-7-6-12-1 3-2 5-2 6-1-1-2-1-3-1-3 2-4 5-4 8a7 7 0 0 0 8 6z"
          stroke={COLORS.FIRE}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </G>
    </G>

    {/* ==========================================
        EARTH (Bottom Right) - Rotated 144°
        ========================================== */}
    <G transform="rotate(144 60 60)">
      {/* Outer Connecting Arrow (Earth -> Metal) */}
      <Path
        d="M 60 14 A 46 46 0 0 1 100.8 38.6"
        stroke={COLORS.EARTH}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Path
        d="M 104.3 28.9 L 101 39 L 88.7 35.0"
        stroke={COLORS.EARTH}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Element Node Ring */}
      <Circle cx="60" cy="28" r="14" stroke={COLORS.EARTH} strokeWidth="2.5" />

      {/* Earth Symbol - Un-rotated */}
      <G transform="translate(60, 28) rotate(-144) translate(-12, -12)">
        <Path
          d="M2 20h20M5 15h14M8 10h8M11 5h2"
          stroke={COLORS.EARTH}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </G>
    </G>

    {/* ==========================================
        METAL (Bottom Left) - Rotated 216°
        ========================================== */}
    <G transform="rotate(216 60 60)">
      {/* Outer Connecting Arrow (Metal -> Water) */}
      <Path
        d="M 60 14 A 46 46 0 0 1 100.8 38.6"
        stroke={COLORS.METAL}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Path
        d="M 104.3 28.9 L 101 39 L 88.7 35.0"
        stroke={COLORS.METAL}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Element Node Ring */}
      <Circle cx="60" cy="28" r="14" stroke={COLORS.METAL} strokeWidth="2.5" />

      {/* Metal Symbol - Un-rotated */}
      <G transform="translate(60, 28) rotate(-216) translate(-12, -12)">
        <Circle cx="12" cy="12" r="9" stroke={COLORS.METAL} strokeWidth="2" />
        <Rect
          x="9"
          y="9"
          width="6"
          height="6"
          rx="1"
          stroke={COLORS.METAL}
          strokeWidth="2"
          fill={COLORS.METAL}
          fillOpacity={0.15}
        />
      </G>
    </G>

    {/* ==========================================
        WATER (Top Left) - Rotated 288°
        ========================================== */}
    <G transform="rotate(288 60 60)">
      {/* Outer Connecting Arrow (Water -> Wood) */}
      <Path
        d="M 60 14 A 46 46 0 0 1 100.8 38.6"
        stroke={COLORS.WATER}
        strokeWidth="3"
        strokeLinecap="round"
      />
      <Path
        d="M 104.3 28.9 L 101 39 L 88.7 35.0"
        stroke={COLORS.WATER}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Element Node Ring */}
      <Circle cx="60" cy="28" r="14" stroke={COLORS.WATER} strokeWidth="2.5" />

      {/* Water Symbol - Un-rotated */}
      <G transform="translate(60, 28) rotate(-288) translate(-12, -12)">
        <Path
          d="M2 12c2-2 3 2 5 0s3-2 5 0 3 2 5 0 3-2 5 0M2 17c2-2 3 2 5 0s3-2 5 0 3 2 5 0 3-2 5 0M2 7c2-2 3 2 5 0s3-2 5 0 3 2 5 0 3-2 5 0"
          stroke={COLORS.WATER}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </G>
    </G>

    {/* Inner Core Connecting Ring */}
    <Circle cx="60" cy="60" r="18" stroke="#2A2A2A" strokeWidth="1.5" strokeDasharray="4 4" />
  </Svg>
);
