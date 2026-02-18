import React, { useCallback, useEffect, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BaseScreen } from '../components/BaseScreen';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';
import { HabitModal } from '../components/modals/HabitModal';
import { HabitStatsModal } from '../components/modals/HabitStatsModal';

import {
  BORDER_RADIUS,
  PHASE_ICONS,
  SHADOWS,
  SPACING,
  WEEKDAY_ABBREVIATIONS,
} from '../constants/theme';
import { habitRepository } from '../db/repositories/HabitRepository';
import { planRepository } from '../db/repositories/PlanRepository';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import type { Habit, Plan } from '../types/database';
import type { HabitsScreenProps } from '../types/navigation';

export type { HabitsScreenProps };

// Helper function
const getPhaseIcon = (idealPhase?: string): string => {
  if (!idealPhase) return '🌳';
  return PHASE_ICONS[idealPhase] || '🌳';
};
export function HabitsScreen({ navigation }: HabitsScreenProps): React.JSX.Element {
  const [loading, setLoading] = useState(true);
  const [weeklyProgress, setWeeklyProgress] = useState({ totalGoal: 0, currentProgress: 0 });
  const [habitsWithHistory, setHabitsWithHistory] = useState<
    { habit: Habit; history: boolean[]; streak: number; weeklyProgress: number }[]
  >([]);
  // State to hold today's plans for smart toggling and filtering
  const [todayPlans, setTodayPlans] = useState<Plan[]>([]);

  // Modals state
  const [habitModalVisible, setHabitModalVisible] = useState(false);
  // ...
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [statsHabit, setStatsHabit] = useState<Habit | null>(null);
  const [deleteConfirmationVisible, setDeleteConfirmationVisible] = useState(false);
  const [habitToDelete, setHabitToDelete] = useState<Habit | null>(null);

  const userId = useUserStore(state => state.user.id);
  const { colors, phaseColor } = useThemeStore();

  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);

      const [weekly, dashboardData, todaysPlansData] = await Promise.all([
        habitRepository.getWeeklyOverallProgress(userId),
        habitRepository.getHabitsWithDashboardData(userId),
        planRepository.getForDateRange(userId, startOfDay, endOfDay),
      ]);
      setWeeklyProgress(weekly);
      setHabitsWithHistory(dashboardData);
      setTodayPlans(todaysPlansData);
    } catch (error) {
      console.error('Failed to load habits:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleToggleCompletion = async (habit: Habit, dateDate?: Date): Promise<void> => {
    if (!userId) return;
    const date = dateDate || new Date();

    // Only use plan-based toggle for "Today" interactions
    const isToday = !dateDate || dateDate.toDateString() === new Date().toDateString();

    try {
      // Determine current completion state from history
      let isCurrentlyCompleted = false;
      const habitEntry = habitsWithHistory.find(h => h.habit.id === habit.id);
      if (habitEntry) {
        const today = new Date();
        const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
        const index = 6 - diffDays;
        if (index >= 0 && index < 7) {
          isCurrentlyCompleted = !!habitEntry.history[index];
        }
      }

      const shouldComplete = !isCurrentlyCompleted;

      if (isToday) {
        // Find today's plan for this habit (at most 1)
        const todayPlan = todayPlans.find(p => p.sourceId === habit.id && p.sourceType === 'habit');

        if (todayPlan) {
          // Plan exists: just toggle its done status
          await planRepository.update(todayPlan.id, { done: shouldComplete });
          void loadData();
          return;
        }
      }

      // Fallback: No plan exists (or editing past days) - use legacy behavior
      if (!shouldComplete) {
        await habitRepository.undoCompletion(habit.id, date);
      } else {
        await habitRepository.trackCompletion(userId, habit.id, date, habit.minimumSessionMinutes);
      }

      void loadData();
    } catch (error) {
      console.error('Failed to toggle completion:', error);
    }
  };

  const handleSaveHabit = async (habitData: Partial<Habit>): Promise<void> => {
    if (!userId) return;
    try {
      if (editingHabit) {
        await habitRepository.update(editingHabit.id, habitData);
      } else {
        await habitRepository.create(userId, {
          title: habitData.title!,
          minimumSessionMinutes: habitData.minimumSessionMinutes || 15,
          weeklyGoalMinutes: habitData.weeklyGoalMinutes || 60,
          selectedDays: habitData.selectedDays || {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: true,
            sunday: true,
          },
          selectedKeywords: habitData.selectedKeywords || [],
          idealPhase: habitData.idealPhase,
          notes: habitData.notes,
          isActive: true,
          linkedObjectIds: [],
        });
      }
      void loadData();
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  const openAddModal = (): void => {
    setEditingHabit(null);
    setHabitModalVisible(true);
  };

  const openEditModal = (habit: Habit): void => {
    setHabitStatsVisible(false); // close stats if open
    setEditingHabit(habit);
    setHabitModalVisible(true);
  };

  const [habitStatsVisible, setHabitStatsVisible] = useState(false);
  const openStats = (habit: Habit): void => {
    setStatsHabit(habit);
    setHabitStatsVisible(true);
  };

  // derived data
  const { totalGoal, currentProgress } = weeklyProgress;
  const progressPercentage = totalGoal > 0 ? Math.min(100, (currentProgress / totalGoal) * 100) : 0;

  // Today's Habits: Filter habits that have a corresponding plan for today
  const todaysHabits = habitsWithHistory.filter(h => {
    // Check if there is a plan for this habit in todayPlans
    // Typed as any temporarily
    return todayPlans.some(p => p.sourceId === h.habit.id && p.sourceType === 'habit');
  });

  const renderProgressBar = (): React.JSX.Element => (
    <View style={[styles.progressContainer, { backgroundColor: colors.surface }]}>
      <Text style={[styles.progressTitle, { color: colors.text }]}>Weekly Goal Progress</Text>
      <View style={[styles.progressBar, { backgroundColor: colors.border }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${progressPercentage}%`, backgroundColor: phaseColor },
          ]}
        />
      </View>
      <Text style={[styles.progressText, { color: colors.text }]}>
        {currentProgress}/{totalGoal}m
      </Text>
      {currentProgress >= totalGoal && totalGoal > 0 && (
        <Text style={[styles.encouragement, { color: colors.textSecondary }]}>
          Weekly Goal Reached! 🎉
        </Text>
      )}
    </View>
  );

  const renderTodayHabit = ({
    item,
  }: {
    item: { habit: Habit; history: boolean[]; streak: number; weeklyProgress: number };
  }): React.JSX.Element => {
    const isCompleted = item.history[6]; // Last item is today
    return (
      <View style={[styles.miniCard, { backgroundColor: colors.surface }]}>
        <View style={styles.miniCardContent}>
          <Text style={[styles.miniTitle, { color: colors.text }]}>{item.habit.title}</Text>
          <Text style={[styles.miniMeta, { color: colors.textSecondary }]}>
            {getPhaseIcon(item.habit.idealPhase)} {item.habit.minimumSessionMinutes}m
          </Text>
        </View>
        <TouchableOpacity onPress={() => void handleToggleCompletion(item.habit)}>
          <View
            style={[
              styles.checkbox,
              {
                borderColor: isCompleted ? phaseColor : colors.textSecondary,
                backgroundColor: isCompleted ? phaseColor : 'transparent',
              },
            ]}
          >
            {isCompleted && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  const renderHistoryBubble = (
    habit: Habit,
    dayIndex: number,
    isCompleted: boolean
  ): React.JSX.Element => {
    // dayIndex 0 (T-6) to 6 (T-0)
    // Calculate date for toggle
    const today = new Date();
    const diff = 6 - dayIndex;
    const d = new Date(today);
    d.setDate(today.getDate() - diff);

    // WEEKDAY_ABBREVIATIONS is ['M', 'T', 'W', 'T', 'F', 'S', 'S'] (Mon-Sun)
    // d.getDay(): 0=Sun, 1=Mon.
    // 1=Mon -> index 0. 0=Sun -> index 6.
    const labelIndex = d.getDay() === 0 ? 6 : d.getDay() - 1;

    return (
      <TouchableOpacity
        key={dayIndex}
        onPress={() => void handleToggleCompletion(habit, d)}
        style={styles.historyBubbleContainer}
      >
        <Text style={[styles.historyLabel, { color: colors.textSecondary }]}>
          {WEEKDAY_ABBREVIATIONS[labelIndex]}
        </Text>
        <View
          style={[
            styles.historyBubble,
            {
              borderColor: isCompleted ? phaseColor : colors.border,
              backgroundColor: isCompleted ? phaseColor : 'transparent',
            },
          ]}
        >
          {isCompleted && <Text style={[styles.checkmarkSmall, { color: '#FFF' }]}>✓</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFullHabit = ({
    item,
  }: {
    item: { habit: Habit; history: boolean[]; streak: number; weeklyProgress: number };
  }): React.JSX.Element => {
    const goal = item.habit.weeklyGoalMinutes || 0;
    return (
      <View
        style={[styles.fullCard, { backgroundColor: colors.surface, borderLeftColor: phaseColor }]}
      >
        <TouchableOpacity style={styles.fullCardHeader} onPress={() => openStats(item.habit)}>
          <Text style={[styles.fullTitle, { color: colors.text }]}>{item.habit.title}</Text>
          <View style={styles.statsRow}>
            <Text style={[styles.fullMeta, { color: colors.textSecondary, marginRight: 12 }]}>
              🔥 {item.streak}
            </Text>
            <Text style={[styles.fullMeta, { color: colors.textSecondary }]}>
              ⏳ {item.weeklyProgress}/{goal}m
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.historyRow}>
          {item.history.map((done, idx) => renderHistoryBubble(item.habit, idx, done))}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <BaseScreen title="Habits">
        <View style={styles.centered}>
          <Text style={{ color: colors.text }}>Loading...</Text>
        </View>
      </BaseScreen>
    );
  }

  const renderContent = (): React.JSX.Element => (
    <View style={styles.contentContainer}>
      <View style={{ marginBottom: 24 }}>{renderProgressBar()}</View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Today&apos;s Habits</Text>
      <FlatList
        data={todaysHabits}
        renderItem={renderTodayHabit}
        keyExtractor={item => item.habit.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <Text style={{ color: colors.textSecondary, fontStyle: 'italic', marginBottom: 16 }}>
            No active habits for today.
          </Text>
        }
      />

      <Text style={[styles.sectionTitle, { color: colors.text, marginTop: SPACING.l }]}>
        All Habits
      </Text>
      <FlatList
        data={habitsWithHistory}
        renderItem={renderFullHabit}
        keyExtractor={item => item.habit.id}
        scrollEnabled={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Start your journey</Text>
            <Text style={{ color: colors.textSecondary }}>Add a habit to track your progress.</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: phaseColor }]}
          onPress={openAddModal}
        >
          <Text style={styles.addButtonText}>+ Add Habit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.configButton, { borderColor: phaseColor }]}
          onPress={() => navigation.navigate('SpiritualPracticesSetup', { isEditing: true })}
        >
          <Text style={[styles.configButtonText, { color: phaseColor }]}>
            🙏 Reconfigure Spiritual Disciplines
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const handleDeleteHabit = (habit: Habit): void => {
    setHabitToDelete(habit);
    setDeleteConfirmationVisible(true);
  };

  const executeDeleteHabit = async (): Promise<void> => {
    if (!userId || !habitToDelete) return;
    try {
      await habitRepository.delete(habitToDelete.id);
      setHabitModalVisible(false);
      setDeleteConfirmationVisible(false); // Close confirmation
      setHabitToDelete(null);
      void loadData();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete habit');
    }
  };

  return (
    <BaseScreen navigation={navigation} title="Habits" footer={null}>
      <FlatList
        contentContainerStyle={styles.listContent}
        data={[{ key: 'main' }]}
        renderItem={renderContent}
        refreshing={loading}
        onRefresh={() => void loadData()}
      />

      <HabitModal
        visible={habitModalVisible}
        onClose={() => setHabitModalVisible(false)}
        onSave={data => void handleSaveHabit(data)}
        initialHabit={editingHabit}
        onDelete={() => editingHabit && handleDeleteHabit(editingHabit)}
      />

      <HabitStatsModal
        visible={habitStatsVisible}
        habit={statsHabit}
        onClose={() => setHabitStatsVisible(false)}
        onEdit={() => statsHabit && openEditModal(statsHabit)}
      />

      <ConfirmationModal
        visible={deleteConfirmationVisible}
        title="Delete Habit"
        message="Are you sure you want to delete this habit? All history will be lost."
        onConfirm={() => void executeDeleteHabit()}
        onCancel={() => {
          setDeleteConfirmationVisible(false);
          setHabitToDelete(null);
        }}
        confirmLabel="Delete"
        isDestructive
      />
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 100,
  },
  contentContainer: {
    paddingHorizontal: SPACING.m,
  },
  empty: {
    padding: 20,
    alignItems: 'center',
  },
  emptyTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 8,
  },
  progressContainer: {
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.m,
    marginBottom: 16,
    ...SHADOWS.level1,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: SPACING.s,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    width: '100%',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
    alignSelf: 'flex-end',
    fontWeight: '500',
  },
  encouragement: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: SPACING.m,
  },
  miniCard: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.s,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    // shadow
    ...SHADOWS.level1,
  },
  miniCardContent: {
    flex: 1,
  },
  miniTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  miniMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  checkmarkSmall: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  fullCard: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.m,
    borderLeftWidth: 4,
    // shadow
    ...SHADOWS.level1,
  },
  fullCardHeader: {
    marginBottom: SPACING.m,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fullTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  fullMeta: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  historyBubbleContainer: {
    alignItems: 'center',
    gap: 4,
  },
  historyLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  historyBubble: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { marginTop: SPACING.l, gap: SPACING.m },
  addButton: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
  },
  addButtonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  configButton: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    alignItems: 'center',
  },
  configButtonText: { fontSize: 14, fontWeight: '600' },
});
