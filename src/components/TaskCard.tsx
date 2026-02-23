import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS, SHADOWS, SPACING, URGENCY_COLORS } from '../constants/theme';
import { determineUrgency } from '../db/mappers';
import { useThemeStore } from '../stores/themeStore';
import type { Task } from '../types/database';
import { AgendaIcon, TimerIcon } from './icons/AppIcons';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  onToggleComplete?: () => void;
  showSubtasks?: boolean;
  mode?: 'default' | 'planning';
  index?: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
  /** Override for completion status (e.g., from Plan.done) */
  isCompleted?: boolean;
  /** Force a neutral/default color instead of urgency-based color */
  useDefaultColor?: boolean;
}

export function TaskCard({
  task,
  onPress,
  onToggleComplete,
  mode = 'default',
  index,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
  isCompleted,
  useDefaultColor,
}: TaskCardProps): React.JSX.Element {
  const { colors } = useThemeStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // Use override if provided, otherwise fall back to task property
  const completed = isCompleted ?? task.isCompleted;

  // Urgency logic
  const deadlineDate = typeof task.deadline === 'string' ? new Date(task.deadline) : task.deadline;
  const urgencyTier = determineUrgency(deadlineDate, task.effortMinutes).urgencyLevel; // Defaulting for visual

  // If urgency is T6 or CHORE, use the current phase color (standard color of the moment)
  const isLowUrgency = urgencyTier === 'T6' || urgencyTier === 'CHORE';
  const tierColor =
    useDefaultColor || isLowUrgency
      ? colors.primary
      : URGENCY_COLORS[urgencyTier as keyof typeof URGENCY_COLORS];

  const handlePress = (): void => {
    setIsExpanded(!isExpanded);
    if (onPress) onPress();
  };

  const formatDeadline = (date: Date): string => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Overdue';
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    return `Dec ${date.getDate()}`; // TODO: Real format
  };

  const isPlanning = mode === 'planning';

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, borderColor: tierColor }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.tierStrip, { backgroundColor: tierColor }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {isPlanning && index !== undefined ? `${index + 1}. ` : ''}
            {task.title}
          </Text>

          {isPlanning ? (
            <View style={styles.moveButtons}>
              <TouchableOpacity
                onPress={e => {
                  e.stopPropagation();
                  onMoveUp?.();
                }}
                disabled={isFirst}
                style={[styles.moveBtn, { opacity: isFirst ? 0.3 : 1 }]}
              >
                <Text style={{ fontSize: 16, color: colors.text }}>▲</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={e => {
                  e.stopPropagation();
                  onMoveDown?.();
                }}
                disabled={isLast}
                style={[styles.moveBtn, { opacity: isLast ? 0.3 : 1 }]}
              >
                <Text style={{ fontSize: 16, color: colors.text }}>▼</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={onToggleComplete}
              style={[styles.checkbox, { borderColor: colors.textSecondary }]}
            >
              {completed && <View style={[styles.checked, { backgroundColor: colors.primary }]} />}
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.meta}>
          {task.deadline && (
            <View style={styles.metaItem}>
              <AgendaIcon color={colors.textSecondary} size={12} />
              <Text style={[styles.metaText, { color: colors.textSecondary, marginLeft: 3 }]}>
                {formatDeadline(
                  typeof task.deadline === 'string' ? new Date(task.deadline) : task.deadline
                )}
              </Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <TimerIcon color={colors.textSecondary} size={12} />
            <Text style={[styles.metaText, { color: colors.textSecondary, marginLeft: 3 }]}>
              {task.effortMinutes}m
            </Text>
          </View>
        </View>

        {isExpanded && task.notes && (
          <View style={styles.notes}>
            <Text style={[styles.noteText, { color: colors.textSecondary }]}>{task.notes}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.s,
    overflow: 'hidden',
    ...SHADOWS.level1,
    borderLeftWidth: 0,
    flexDirection: 'row',
  },
  tierStrip: {
    width: 6,
  },
  content: {
    flex: 1,
    padding: SPACING.m,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginLeft: SPACING.s,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  meta: {
    flexDirection: 'row',
    gap: SPACING.m,
  },
  metaItem: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
  },
  metaText: {
    fontSize: 13,
  },
  notes: {
    marginTop: SPACING.s,
  },
  noteText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  moveButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  moveBtn: {
    padding: 4,
  },
});
