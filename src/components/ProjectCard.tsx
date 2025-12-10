import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS, SEMANTIC_COLORS, SPACING } from '../constants/theme';
import { taskRepository } from '../db/repositories/TaskRepository';
import { useThemeStore } from '../stores/themeStore';
import type { Project, Task } from '../types/database';

interface ProjectCardProps {
  project: Project;
  onPress: () => void; // Opens edit usually
  onEdit?: () => void;
  onDelete?: () => void;
  onSubtaskChange?: () => void;
}

export function ProjectCard({
  project,
  onPress,
  onEdit,
  onSubtaskChange,
}: ProjectCardProps): React.JSX.Element {
  const { colors, phaseColor } = useThemeStore();
  const [subtasks, setSubtasks] = useState<Task[]>([]);

  const loadSubtasks = async () => {
    try {
      const tasks = await taskRepository.getTasksByProjectId(project.userId, project.id);
      setSubtasks(tasks);
    } catch (e) {
      console.error('Failed to load project subtasks', e);
    }
  };

  useEffect(() => {
    void loadSubtasks();
  }, [project.id, project.userId]);

  const handleToggleSubtask = async (task: Task) => {
      try {
          await taskRepository.update(task.id, { isCompleted: !task.isCompleted });
          await loadSubtasks();
          onSubtaskChange?.();
      } catch (e) {
          console.error("Failed to toggle subtask", e);
      }
  };

  // Aggregates
  const totalEffort = subtasks.reduce((sum, t) => sum + t.effortMinutes, 0);
  const completedEffort = subtasks
    .filter(t => t.isCompleted)
    .reduce((sum, t) => sum + t.effortMinutes, 0);
  
  // Urgency logic
  const daysUntilDeadline = project.deadline
    ? Math.max(0.1, Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (86400000)))
    : undefined;
  
  const minutesPerDay = daysUntilDeadline ? (totalEffort - completedEffort) / daysUntilDeadline : 0;
  
  let urgencyLabel = 'NORMAL';
  let urgencyColor = colors.textSecondary;
  if (minutesPerDay > 240) {
      urgencyLabel = 'CRITICAL';
      urgencyColor = SEMANTIC_COLORS.error;
  } else if (minutesPerDay > 120) {
      urgencyLabel = 'HIGH';
      urgencyColor = SEMANTIC_COLORS.warning;
  }

  return (
    <TouchableOpacity 
        style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} 
        onPress={onPress} 
        activeOpacity={0.9}
    >
      <View style={styles.header}>
        <View style={styles.headerTop}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.s, flex: 1 }}>
                <View style={[styles.badge, { backgroundColor: urgencyColor }]}>
                    <Text style={styles.badgeText}>{urgencyLabel}</Text>
                </View>
                <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>{project.title}</Text>
            </View>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        
        {/* Meta Info */}
        <View style={styles.metaRow}>
            {project.deadline && (
                <Text style={[styles.metaText, { color: colors.textSecondary }]}>📅 {new Date(project.deadline).toLocaleDateString()} ({Math.ceil(daysUntilDeadline || 0)} days)</Text>
            )}
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>⏱️ {Math.round(totalEffort / 60)}h total · Need {Math.round(minutesPerDay / 60 * 10) / 10}h/day</Text>
        </View>

        {/* Subtasks Preview */}
        {subtasks.length > 0 && (
            <View style={[styles.subtasksContainer, { backgroundColor: colors.background }]}>
                <Text style={[styles.subtasksHeader, { color: colors.textSecondary }]}>Subtasks:</Text>
                {subtasks.slice(0, 5).map((t, index) => (
                    <View key={t.id} style={styles.subtaskRow}>
                        <Text style={[styles.subtaskTitle, { color: colors.text, flex: 1 }, t.isCompleted && { textDecorationLine: 'line-through', color: colors.textSecondary }]} numberOfLines={1}>
                            {index + 1}. {t.title} ({t.effortMinutes}m)
                        </Text>
                        <TouchableOpacity onPress={(e) => {
                            e.stopPropagation();
                            void handleToggleSubtask(t);
                        }}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text style={[styles.subtaskStatus, { color: colors.text }]}>{t.isCompleted ? '☑' : '☐'}</Text>
                        </TouchableOpacity>
                    </View>
                ))}
                {subtasks.length > 5 && (
                    <Text style={[styles.moreText, { color: colors.textSecondary }]}>+ {subtasks.length - 5} more...</Text>
                )}
            </View>
        )}
        
        {/* Footer Actions */}
        <View style={styles.footer}>
            <TouchableOpacity onPress={onEdit}>
                <Text style={[styles.actionText, { color: phaseColor }]}>[✏️ Edit]</Text>
            </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.m,
    marginBottom: SPACING.m,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {},
  headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: SPACING.xs,
  },
  badge: {
      paddingHorizontal: SPACING.s,
      paddingVertical: 2,
      borderRadius: 4,
  },
  badgeText: {
      color: '#FFF',
      fontSize: 10,
      fontWeight: 'bold',
  },
  title: {
      fontSize: 16,
      fontWeight: '700',
      flex: 1,
  },
  divider: {
      height: 1,
      backgroundColor: '#EEE',
      marginTop: SPACING.xs,
      marginBottom: SPACING.s,
  },
  metaRow: {
      marginBottom: SPACING.m,
  },
  metaText: {
      fontSize: 13,
      marginBottom: 2,
  },
  subtasksContainer: {
      padding: SPACING.s,
      borderRadius: BORDER_RADIUS.small,
  },
  subtasksHeader: {
      fontSize: 12,
      fontWeight: '600',
      marginBottom: SPACING.xs,
  },
  subtaskRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
  },
  subtaskStatus: {
      fontSize: 18,
      marginLeft: SPACING.s,
  },
  subtaskTitle: {
      fontSize: 13,
  },
  completedText: {
      textDecorationLine: 'line-through',
  },
  moreText: {
      fontSize: 12,
      fontStyle: 'italic',
      marginTop: 2,
  },
  footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: SPACING.m,
      gap: SPACING.m,
  },
  actionText: {
      fontSize: 13,
      fontWeight: '600',
  }
});
