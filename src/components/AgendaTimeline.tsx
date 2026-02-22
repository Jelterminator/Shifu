import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { PanResponderInstance } from 'react-native';
import {
  Dimensions,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from 'react-native';
import { BORDER_RADIUS } from '../constants/theme';
import { type WuXingPhase } from '../services/data/PhaseManager';
import { useThemeStore } from '../stores/themeStore';

const { height: WINDOW_HEIGHT } = Dimensions.get('window');
const HOUR_HEIGHT = 120;
const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
const TIMELINE_PADDING_LEFT = 60;
const TOTAL_HEIGHT = 24 * HOUR_HEIGHT + 20;

export interface TimelineEvent {
  id: string;
  title: string;
  durationMinutes: number;
  type: 'task' | 'habit' | 'fixed' | 'anchor';
  completed?: boolean;
  color?: string;
  startTime?: Date;
}

interface VisualSegment {
  id: string; // unique render id
  originalId: string;
  title: string;
  top: number;
  height: number;
  type: 'task' | 'habit' | 'fixed' | 'anchor';
  completed: boolean;
  color: string;
  startTime: number; // ms timestamp
}

interface AgendaTimelineProps {
  plans: TimelineEvent[];
  fixedEvents: TimelineEvent[];
  phases: WuXingPhase[];
  onReorder: (newSequence: TimelineEvent[]) => void;
  onSelectEvent?: (id: string) => void;
  onToggleComplete?: (id: string) => void;
  currentTime?: Date;
}

export const AgendaTimeline: React.FC<AgendaTimelineProps> = ({
  plans,
  fixedEvents,
  phases,
  onReorder,
  onSelectEvent,
  onToggleComplete,
  currentTime: propCurrentTime,
}) => {
  const colors = useThemeStore(state => state.colors);
  const isDark = useThemeStore(state => state.isDark);

  const scrollViewRef = useRef<ScrollView>(null);
  const containerRef = useRef<View>(null);
  const containerBounds = useRef({ top: 0, bottom: WINDOW_HEIGHT, height: WINDOW_HEIGHT });
  const scrollY = useRef(0);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);

  // === State ===
  const [localPlans, setLocalPlans] = useState<TimelineEvent[]>(plans);
  const [isDragging, setIsDragging] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);

  // Ghost State (Visual only, follows cursor)
  const [ghostY, setGhostY] = useState<number | null>(null);
  const [ghostItem, setGhostItem] = useState<TimelineEvent | null>(null);

  // Ticking Time State
  const [internalNow, setInternalNow] = useState(propCurrentTime || new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setInternalNow(new Date());
    }, 60000); // Update every minute
    return () => clearInterval(interval);
  }, []);

  // Refs
  const localPlansRef = useRef(localPlans);
  const fixedEventsRef = useRef(fixedEvents);
  const draggedIdRef = useRef<string | null>(null);
  const phasesRef = useRef(phases);
  const dragTargetRef = useRef<string | null>(null);
  const dragTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!isDragging) {
      setLocalPlans(plans);
      localPlansRef.current = plans;
    }
  }, [plans, isDragging]);

  useEffect(() => {
    fixedEventsRef.current = fixedEvents;
  }, [fixedEvents]);
  useEffect(() => {
    phasesRef.current = phases;
  }, [phases]);

  const getBaseTime = useCallback((): number => {
    const ps = phasesRef.current;
    const baseDate = ps.length > 0 && ps[0] ? new Date(ps[0].startTime) : new Date();
    baseDate.setHours(0, 0, 0, 0);
    return baseDate.getTime();
  }, []);

  const timeToY = useCallback(
    (date?: Date): number => {
      if (!date) return 0;
      const ms = date.getTime() - getBaseTime();
      return (ms / 60000) * MINUTE_HEIGHT;
    },
    [getBaseTime]
  );

  const yToTime = useCallback(
    (y: number): number => {
      const minutes = y / MINUTE_HEIGHT;
      return getBaseTime() + minutes * 60000;
    },
    [getBaseTime]
  );

  const toContentY = useCallback((pageY: number): number => {
    return pageY - containerBounds.current.top + scrollY.current;
  }, []);

  // === Scroll to now on mount ===
  const hasScrolledRef = useRef(false);
  useEffect(() => {
    if (!hasScrolledRef.current) {
      const now = propCurrentTime || new Date();
      const targetY = timeToY(now) - 150;
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: Math.max(0, targetY), animated: false });
      }, 100);
      hasScrolledRef.current = true;
    }
  }, [propCurrentTime, timeToY]);

  // === Layout Calculation ===
  const segments = useMemo(() => {
    const allSegments: VisualSegment[] = [];
    const baseTime =
      phases.length > 0 && phases[0]
        ? new Date(phases[0].startTime).setHours(0, 0, 0, 0)
        : new Date().setHours(0, 0, 0, 0);

    const toY = (d?: Date): number => {
      if (!d) return 0;
      return ((d.getTime() - baseTime) / 60000) * MINUTE_HEIGHT;
    };

    fixedEvents.forEach(fe => {
      allSegments.push({
        id: fe.id,
        originalId: fe.id,
        title: fe.title,
        top: toY(fe.startTime),
        height: fe.durationMinutes * MINUTE_HEIGHT,
        type: fe.type,
        completed: !!fe.completed,
        color: fe.color || '#DDD',
        startTime: fe.startTime?.getTime() || 0,
      });
    });

    localPlans.forEach(plan => {
      if (!plan.startTime) return;
      allSegments.push({
        id: plan.id,
        originalId: plan.id,
        title: plan.title,
        top: toY(plan.startTime),
        height: plan.durationMinutes * MINUTE_HEIGHT,
        type: plan.type,
        completed: !!plan.completed,
        color: plan.color || '#FFF',
        startTime: plan.startTime.getTime(),
      });
    });

    return allSegments;
  }, [localPlans, fixedEvents, phases]);

  // === Auto-scroll ===
  const handleAutoScroll = (velocity: number): void => {
    if (!scrollViewRef.current) return;
    const newY = scrollY.current + velocity;
    const maxScroll = TOTAL_HEIGHT - containerBounds.current.height;
    const clampedY = Math.max(0, Math.min(maxScroll, newY));

    if (clampedY !== scrollY.current) {
      scrollViewRef.current.scrollTo({ y: clampedY, animated: false });
      scrollY.current = clampedY;
    }
  };

  const latestPageY = useRef<number>(0);

  const startAutoScrollCheck = (): void => {
    if (autoScrollInterval.current) return;
    autoScrollInterval.current = setInterval(() => {
      const screenY = latestPageY.current;
      const EDGE = 150; // Increased edge zone
      const MAX_SPEED = 20;
      let velocity = 0;

      // Use the actual container bounds instead of absolute window height
      const { top: containerTop, bottom: containerBottom } = containerBounds.current;

      if (screenY < containerTop + EDGE) {
        // Dragging near top of timeline container
        velocity = -MAX_SPEED * ((containerTop + EDGE - screenY) / EDGE);
      } else if (screenY > containerBottom - EDGE) {
        // Dragging near bottom of timeline container
        velocity = MAX_SPEED * ((screenY - (containerBottom - EDGE)) / EDGE);
      }

      if (velocity !== 0) {
        handleAutoScroll(velocity);
        // Since we scrolled, update ghost position based on active screen cursor
        requestAnimationFrame(() => {
          if (draggedIdRef.current) {
            handleDragMove(latestPageY.current);
          }
        });
      }
    }, 16);
  };

  const stopAutoScroll = (): void => {
    if (autoScrollInterval.current) {
      clearInterval(autoScrollInterval.current);
      autoScrollInterval.current = null;
    }
  };

  // === Drag Logic ===

  // During drag we purely update the visual ghost overlay, nothing else.
  const handleDragMove = (pageY: number): void => {
    latestPageY.current = pageY;

    if (draggedIdRef.current) {
      const contentY = toContentY(pageY);
      // Center the ghost on the cursor based on where they actually clicked it
      // For simplicity, we just put the top of the ghost where the cursor is,
      // or optionally offset it by `ghostOffset` captured at start.
      // Easiest is to center it on the cursor:
      const draggedHeight = (ghostItem?.durationMinutes || 0) * MINUTE_HEIGHT;
      setGhostY(contentY - draggedHeight / 2);
    }
  };

  // Heavy physics and restructuring deferred strictly to Release
  const finalizeDrop = (): void => {
    const dId = draggedIdRef.current;
    if (!dId || ghostY === null) return;

    const currentPlans = [...localPlansRef.current];
    const draggedIdx = currentPlans.findIndex(p => p.id === dId);
    if (draggedIdx === -1) return;

    const draggedItem = currentPlans[draggedIdx];
    if (!draggedItem) return;

    const draggedHeight = draggedItem.durationMinutes * MINUTE_HEIGHT;
    const ghostRect = {
      top: ghostY,
      bottom: ghostY + draggedHeight,
      center: ghostY + draggedHeight / 2,
    };

    // 1. Check Swap Directory
    let swapCandidateIdx = -1;

    for (let i = 0; i < currentPlans.length; i++) {
      if (i === draggedIdx) continue;
      const item = currentPlans[i];
      if (!item || !item.startTime) continue;

      const itemTop = timeToY(item.startTime);
      const itemHeight = item.durationMinutes * MINUTE_HEIGHT;
      const itemCenter = itemTop + itemHeight / 2;

      if (ghostRect.center > itemTop && ghostRect.center < itemTop + itemHeight) {
        if (draggedIdx < i && ghostRect.center > itemCenter) {
          swapCandidateIdx = i;
        } else if (draggedIdx > i && ghostRect.center < itemCenter) {
          swapCandidateIdx = i;
        }
      }
    }

    const getNextValidTime = (time: number, durationMinutes: number): number => {
      let start = time;
      let end = start + durationMinutes * 60000;
      let changed = true;
      while (changed) {
        changed = false;
        for (const fe of fixedEventsRef.current) {
          if (!fe.startTime) continue;
          const feStart = fe.startTime.getTime();
          const feEnd = feStart + fe.durationMinutes * 60000;
          if (start < feEnd - 1000 && end > feStart + 1000) {
            start = feEnd;
            end = start + durationMinutes * 60000;
            changed = true;
          }
        }
      }
      return start;
    };

    let newPlans = [...currentPlans];

    if (swapCandidateIdx !== -1) {
      // SWAP EXECUTION
      const targetItem = newPlans[swapCandidateIdx];
      if (targetItem) {
        newPlans[draggedIdx] = targetItem;
        newPlans[swapCandidateIdx] = draggedItem;

        // Force a chronological sort after swapping
        newPlans = newPlans
          .filter(p => !!p.startTime)
          .sort((a, b) => a.startTime!.getTime() - b.startTime!.getTime());

        // Ripple timing forward
        const minItem = newPlans[0];
        let runningTime = minItem?.startTime?.getTime() || getBaseTime();

        for (let k = 0; k < newPlans.length; k++) {
          const p = newPlans[k];
          if (!p) continue;
          runningTime = getNextValidTime(runningTime, p.durationMinutes);
          newPlans[k] = { ...p, startTime: new Date(runningTime) };
          runningTime += p.durationMinutes * 60000;
        }
      }
    } else {
      // FREE DROPPING
      const proposedTime = yToTime(ghostY);
      const date = new Date(proposedTime);
      const snapM = Math.round(date.getMinutes() / 15) * 15;
      date.setMinutes(snapM, 0, 0);
      const snappedMs = date.getTime();

      const myStart = snappedMs;
      const myEnd = snappedMs + draggedItem.durationMinutes * 60000;
      let collision = false;

      // Detect Free Move Collisions against all siblings entirely chronologically
      for (const other of newPlans) {
        if (other.id === dId || !other.startTime) continue;
        const oStart = other.startTime.getTime();
        const oEnd = oStart + other.durationMinutes * 60000;
        if (Math.min(myEnd, oEnd) - Math.max(myStart, oStart) > 1000) {
          collision = true;
          break;
        }
      }

      for (const fe of fixedEventsRef.current) {
        if (!fe.startTime) continue;
        const fStart = fe.startTime.getTime();
        const fEnd = fStart + fe.durationMinutes * 60000;
        if (Math.min(myEnd, fEnd) - Math.max(myStart, fStart) > 1000) {
          collision = true;
          break;
        }
      }

      if (!collision) {
        newPlans[draggedIdx] = { ...draggedItem, startTime: new Date(snappedMs) };
        try {
          newPlans.sort((a, b) => a.startTime!.getTime() - b.startTime!.getTime());
        } catch (e) {
          console.warn('Silent skip sorting in collision path', e);
        }
      }
    }

    setLocalPlans(newPlans);
    localPlansRef.current = newPlans;
    onReorder(newPlans);
  };

  // Cache PRs
  const panResponders = useRef<Record<string, PanResponderInstance>>({});

  const getPanResponder = (plan: TimelineEvent): PanResponderInstance => {
    if (!panResponders.current[plan.id]) {
      panResponders.current[plan.id] = PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onStartShouldSetPanResponderCapture: () => false,
        onMoveShouldSetPanResponder: (_, { dx, dy }) => {
          if (Platform.OS === 'web') {
            return Math.abs(dx) > 5 || Math.abs(dy) > 5;
          }
          if (dragTargetRef.current !== plan.id) return false;
          return Math.abs(dx) > 2 || Math.abs(dy) > 2;
        },
        onMoveShouldSetPanResponderCapture: (_, { dx, dy }) => {
          if (Platform.OS === 'web') {
            return Math.abs(dx) > 5 || Math.abs(dy) > 5;
          }
          if (dragTargetRef.current !== plan.id) return false;
          return Math.abs(dx) > 2 || Math.abs(dy) > 2;
        },
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: evt => {
          const pageY = evt.nativeEvent.pageY;
          latestPageY.current = pageY;

          // Initialize Drag State
          setIsDragging(true);
          setDraggedId(plan.id);
          draggedIdRef.current = plan.id;
          setGhostItem(plan);

          // Fast-link the ghost precisely to cursor layout
          const contentY = toContentY(pageY);
          const draggedHeight = (plan.durationMinutes || 0) * MINUTE_HEIGHT;
          setGhostY(contentY - draggedHeight / 2);

          startAutoScrollCheck();
        },
        onPanResponderMove: evt => {
          handleDragMove(evt.nativeEvent.pageY);
        },
        onPanResponderRelease: () => {
          stopAutoScroll();
          finalizeDrop();
          setIsDragging(false);
          setDraggedId(null);
          draggedIdRef.current = null;
          setGhostY(null);
          if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
          dragTargetRef.current = null;
        },
        onPanResponderTerminate: () => {
          stopAutoScroll();
          setIsDragging(false);
          setDraggedId(null);
          draggedIdRef.current = null;
          setGhostY(null);
          if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
          dragTargetRef.current = null;
          setLocalPlans(plans);
        },
      });
    }
    return panResponders.current[plan.id]!;
  };

  const renderItem = (seg: VisualSegment): React.ReactElement => {
    const isShadow = seg.originalId === draggedId;
    const isFlexible = seg.type === 'task' || seg.type === 'habit';

    // Only attach PanResponder to flexible items (that exist in localPlans)
    const plan = isFlexible ? localPlansRef.current.find(p => p.id === seg.originalId) : null;
    const pr = plan ? getPanResponder(plan) : { panHandlers: {} };

    return (
      <View
        key={seg.id}
        {...pr.panHandlers}
        style={[
          styles.eventCard,
          {
            top: seg.top,
            height: seg.height,
            backgroundColor: seg.completed ? seg.color + '80' : seg.color,
            borderLeftColor: seg.color,
            opacity: isShadow ? 0.3 : 1,
            zIndex: 1,
            // @ts-expect-error valid for react-native-web
            touchAction: 'none',
          },
        ]}
      >
        <TouchableOpacity
          style={styles.eventContent}
          activeOpacity={1}
          onPress={() => onSelectEvent?.(seg.originalId)}
          onLongPress={() => {
            if (isDragging) return;
            dragTargetRef.current = seg.originalId;
            try {
              Vibration.vibrate(50);
            } catch {
              // ignore
            }
          }}
          delayLongPress={300}
          disabled={!!isDragging}
        >
          <View style={styles.titleRow}>
            <Text
              style={[
                styles.eventTitle,
                { color: isDark ? '#FFF' : '#000' },
                seg.completed && styles.completedText,
              ]}
              numberOfLines={1}
            >
              {seg.title}
            </Text>
            {isFlexible && (
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => onToggleComplete?.(seg.originalId)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <View style={[styles.checkboxInner, seg.completed && styles.checkboxChecked]} />
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderPhases = (): (React.ReactElement | null)[] | null => {
    const startPhase = phases[0];
    if (!startPhase) return null;
    return phases.map((p, i) => {
      const top = timeToY(p.startTime);
      const height = ((p.endTime.getTime() - p.startTime.getTime()) / 60000) * MINUTE_HEIGHT;
      return (
        <View key={i} style={[styles.phaseBlock, { top, height, backgroundColor: p.color + '15' }]}>
          <Text style={[styles.phaseText, { color: p.color }]}>{p.name}</Text>
        </View>
      );
    });
  };

  const gridLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i <= 24; i++) {
      lines.push(
        <View key={i} style={[styles.gridLine, { top: i * HOUR_HEIGHT }]}>
          <View style={styles.timeLabelContainer}>
            <Text
              style={[
                styles.timeLabel,
                { color: colors.textSecondary, backgroundColor: colors.background },
              ]}
            >
              {`${i.toString().padStart(2, '0')}:00`}
            </Text>
          </View>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>
      );
    }
    return lines;
  }, [colors]);

  const renderCurrentTime = (): React.ReactElement | null => {
    const now = internalNow;
    const base = getBaseTime();
    const nowMs = now.getTime();

    // Only show if the current time falls on the viewed day (0-24h window)
    if (nowMs < base || nowMs > base + 24 * 60 * 60 * 1000) {
      return null;
    }

    // timeToY takes a date object
    const top = timeToY(now);

    return (
      <View style={[styles.currentTimeContainer, { top }]} pointerEvents="none">
        <View style={styles.currentTimeDot} />
        <View style={styles.currentTimeLine} />
      </View>
    );
  };

  return (
    <View
      ref={containerRef}
      style={{ flex: 1, backgroundColor: colors.background }}
      onLayout={() => {
        containerRef.current?.measure((_x, _y, _width, height, _pageX, pageY) => {
          containerBounds.current = {
            top: pageY,
            bottom: pageY + height,
            height: height,
          };
        });
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ height: TOTAL_HEIGHT }}
        onScroll={e => {
          scrollY.current = e.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        scrollEnabled={!isDragging}
      >
        {renderPhases()}
        {gridLines}
        {renderCurrentTime()}

        {segments.map(seg => renderItem(seg))}

        {/* Ghost Overlay */}
        {isDragging && ghostItem && ghostY !== null && (
          <View
            style={[
              styles.eventCard,
              {
                top: ghostY,
                height: ghostItem.durationMinutes * MINUTE_HEIGHT,
                backgroundColor: ghostItem.color || colors.primary,
                borderLeftColor: ghostItem.color || colors.primary,
                zIndex: 999,
                elevation: 10,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                opacity: 0.9,
                borderColor: colors.text,
                borderWidth: 1,
              },
            ]}
            pointerEvents="none"
          >
            <View style={styles.eventContent}>
              <Text style={[styles.eventTitle, { color: '#FFF' }]}>{ghostItem.title}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  gridLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    height: 20,
    marginTop: -10,
    zIndex: 0,
  },
  timeLabelContainer: {
    width: TIMELINE_PADDING_LEFT,
    alignItems: 'center',
  },
  currentTimeContainer: {
    position: 'absolute',
    left: TIMELINE_PADDING_LEFT - 4, // Center the dot on the boundary
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 10, // above lines and phases
    height: 10,
    marginTop: -5,
  },
  currentTimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E63946',
  },
  currentTimeLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E63946',
    opacity: 0.8,
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  line: {
    flex: 1,
    height: 1,
    opacity: 0.5,
  },
  phaseBlock: {
    position: 'absolute',
    left: TIMELINE_PADDING_LEFT,
    right: 0,
    padding: 8,
  },
  phaseText: {
    fontSize: 10,
    fontWeight: '800',
    opacity: 0.5,
    letterSpacing: 1,
  },
  eventCard: {
    position: 'absolute',
    left: TIMELINE_PADDING_LEFT + 8,
    right: 8,
    borderRadius: BORDER_RADIUS.medium,
    borderLeftWidth: 4,
    overflow: 'hidden',
    justifyContent: 'center',
    paddingHorizontal: 8,
  },
  eventContent: {
    flex: 1,
    justifyContent: 'center',
  },
  eventTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
  },
  completedText: {
    textDecorationLine: 'line-through',
    opacity: 0.7,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.3)',
    marginLeft: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'transparent',
  },
  checkboxChecked: {
    backgroundColor: '#FFF',
  },
});
