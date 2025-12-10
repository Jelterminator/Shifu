import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BORDER_RADIUS, SPACING } from '../../constants/theme';
import { habitRepository } from '../../db/repositories/HabitRepository';
import { useThemeStore } from '../../stores/themeStore';
import type { Habit } from '../../types/database';

interface HabitStatsModalProps {
  habit: Habit | null;
  visible?: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

interface Stats {
  streak: number;
  totalCompleted: number;
  successRate: number;
  last30Days: boolean[];
  weeklyPattern: number[];
}

export const HabitStatsModal: React.FC<HabitStatsModalProps> = ({
  habit,
  visible,
  onClose,
  onEdit,
}) => {
  const { colors, phaseColor } = useThemeStore();
  const [stats, setStats] = useState<Stats | null>(null);

  // Use explicit visible prop if provided, otherwise fallback to !!habit
  const isVisible = visible !== undefined ? visible : !!habit;

  useEffect(() => {
    const loadStats = async (): Promise<void> => {
      if (habit && isVisible) {
        const data = await habitRepository.getStats(habit.id);
        setStats(data);
      }
    };
    void loadStats();
  }, [habit, isVisible]);

  if (!habit || !isVisible) return null;

  return (
    <Modal visible={isVisible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>Statistics</Text>
            {onEdit && (
              <TouchableOpacity onPress={onEdit}>
                <Text style={{ color: phaseColor, fontSize: 16, fontWeight: '600' }}>Edit</Text>
              </TouchableOpacity>
            )}
            {!onEdit && <View style={{ width: 50 }} />}
          </View>

          <View style={styles.habitHeader}>
            <Text style={[styles.habitTitle, { color: colors.text }]}>{habit.title}</Text>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
          </View>

          {stats ? (
            <View style={styles.statsContent}>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Current Streak:
                </Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stats.streak} days {stats.streak >= 3 ? '🔥' : ''}
                </Text>
              </View>
              {/* Note: Best Streak ideally requires historical analysis; using current for MVP if max not tracked */}
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Best Streak:
                </Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {Math.max(stats.streak, 0)} days
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Total Completed:
                </Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stats.totalCompleted} times
                </Text>
              </View>
              <View style={styles.statRow}>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
                  Success Rate:
                </Text>
                <Text style={[styles.statValue, { color: colors.text }]}>{stats.successRate}%</Text>
              </View>

              <Text style={[styles.sectionHeader, { color: colors.text }]}>Weekly Pattern</Text>
              <View style={styles.chartContainer}>
                {stats.weeklyPattern.map((count, index) => {
                  const max = Math.max(...stats.weeklyPattern, 1);
                  const height = (count / max) * 40; // Max height 40
                  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
                  return (
                    <View key={index} style={styles.barColumn}>
                      <View
                        style={[
                          styles.bar,
                          {
                            height,
                            backgroundColor: count > 0 ? phaseColor : colors.border,
                          },
                        ]}
                      />
                      <Text style={[styles.dayLabel, { color: colors.textSecondary }]}>
                        {days[index]}
                      </Text>
                    </View>
                  );
                })}
              </View>

              <Text style={[styles.sectionHeader, { color: colors.text }]}>Last 30 Days</Text>
              <View style={styles.heatmapContainer}>
                {stats.last30Days.map((completed, index) => (
                  <View
                    key={index}
                    style={[
                      styles.heatmapBlock,
                      {
                        backgroundColor: completed ? phaseColor : colors.border,
                        opacity: completed ? 1 : 0.3,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          ) : (
            <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 20 }}>
              Loading stats...
            </Text>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: SPACING.m,
  },
  container: {
    padding: SPACING.l,
    borderRadius: BORDER_RADIUS.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.m,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  habitHeader: {
    marginBottom: SPACING.l,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.s,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  statsContent: {
    gap: SPACING.s,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: SPACING.m,
    marginBottom: SPACING.s,
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 60,
    paddingBottom: SPACING.s,
  },
  barColumn: {
    alignItems: 'center',
    width: 20,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  dayLabel: {
    fontSize: 10,
  },
  heatmapContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  heatmapBlock: {
    width: 15,
    height: 15,
    borderRadius: 2,
  },
});
