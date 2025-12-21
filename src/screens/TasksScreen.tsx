import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BaseScreen } from '../components/BaseScreen';
import { ListCard } from '../components/ListCard';
import { AddEditListModal } from '../components/modals/AddEditListModal';
import { AddEditProjectModal } from '../components/modals/AddEditProjectModal';
import { AddEditTaskModal } from '../components/modals/AddEditTaskModal';
import { ListDetailsModal } from '../components/modals/ListDetailsModal';
import { TaskCard } from '../components/TaskCard';
import { BORDER_RADIUS, SPACING } from '../constants/theme';
import { planRepository } from '../db/repositories/PlanRepository';
import { taskRepository } from '../db/repositories/TaskRepository';
import { useListStore } from '../stores/listStore';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import type { Plan, Task } from '../types/database';
import type { MainTabScreenProps } from '../types/navigation';

export type TasksScreenProps = MainTabScreenProps<'Tasks'>;

export function TasksScreen(_props: TasksScreenProps): React.JSX.Element {
  const { colors, phaseColor } = useThemeStore();
  const { user } = useUserStore();
  const { lists } = useListStore();

  const [urgentTasks, setUrgentTasks] = useState<Task[]>([]);
  const [todayPlans, setTodayPlans] = useState<Plan[]>([]);
  const [todayTasks, setTodayTasks] = useState<Task[]>([]);
  const [listSummaries, setListSummaries] = useState<
    Record<string, { count: number; preview: Task[] }>
  >({});
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isListModalVisible, setIsListModalVisible] = useState(false);
  const [isAddListModalVisible, setIsAddListModalVisible] = useState(false);
  const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);

  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [initialTaskKeywords, setInitialTaskKeywords] = useState<string[] | undefined>(undefined);
  const [initialProjectKeywords, setInitialProjectKeywords] = useState<string[] | undefined>(
    undefined
  );

  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'normal' | 'all' | 'completed'>('normal');

  const loadData = useCallback(async () => {
    if (!user) return;
    setRefreshing(true);
    try {
      // Fetch urgent tasks (limit 3)
      const urgent = await taskRepository.getUrgentTasks(user.id!, 3);
      setUrgentTasks(urgent);

      // Fetch list summaries
      const summaries = await taskRepository.getListSummaries(user.id!, lists);
      setListSummaries(summaries);

      // Fetch today's plans for tasks
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      const plansForToday = await planRepository.getForDateRange(user.id!, startOfDay, endOfDay);
      const taskPlans = plansForToday.filter(p => p.sourceType === 'task');
      setTodayPlans(taskPlans);

      // Fetch corresponding tasks
      const taskIds = [...new Set(taskPlans.map(p => p.sourceId).filter(Boolean))] as string[];
      const tasksForToday: Task[] = [];
      for (const id of taskIds) {
        const t = await taskRepository.getById(id);
        if (t) tasksForToday.push(t);
      }
      setTodayTasks(tasksForToday);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setRefreshing(false);
    }
  }, [user, lists]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData])
  );

  const handleTaskComplete = async (task: Task): Promise<void> => {
    if (!user) return;
    try {
      const newCompleted = !task.isCompleted;

      // 1. Mark task complete
      await taskRepository.update(task.id, { isCompleted: newCompleted });

      // 2. Sync: Update plans
      const allPlansForTask = await planRepository.getBySourceId(user.id!, task.id, 'task');

      if (newCompleted) {
        if (allPlansForTask.length === 0) {
          // Unplanned completion: Create a hidden "Task Completion" plan
          // This ensures stats (if any) could track it, but Agenda hides it
          await planRepository.create(user.id!, {
            name: 'Task Completion',
            description: 'Unplanned completion',
            startTime: new Date(),
            endTime: new Date(new Date().getTime() + (task.effortMinutes || 30) * 60000),
            done: true,
            sourceId: task.id,
            sourceType: 'task',
            linkedObjectIds: [],
          });
        } else {
          // Scheduled: Mark all existing plans as done
          for (const plan of allPlansForTask) {
            await planRepository.update(plan.id, { done: true });
          }
        }
      } else {
        // Uncompleting
        for (const plan of allPlansForTask) {
          if (plan.name === 'Task Completion') {
            // If it was an unplanned completion plan, delete it (clean up)
            await planRepository.delete(plan.id);
          } else {
            await planRepository.update(plan.id, { done: false });
          }
        }
      }

      await loadData(); // Refresh to remove/update
    } catch (e) {
      console.error('Failed to update task', e);
    }
  };

  // Handler for toggling from Today's Tasks section - uses same logic
  const handleTodayTaskToggle = async (task: Task): Promise<void> => {
    // Just call the same handler - when task is completed, all plans get synced
    await handleTaskComplete(task);
  };

  const handleEditTask = (task: Task): void => {
    setEditingTask(task);
    setInitialTaskKeywords(undefined);
    setSelectedListId(null); // Or keep context if needed, but usually redundant for edit
    setIsTaskModalVisible(true);
  };

  const handleAddTask = (listId?: string, keywords?: string[]): void => {
    setEditingTask(undefined);
    setSelectedListId(listId || null);
    setInitialTaskKeywords(keywords);
    setIsTaskModalVisible(true);
  };

  const handleAddProject = (keywords?: string[]): void => {
    setInitialProjectKeywords(keywords);
    setIsProjectModalVisible(true);
  };

  const handleOpenList = (listId: string): void => {
    setSelectedListId(listId);
    setViewMode('normal');
    setIsListModalVisible(true);
  };

  const handleViewAllTasks = (): void => {
    setSelectedListId(null);
    setViewMode('all');
    setIsListModalVisible(true);
  };

  const handleViewCompletedTasks = (): void => {
    setSelectedListId(null);
    setViewMode('completed');
    setIsListModalVisible(true);
  };

  const hasNoTasks = urgentTasks.length === 0 && lists.length === 0;

  const renderEmptyState = (): React.JSX.Element => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>✓</Text>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>All tasks complete!</Text>
      <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
        Great work! Add a new task to keep the momentum going.
      </Text>
      <TouchableOpacity
        style={[styles.addTaskButton, { backgroundColor: phaseColor }]}
        onPress={() => handleAddTask()}
      >
        <Text style={styles.addTaskButtonText}>+ Add Task</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <BaseScreen title="Tasks">
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => void loadData()}
            tintColor={phaseColor}
          />
        }
      >
        {/* 1. Today's Tasks Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📅 Today&apos;s Tasks</Text>
          {todayTasks.length > 0 ? (
            <FlatList
              data={todayTasks}
              renderItem={({ item }) => {
                const plan = todayPlans.find(p => p.sourceId === item.id);
                return (
                  <TaskCard
                    task={item}
                    isCompleted={plan?.done ?? item.isCompleted}
                    useDefaultColor={true}
                    onPress={() => handleEditTask(item)}
                    onToggleComplete={() => void handleTodayTaskToggle(item)}
                  />
                );
              }}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          ) : (
            <Text
              style={{ color: colors.textSecondary, fontStyle: 'italic', marginBottom: SPACING.m }}
            >
              No tasks scheduled for today.
            </Text>
          )}
        </View>

        {/* 2. My Lists Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>📋 My Lists</Text>
          <FlatList
            data={lists}
            renderItem={({ item }) => (
              <ListCard
                list={item}
                count={listSummaries[item.id]?.count || 0}
                previewTasks={listSummaries[item.id]?.preview || []}
                onPress={() => handleOpenList(item.id)}
                onAddTask={() => handleAddTask(item.id, item.keywords)}
                onAddProject={() => handleAddProject(item.keywords)}
              />
            )}
            keyExtractor={item => item.id}
            scrollEnabled={false}
          />
          <TouchableOpacity
            style={[styles.addListButton]}
            onPress={() => setIsAddListModalVisible(true)}
          >
            <Text style={[styles.addListText, { color: colors.textSecondary }]}>+ Add List</Text>
          </TouchableOpacity>
        </View>

        {/* 3. Most Urgent Section */}
        {urgentTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>⚡ Most Urgent</Text>
            </View>
            <FlatList
              data={urgentTasks}
              renderItem={({ item }) => (
                <TaskCard
                  task={item}
                  onPress={() => handleEditTask(item)}
                  onToggleComplete={() => void handleTaskComplete(item)}
                />
              )}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          </View>
        )}

        {/* Footer Actions */}
        <TouchableOpacity
          style={{ paddingVertical: SPACING.m, alignItems: 'center' }}
          onPress={handleViewAllTasks}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: phaseColor }}>
            View all tasks sorted by urgency →
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={{ paddingVertical: SPACING.s, alignItems: 'center' }}
          onPress={handleViewCompletedTasks}
        >
          <Text style={{ fontSize: 14, fontWeight: '500', color: phaseColor }}>
            View completed tasks →
          </Text>
        </TouchableOpacity>

        {/* Fallback Empty State if truly nothing */}
        {hasNoTasks && renderEmptyState()}
      </ScrollView>

      {/* Modals */}
      <AddEditTaskModal
        visible={isTaskModalVisible}
        onClose={() => setIsTaskModalVisible(false)}
        task={editingTask}
        initialListId={selectedListId || undefined}
        initialKeywords={initialTaskKeywords}
        onSave={() => void loadData()}
      />

      <AddEditProjectModal
        visible={isProjectModalVisible}
        onClose={() => setIsProjectModalVisible(false)}
        initialKeywords={initialProjectKeywords}
        onSave={() => void loadData()}
      />

      <AddEditListModal
        visible={isAddListModalVisible}
        onClose={() => setIsAddListModalVisible(false)}
        onSave={() => void loadData()}
      />

      <ListDetailsModal
        visible={isListModalVisible}
        onClose={() => {
          setIsListModalVisible(false);
          setSelectedListId(null);
        }}
        listId={selectedListId}
        viewMode={viewMode} // Pass mode
        onUpdate={() => void loadData()}
      />
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.m,
    paddingBottom: SPACING.xxl + 80, // Space for FAB
  },
  section: {
    marginBottom: SPACING.l,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.s,
  },
  emptyState: {
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: SPACING.m,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: SPACING.s,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: SPACING.l,
    lineHeight: 24,
  },
  addTaskButton: {
    paddingHorizontal: SPACING.l,
    paddingVertical: SPACING.m,
    borderRadius: BORDER_RADIUS.medium,
  },
  addTaskButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  addListButton: {
    paddingVertical: SPACING.m,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.s,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: BORDER_RADIUS.medium,
    borderStyle: 'dashed',
  },
  addListText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default TasksScreen;
