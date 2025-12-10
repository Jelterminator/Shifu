import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS, SHADOWS, SPACING, URGENCY_COLORS } from '../constants/theme';
import { useThemeStore } from '../stores/themeStore';
import type { Task } from '../types/database';

interface TaskCardProps {
  task: Task;
  onPress?: () => void;
  onToggleComplete?: () => void;
  showSubtasks?: boolean;
}

export function TaskCard({ task, onPress, onToggleComplete }: TaskCardProps): React.JSX.Element {
  const { colors } = useThemeStore();
  const [isExpanded, setIsExpanded] = useState(false);

  // TODO: Implement actual urgency logic shared with Repo or Helper
  // For now, mapping effort/deadline to T-levels if computed in Repo, OR computing here if simple
  // Assuming Repo might return a computed 'urgencyLevel' if we extend the type, checking simple logic:

  // Placeholder urgency logic for UI visual (Replace with shared logic)
  const urgencyTier = 'T1'; // Defaulting for visual
  const tierColor = URGENCY_COLORS[urgencyTier as keyof typeof URGENCY_COLORS] || URGENCY_COLORS.T4;

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

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface, borderColor: tierColor }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={[styles.tierStrip, { backgroundColor: tierColor }]} />

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>
          <TouchableOpacity
            onPress={onToggleComplete}
            style={[styles.checkbox, { borderColor: colors.textSecondary }]}
          >
            {task.isCompleted && (
              <View style={[styles.checked, { backgroundColor: colors.primary }]} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.meta}>
          {task.deadline && (
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>
              📅{' '}
              {formatDeadline(
                typeof task.deadline === 'string' ? new Date(task.deadline) : task.deadline
              )}
            </Text>
          )}
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            ⏱️ {task.effortMinutes}m
          </Text>
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
});
