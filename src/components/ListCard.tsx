import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS, SHADOWS, SPACING } from '../constants/theme';
import type { ListConfiguration } from '../stores/listStore';
import { useThemeStore } from '../stores/themeStore';
import type { Task } from '../types/database';

interface ListCardProps {
  list: ListConfiguration;
  count: number;
  previewTasks: Task[];
  onPress: () => void;
  onAddTask?: () => void;
  onAddProject?: () => void;
}

export function ListCard({ list, count, previewTasks, onPress, onAddTask, onAddProject }: ListCardProps): React.JSX.Element {
  const { colors, phaseColor } = useThemeStore();

  // Use props directly, no internal state or effects!

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.icon}>{list.icon}</Text>
          <Text style={[styles.name, { color: colors.text }]}>
            {list.name} <Text style={{ color: colors.textSecondary }}>({count})</Text>
          </Text>
        </View>
        <Text style={[styles.schedule, { color: colors.textSecondary }]}>
          {list.schedulingMode}
        </Text>
      </View>

      {previewTasks.length > 0 && (
        <View style={styles.previewList}>
          {previewTasks.map(task => (
            <View key={task.id} style={styles.previewItem}>
              <View style={[styles.dot, { backgroundColor: phaseColor }]} />
              <Text numberOfLines={1} style={[styles.previewText, { color: colors.textSecondary }]}>
                {task.title}
              </Text>
              {task.urgencyLevel && task.urgencyLevel <= 'T3' && (
                <Text style={{ fontSize: 10, color: 'red', marginLeft: 4 }}>🔥</Text>
              )}
            </View>
          ))}
        </View>
      )}
      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: phaseColor }]}
          onPress={(e) => {
              e.stopPropagation();
              if (onAddTask) onAddTask();
          }}
        >
          <Text style={styles.actionButtonText}>+ Task</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, { borderColor: colors.border, borderWidth: 1 }]}
          onPress={(e) => {
              e.stopPropagation();
              if (onAddProject) onAddProject();
          }}
        >
          <Text style={[styles.actionButtonText, { color: colors.text }]}>+ Project</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.s,
    ...SHADOWS.level1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    fontSize: 20,
    marginRight: SPACING.s,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
  },
  schedule: {
    fontSize: 12,
  },
  previewList: {
    marginTop: SPACING.s,
    paddingTop: SPACING.s,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0', 
  },
  previewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.s,
  },
  previewText: {
    fontSize: 13,
    flex: 1,
  },
  footer: {
      flexDirection: 'row',
      marginTop: SPACING.m,
      paddingTop: SPACING.s,
      gap: SPACING.s,
  },
  actionButton: {
      flex: 1,
      paddingHorizontal: SPACING.m,
      paddingVertical: 8,
      borderRadius: BORDER_RADIUS.small,
      alignItems: 'center',
      justifyContent: 'center',
  },
  actionButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFF',
  },
});
