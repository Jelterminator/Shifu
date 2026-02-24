import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AgendaTimeline, type TimelineEvent } from '../components/AgendaTimeline';
import { BaseScreen } from '../components/BaseScreen';
import { CalendarView } from '../components/CalendarView';
import { AppointmentModal } from '../components/modals/AppointmentModal';
import { PHASE_COLORS, SHADOWS } from '../constants/theme';
import { appointmentRepository } from '../db/repositories/AppointmentRepository';
import { habitRepository } from '../db/repositories/HabitRepository';
import { planRepository } from '../db/repositories/PlanRepository';
import { taskRepository } from '../db/repositories/TaskRepository';
import { schedulerAI } from '../services/ai/SchedulerAI';
import { anchorsService } from '../services/data/Anchors';
import { phaseManager, type WuXingPhase } from '../services/data/PhaseManager';
import { type ListConfiguration, useListStore } from '../stores/listStore';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import type { Habit, Task } from '../types/database';
import type { MainTabScreenProps } from '../types/navigation';

export type AgendaScreenProps = MainTabScreenProps<'Agenda'>;

export function AgendaScreen({ navigation }: AgendaScreenProps): React.JSX.Element {
  const colors = useThemeStore(state => state.colors);
  const phaseColor = useThemeStore(state => state.phaseColor);
  const { user } = useUserStore();
  const { lists } = useListStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [flexiblePlans, setFlexiblePlans] = useState<TimelineEvent[]>([]);
  const [fixedEvents, setFixedEvents] = useState<TimelineEvent[]>([]);
  const [dayPhases, setDayPhases] = useState<WuXingPhase[]>([]);

  // Modals
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);

  const loadData = useCallback(async (): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const phases = phaseManager.getPhasesForGregorianDate(selectedDate);
      setDayPhases(phases);

      let flexible: TimelineEvent[] = [];
      let fixed: TimelineEvent[] = [];

      // 1. Anchors
      if (Platform.OS !== 'web' || anchorsService.isInitialized()) {
        try {
          const rawAnchors = anchorsService.getAnchorsForDate(selectedDate);
          fixed = fixed.concat(
            rawAnchors.map(
              (a): TimelineEvent => ({
                id: a.id,
                title: a.title,
                startTime: a.startTime,
                durationMinutes: a.durationMinutes,
                type: 'anchor',
                color: PHASE_COLORS.METAL.primary,
              })
            )
          );
        } catch {
          // silent fail for anchors
        }
      }

      // 2. Appointments
      if (user?.id) {
        try {
          const appointments = await appointmentRepository.getForDate(user.id, selectedDate);
          fixed = fixed.concat(
            appointments.map((a): TimelineEvent => {
              const duration = (a.endTime.getTime() - a.startTime.getTime()) / (1000 * 60);
              return {
                id: a.id,
                title: a.name,
                startTime: a.startTime,
                durationMinutes: Math.round(duration),
                type: 'fixed',
                color: PHASE_COLORS.WATER.primary,
              };
            })
          );
        } catch {
          // silent fail
        }
      }

      // 3. Plans (AI Generated)
      if (user?.id) {
        try {
          const startOfDay = new Date(selectedDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(selectedDate);
          endOfDay.setHours(23, 59, 59, 999);

          const plans = await planRepository.getForDateRange(user.id, startOfDay, endOfDay);
          const filteredPlans = plans.filter(
            p =>
              !(
                (p.sourceType === 'habit' && p.name === 'Habit Completion') ||
                (p.sourceType === 'task' && p.name === 'Task Completion')
              )
          );

          // Build cache for habits and tasks
          const habitIds = [
            ...new Set(filteredPlans.filter(p => p.sourceType === 'habit').map(p => p.sourceId)),
          ].filter(Boolean) as string[];
          const taskIds = [
            ...new Set(filteredPlans.filter(p => p.sourceType === 'task').map(p => p.sourceId)),
          ].filter(Boolean) as string[];

          const habitMap: Record<string, Habit> = {};
          const taskMap: Record<string, Task> = {};

          await Promise.all([
            ...habitIds.map(async id => {
              const h = await habitRepository.getById(id);
              if (h) habitMap[id] = h;
            }),
            ...taskIds.map(async id => {
              const t = await taskRepository.getById(id);
              if (t) taskMap[id] = t;
            }),
          ]);

          flexible = filteredPlans
            .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
            .map((p): TimelineEvent => {
              const duration = (p.endTime.getTime() - p.startTime.getTime()) / 60000;
              let icon: string | undefined;
              let phase: string | undefined;

              if (p.sourceType === 'habit' && p.sourceId) {
                const habit = habitMap[p.sourceId];
                phase = habit?.idealPhase;
              } else if (p.sourceType === 'task' && p.sourceId) {
                const task = taskMap[p.sourceId];
                if (task) {
                  const list = lists.find((l: ListConfiguration) =>
                    task.selectedKeywords.some((k: string) => l.keywords.includes(k))
                  );
                  icon = list?.icon || 'default';
                }
              }

              return {
                id: p.id,
                title: p.name,
                durationMinutes: Math.round(duration),
                type: p.sourceType === 'habit' ? 'habit' : 'task',
                completed: !!p.done,
                color:
                  p.sourceType === 'habit' ? PHASE_COLORS.WOOD.primary : PHASE_COLORS.EARTH.primary,
                startTime: p.startTime,
                icon,
                phase,
              };
            });
        } catch {
          // silent fail
        }
      }

      setFlexiblePlans(flexible);
      setFixedEvents(fixed);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, user, lists]);

  const handleGenerateSchedule = async (): Promise<void> => {
    try {
      setLoading(true);
      const today = new Date();
      setSelectedDate(today);
      await schedulerAI.rescheduleFromNowUntilNextDay();
      await loadData();
      Alert.alert('Schedule Generated', 'Schedule updated for today and tomorrow.');
    } catch {
      setError('Failed to generate schedule');
      setLoading(false);
    }
  };

  const handleReorder = async (newSequence: TimelineEvent[]): Promise<void> => {
    // 1. Optimistic Update
    setFlexiblePlans(newSequence);

    // 2. Persist to DB
    if (user?.id) {
      try {
        const updates = [];

        for (const newPlan of newSequence) {
          if (newPlan.startTime && newPlan.id) {
            const durationMs = newPlan.durationMinutes * 60000;
            const endTime = new Date(newPlan.startTime.getTime() + durationMs);

            updates.push(
              planRepository.update(newPlan.id, {
                startTime: newPlan.startTime,
                endTime: endTime,
              })
            );
          }
        }

        await Promise.all(updates);
      } catch {
        Alert.alert('Save Failed', 'Could not save the new schedule.');
        void loadData();
      }
    }
  };

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleToggleComplete = async (id: string): Promise<void> => {
    // 1. Optimistic Update
    const updatedPlans = flexiblePlans.map((p): TimelineEvent => {
      if (p.id === id) {
        return { ...p, completed: !p.completed };
      }
      return p;
    });
    setFlexiblePlans(updatedPlans);

    // 2. Persist
    if (user?.id) {
      const plan = updatedPlans.find(p => p.id === id);
      if (plan) {
        try {
          await planRepository.update(id, {
            done: plan.completed,
            completedAt: plan.completed ? new Date() : undefined,
          });
        } catch {
          setFlexiblePlans(flexiblePlans);
        }
      }
    }
  };

  const handleSettingsPress = (): void => {
    navigation.navigate('Settings');
  };

  return (
    <BaseScreen
      title="Agenda"
      showSettings={true}
      onSettingsPress={handleSettingsPress}
      withTopPadding={false}
    >
      <View style={styles.header}>
        <CalendarView selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      </View>

      {loading && flexiblePlans.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator style={{ marginTop: 20 }} color={phaseColor} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading schedule...
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={[styles.errorText, { color: colors.text }]}>Failed to load schedule</Text>
          <Text style={[styles.errorDetail, { color: colors.textSecondary }]}>{error}</Text>
          <TouchableOpacity
            onPress={() => {
              void loadData();
            }}
            style={styles.retryButton}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <AgendaTimeline
          plans={flexiblePlans}
          fixedEvents={fixedEvents}
          phases={dayPhases}
          onReorder={seq => {
            void handleReorder(seq);
          }}
          onToggleComplete={id => {
            void handleToggleComplete(id);
          }}
          currentTime={new Date()}
          onSelectEvent={() => {
            // Handle event selection/edit
          }}
        />
      )}

      <View style={[styles.bottomButtonContainer, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          style={[styles.rescheduleButton, { backgroundColor: phaseColor }]}
          onPress={() => {
            void handleGenerateSchedule();
          }}
        >
          <Text style={styles.rescheduleButtonText}>Reschedule</Text>
        </TouchableOpacity>
      </View>

      <AppointmentModal
        visible={appointmentModalVisible}
        onClose={() => setAppointmentModalVisible(false)}
        initialDate={selectedDate}
        onSave={() => {
          void loadData();
        }}
      />
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#FFF',
    zIndex: 10,
    ...SHADOWS.level1,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },
  errorContainer: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 24,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#4A7C59',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    ...SHADOWS.level3,
  },
  fabIcon: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '600',
  },
  bottomButtonContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    ...SHADOWS.level4, // elevated to sit above content
  },
  rescheduleButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOWS.level2,
  },
  rescheduleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default AgendaScreen;
