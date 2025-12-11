import React, { useCallback, useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS, SPACING } from '../../constants/theme';
import { projectRepository } from '../../db/repositories/ProjectRepository';
import { taskRepository } from '../../db/repositories/TaskRepository';
import { useListStore } from '../../stores/listStore';
import { useThemeStore } from '../../stores/themeStore';
import { useUserStore } from '../../stores/userStore';
import type { Project, Task } from '../../types/database';
import { ProjectCard } from '../ProjectCard';
import { TaskCard } from '../TaskCard';
import { AddEditListModal } from './AddEditListModal';
import { AddEditProjectModal } from './AddEditProjectModal';
import { AddEditTaskModal } from './AddEditTaskModal';

interface ListDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  listId: string | null;
  viewMode?: 'normal' | 'all' | 'completed';
  onUpdate?: () => void; // Trigger parent refresh
}

type ListItem = { type: 'task'; data: Task } | { type: 'project'; data: Project };

export function ListDetailsModal({
  visible,
  onClose,
  listId,
  viewMode = 'normal',
  onUpdate,
}: ListDetailsModalProps): React.JSX.Element {
  const { colors, phaseColor } = useThemeStore();
  const { lists } = useListStore();
  const { user } = useUserStore();

  const list = lists.find(l => l.id === listId);
  const [items, setItems] = useState<ListItem[]>([]);

  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isEditListModalVisible, setIsEditListModalVisible] = useState(false);
  const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);

  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

  const isAllMode = viewMode === 'all';
  const isCompletedMode = viewMode === 'completed' || listId === 'COMPLETED';

  const loadData = useCallback(async (): Promise<void> => {
    if (!user) return;
    if (!user.id) return;
    try {
      let tasks: Task[] = [];
      let projects: Project[] = [];

      if (isCompletedMode) {
        tasks = await taskRepository.getCompletedTasks(user.id, 50);
        // We could also fetch completed projects if needed, but keeping simple for now.
      } else if (isAllMode) {
        tasks = await taskRepository.getAllForUser(user.id, false);
        projects = await projectRepository.getAllForUser(user.id); // Need an Active Projects only filter potentially?
        // Let's filter projects in memory if needed or repo update.
        // Assuming getAllForUser returns all.
        // We probably only want active projects.
        // Repository update might be needed or just filter.
        // Project doesn't have isCompleted in type def explicitly?
        // It does: `isCompleted?: boolean` in `Project` interface?
        // Let's check type. existing code uses `isCompleted`.

        // Filter active projects
        projects = projects.filter(p => !p.isCompleted);
      } else if (list) {
        // Specific list by Keyword
        const allTasks = await taskRepository.getAllForUser(user.id, false);
        tasks = allTasks.filter(t => t.selectedKeywords.some(k => list.keywords.includes(k)));

        // Fetch projects by keyword
        const allProjects = await projectRepository.getAllForUser(user.id);
        projects = allProjects.filter(
          p =>
            !p.isCompleted &&
            p.selectedKeywords &&
            p.selectedKeywords.some(k => list.keywords.includes(k))
        );
      }

      // Filter out tasks that belong to an active project
      const projectIds = new Set(projects.map(p => p.id));
      const standaloneTasks = tasks.filter(t => !t.projectId || !projectIds.has(t.projectId));

      // Filter projects: Hide if they have NO active subtasks
      // We need to check against ALL active tasks to see if project has any children
      const allActiveTasks = await taskRepository.getAllForUser(user.id, false);
      const activeProjectIdsWithTasks = new Set(
        allActiveTasks.map(t => t.projectId).filter(Boolean)
      );

      const activeProjectsWithTasks = projects.filter(p => activeProjectIdsWithTasks.has(p.id));

      // Combine
      const taskItems: ListItem[] = standaloneTasks.map(t => ({ type: 'task', data: t }));
      const projectItems: ListItem[] = activeProjectsWithTasks.map(p => ({
        type: 'project',
        data: p,
      }));

      // Sort
      // Combine and Sort
      // Combine and Sort
      const combined = [...projectItems, ...taskItems].sort((a, b) => {
        if (isAllMode) {
          // Sort by Urgency (minutesPerDay) descending
          // Projects don't have minutesPerDay calculated in mapper yet, so we treat them as neutral or calculate here?
          // For now, let's assume Projects are important but tasks might be more urgent.
          // We can check if a/b is project/task.
          const getScore = (item: ListItem): number => {
            if (item.type === 'task') return item.data.minutesPerDay || 0;
            // Give projects a default high urgency or based on deadline?
            // Let's use a proxy: if deadline < 2 days, very high.
            // For now, let's just use 0 for projects to let them sink, OR keep them mixed by ID?
            // User said "Projects are not special".
            // If they have no deadline, they have 0 urgency.
            return 0;
          };

          const scoreA = getScore(a);
          const scoreB = getScore(b);

          // If scores are similar (both 0), fallback to createdAt
          if (Math.abs(scoreA - scoreB) < 0.1) {
            return new Date(b.data.createdAt).getTime() - new Date(a.data.createdAt).getTime();
          }
          return scoreB - scoreA;
        }

        // Default: Sort by createdAt descending (newest first)
        const dateA = new Date(a.data.createdAt).getTime();
        const dateB = new Date(b.data.createdAt).getTime();
        return dateB - dateA;
      });

      setItems(combined);
    } catch (e) {
      console.error('Error loading list data', e);
    }
  }, [user, list, isAllMode, isCompletedMode]);

  useEffect(() => {
    if (visible && user) {
      void loadData();
    }
  }, [visible, user, list, loadData]);

  const handleAddProject = (): void => {
    setEditingProject(undefined);
    setIsProjectModalVisible(true);
  };

  const handleEditProject = (project: Project): void => {
    setEditingProject(project);
    setIsProjectModalVisible(true);
  };

  const handleTaskComplete = async (task: Task): Promise<void> => {
    try {
      await taskRepository.update(task.id, { isCompleted: !task.isCompleted });
      await loadData();
      onUpdate?.();
    } catch (e) {
      console.error('Error toggling task', e);
    }
  };

  const handleAddTask = (): void => {
    setEditingTask(undefined);
    setIsTaskModalVisible(true);
  };

  const handleEditTask = (task: Task): void => {
    setEditingTask(task);
    setIsTaskModalVisible(true);
  };

  const getTitle = (): string => {
    if (isCompletedMode) return 'Completed Tasks';
    if (isAllMode) return 'All Tasks (Urgency)';
    return list?.name || 'List Details';
  };

  const getIcon = (): string => {
    if (isCompletedMode) return '✅';
    if (isAllMode) return '⚡';
    return list?.icon || '📝';
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true} // Changed to transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          {/* Top Action Bar */}
          <View style={styles.actionBar}>
            {/* Edit Button - Top Left */}
            {list && !isAllMode && !isCompletedMode ? (
              <TouchableOpacity onPress={() => setIsEditListModalVisible(true)}>
                <Text style={{ color: phaseColor, fontSize: 16, fontWeight: '600' }}>Edit</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} /> // Spacer to balance
            )}

            {/* Close Functionality - Top Right */}
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.header}>
            <View>
              <Text style={styles.icon}>{getIcon()}</Text>
              <Text style={[styles.title, { color: colors.text }]}>{getTitle()}</Text>
              <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                {items.length} items
              </Text>
            </View>
          </View>

          <View style={styles.content}>
            <FlatList
              data={items}
              renderItem={({ item }) => {
                if (item.type === 'project') {
                  return (
                    <ProjectCard
                      project={item.data}
                      onPress={() => handleEditProject(item.data)}
                      onEdit={() => handleEditProject(item.data)}
                      onSubtaskChange={() => {
                        void loadData();
                        onUpdate?.();
                      }}
                      // onDelete TODO
                    />
                  );
                }
                return (
                  <TaskCard
                    task={item.data}
                    onPress={() => handleEditTask(item.data)}
                    onToggleComplete={
                      isCompletedMode ? undefined : () => void handleTaskComplete(item.data)
                    }
                  />
                );
              }}
              keyExtractor={item => `${item.type}-${item.data.id}`}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          </View>

          {!isCompletedMode && !isAllMode && (
            <View
              style={[
                styles.footer,
                { backgroundColor: colors.surface, borderTopColor: colors.border },
              ]}
            >
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: phaseColor }]}
                onPress={handleAddTask}
              >
                <Text style={styles.addButtonText}>+ Add Task {list ? `to ${list.name}` : ''}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.addButton,
                  {
                    marginTop: SPACING.s,
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                  },
                ]}
                onPress={handleAddProject}
              >
                <Text style={[styles.addButtonText, { color: colors.text }]}>+ Add Project</Text>
              </TouchableOpacity>
            </View>
          )}

          <AddEditTaskModal
            visible={isTaskModalVisible}
            onClose={() => setIsTaskModalVisible(false)}
            task={editingTask}
            initialListId={list?.id}
            onSave={() => {
              void loadData();
              onUpdate?.();
            }}
          />

          <AddEditListModal
            visible={isEditListModalVisible}
            onClose={() => setIsEditListModalVisible(false)}
            initialListId={list?.id}
            onSave={() => {
              void loadData();
              onUpdate?.();
            }}
          />

          <AddEditProjectModal
            visible={isProjectModalVisible}
            onClose={() => setIsProjectModalVisible(false)}
            project={editingProject}
            initialKeywords={list ? list.keywords : undefined}
            onSave={() => {
              void loadData();
              onUpdate?.();
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '85%', // Not full screen
    borderTopLeftRadius: BORDER_RADIUS.large,
    borderTopRightRadius: BORDER_RADIUS.large,
    overflow: 'hidden',
  },
  actionBar: {
    paddingHorizontal: SPACING.l,
    paddingTop: SPACING.l,
    paddingBottom: SPACING.s,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: SPACING.l,
    paddingBottom: SPACING.l,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 14,
    marginTop: SPACING.xs,
  },
  editBtn: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: BORDER_RADIUS.medium,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.m,
  },
  footer: {
    padding: SPACING.m,
    paddingBottom: SPACING.xl, // Safe area
    borderTopWidth: 1,
  },
  addButton: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
