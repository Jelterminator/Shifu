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
import { taskRepository } from '../db/repositories/TaskRepository';
import { useListStore } from '../stores/listStore';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import type { Task } from '../types/database';
import type { MainTabScreenProps } from '../types/navigation';

export type TasksScreenProps = MainTabScreenProps<'Tasks'>;

export function TasksScreen(_props: TasksScreenProps): React.JSX.Element {
  const { colors, phaseColor } = useThemeStore();
  const { user } = useUserStore();
  const { lists } = useListStore();

  const [urgentTasks, setUrgentTasks] = useState<Task[]>([]);
  const [listSummaries, setListSummaries] = useState<Record<string, { count: number; preview: Task[] }>>({});
  const [refreshing, setRefreshing] = useState(false);

  // Modal states
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);
  const [isListModalVisible, setIsListModalVisible] = useState(false);
  const [isAddListModalVisible, setIsAddListModalVisible] = useState(false);
  const [isProjectModalVisible, setIsProjectModalVisible] = useState(false);
  
  const [selectedListId, setSelectedListId] = useState<string | null>(null);
  const [initialTaskKeywords, setInitialTaskKeywords] = useState<string[] | undefined>(undefined);
  const [initialProjectKeywords, setInitialProjectKeywords] = useState<string[] | undefined>(undefined);
  
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
      await taskRepository.update(task.id, { isCompleted: !task.isCompleted });
      await loadData(); // Refresh to remove/update
    } catch (e) {
      console.error('Failed to update task', e);
    }
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
        {/* Urgent Section */}
        {urgentTasks.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                ⚡ Most Urgent
              </Text>
              <TouchableOpacity onPress={handleTaskComplete as any /* Hack for checkmark? No, separate mark done */}>
                 {/* Placeholder for header actions if needed */}
              </TouchableOpacity>
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
            <TouchableOpacity 
              style={{ paddingVertical: SPACING.m }} 
              onPress={handleViewAllTasks}
            >
              <Text style={{ fontSize: 14, fontWeight: '500', color: phaseColor }}>
                View all tasks sorted by priority →
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* My Lists Section */}
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

        {/* Completed Tasks Link */}
         <TouchableOpacity 
            style={{ paddingVertical: SPACING.m, alignItems: 'center' }} 
            onPress={handleViewCompletedTasks}
          >
           <Text style={{ fontSize: 14, fontWeight: '500', color: phaseColor }}>
             View Completed Tasks →
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
    padding: SPACING.m,
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
