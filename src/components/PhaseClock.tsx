import React, { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { phaseManager, type WuXingPhase } from '../services/data/PhaseManager';

const { width, height } = Dimensions.get('window');

// Configuration
const CLOCK_RADIUS = width * 1.5;
const PHI = 1.61803398875;
// The "smaller" golden section of the screen height (approx 38%)
const VISIBLE_HEIGHT = height * (1 - 1 / PHI);

/* 
 Position:
 The disk is a circle of radius R.
 We want the top of the circle to be at (screenHeight - VISIBLE_HEIGHT).
 The disk's center will be at (screenHeight - VISIBLE_HEIGHT + R).
 But we are positioning a View of size 2R x 2R.
 Top of View = (screenHeight - VISIBLE_HEIGHT + R) - R = screenHeight - VISIBLE_HEIGHT.
 Left of View = (screenWidth/2) - R.
 Rotation pivot is center of View (default).
*/

const PhaseClock = (): React.ReactElement => {
  const [phases, setPhases] = useState<WuXingPhase[]>([]);
  const [now, setNow] = useState(new Date());

  const rotationAnim = useRef(new Animated.Value(0)).current;

  // Load phases
  useEffect(() => {
    const loadPhases = (): void => {
      // Get phases for a full 24h cycle
      const currentPhases = phaseManager.getPhasesForGregorianDate(new Date());
      setPhases(currentPhases);
    };
    loadPhases();

    const interval = setInterval(() => {
      const currentTime = new Date();
      setNow(currentTime);
      if (currentTime.getDate() !== now.getDate()) {
        loadPhases();
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [now]); // Added 'now' as dependency as it's used in getDate check

  // Animate Rotation
  useEffect(() => {
    const totalMinutes = now.getHours() * 60 + now.getMinutes();
    const degrees = (totalMinutes / 1440) * 360;

    // We want current time (degrees) to be at TOP.
    // View is 0 degrees = 12 o'clock?
    // In SVG, 0 degrees is 3 o'clock.
    // If we draw sectors such that 00:00 is at -90deg (12 o'clock standard clock),
    // then to bring "Now" to 12 o'clock, we rotate by -degrees.

    // Let's standardise:
    // 00:00 = Angle 0.
    // We draw Angle 0 at -90deg (Top).
    // Now = Angle X.
    // We want Angle X at -90deg (Top).
    // Rotate by -X.

    Animated.timing(rotationAnim, {
      toValue: -degrees,
      duration: 1000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [now, rotationAnim]); // Added 'rotationAnim' as dependency

  // Interpolate rotation
  const rotateStr = rotationAnim.interpolate({
    inputRange: [-360, 360],
    outputRange: ['-360deg', '360deg'],
  });

  // Calculate Arcs
  const createArcPath = (startAngle: number, endAngle: number, radius: number): string => {
    // Convert to radians.
    // We draw assuming 0 is -90deg (Top) to make logic easier?
    // No, SVG standard: 0 is Right (3 o'clock).
    // So 00:00 (Top) should be -90 deg.

    const startDeg = startAngle - 90;
    const endDeg = endAngle - 90;

    const startRad = (startDeg * Math.PI) / 180;
    const endRad = (endDeg * Math.PI) / 180;

    // Center of circle is (R, R) in the View
    const cx = radius;
    const cy = radius;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);

    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      `Z`,
    ].join(' ');
  };

  const arcs = phases.map((phase, i): React.ReactElement => {
    const startMin = phase.startTime.getHours() * 60 + phase.startTime.getMinutes();
    const endMin = phase.endTime.getHours() * 60 + phase.endTime.getMinutes();

    const startAngle = (startMin / 1440) * 360;
    let endAngle = (endMin / 1440) * 360;

    if (endAngle <= startAngle) endAngle += 360; // Crossing midnight

    return (
      <Path
        key={`${phase.name}-${i}`}
        d={createArcPath(startAngle, endAngle, CLOCK_RADIUS)}
        fill={phase.color}
        opacity={0.6}
      />
    );
  });

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Rotating Disk */}
      <Animated.View style={[styles.disk, { transform: [{ rotate: rotateStr }] }]}>
        <Svg width={CLOCK_RADIUS * 2} height={CLOCK_RADIUS * 2}>
          {arcs}
        </Svg>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1, // Behind content
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  disk: {
    position: 'absolute',
    width: CLOCK_RADIUS * 2,
    height: CLOCK_RADIUS * 2,
    borderRadius: CLOCK_RADIUS,
    left: width / 2 - CLOCK_RADIUS,
    top: height - VISIBLE_HEIGHT,
    // Background color for empty spaces?
    backgroundColor: '#F0F0F0',
  },
});

export default PhaseClock;
