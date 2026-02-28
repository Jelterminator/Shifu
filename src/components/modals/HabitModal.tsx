import React, { useEffect, useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { PHASE_ICON_COMPONENTS } from '../../components/icons/AppIcons';
import {
    BORDER_RADIUS,
    KEYWORDS,
    PHASE_COLORS,
    PHASES,
    SPACING,
    WEEKDAY_ABBREVIATIONS,
} from '../../constants';
import { useThemeStore } from '../../stores/themeStore';
import type { Habit } from '../../types/database';

interface HabitModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (habitData: Partial<Habit>) => void;
  onDelete?: () => void;
  initialHabit?: Habit | null;
}

const DURATIONS = [5, 10, 15, 20, 30, 45, 60, 90];

export const HabitModal: React.FC<HabitModalProps> = ({
  visible,
  onClose,
  onSave,
  onDelete,
  initialHabit,
}) => {
  const { colors, phaseColor } = useThemeStore();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(15);
  const [idealPhase, setIdealPhase] = useState<string | undefined>(undefined);
  const [notes, setNotes] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [selectedDays, setSelectedDays] = useState({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: true,
    sunday: true,
  });

  // Weekly Goal State
  const [weeklyGoal, setWeeklyGoal] = useState('');
  const [manualGoal, setManualGoal] = useState(false);

  useEffect(() => {
    if (visible && initialHabit) {
      setTitle(initialHabit.title);
      setDuration(initialHabit.minimumSessionMinutes);
      setIdealPhase(initialHabit.idealPhase);
      setNotes(initialHabit.notes || '');
      setSelectedKeywords(initialHabit.selectedKeywords || []);
      setSelectedDays(initialHabit.selectedDays);
      setWeeklyGoal(String(initialHabit.weeklyGoalMinutes || 0));
      setManualGoal(true); // Existing habits are treated as manual (don't auto-update)
    } else if (visible) {
      // Reset for new habit
      setTitle('');
      setDuration(15);
      setIdealPhase(undefined);
      setNotes('');
      setSelectedKeywords([]);
      const defaultDays = {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true,
      };
      setSelectedDays(defaultDays);
      setWeeklyGoal(String(15 * 7)); // Default calculation
      setManualGoal(false);
    }
  }, [visible, initialHabit]);

  // Auto-calculate weekly goal for NEW habits only if not manually set
  useEffect(() => {
    if (!initialHabit && !manualGoal) {
      const count = Object.values(selectedDays).filter(Boolean).length;
      setWeeklyGoal(String(duration * count));
    }
  }, [duration, selectedDays, manualGoal, initialHabit]);

  const handleSave = (): void => {
    if (!title.trim()) return;
    const finalGoal = parseInt(weeklyGoal) || 0;

    onSave({
      title,
      minimumSessionMinutes: duration,
      weeklyGoalMinutes: finalGoal,
      selectedDays,
      idealPhase: (idealPhase ?? null) as Habit['idealPhase'],
      notes,
      selectedKeywords,
    });
    onClose();
  };

  const toggleDay = (day: keyof typeof selectedDays): void => {
    setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  const toggleKeyword = (keyword: string): void => {
    setSelectedKeywords(prev =>
      prev.includes(keyword) ? prev.filter(k => k !== keyword) : [...prev, keyword]
    );
  };

  const togglePhase = (phase: string): void => {
    setIdealPhase(current => (current === phase ? undefined : phase));
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {initialHabit ? 'Edit Habit' : 'New Habit'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>✕ Close</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content}>
            {/* Habit Name */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Habit Name</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.background,
                    borderColor: colors.textSecondary,
                  },
                ]}
                value={title}
                onChangeText={setTitle}
                placeholder="e.g. Morning Meditation"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Days of Week */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Active days</Text>
              <View style={styles.daysContainer}>
                {(
                  [
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                    'sunday',
                  ] as const
                ).map((day, index) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      {
                        backgroundColor: selectedDays[day] ? phaseColor : colors.background,
                        borderColor: selectedDays[day] ? phaseColor : colors.border,
                      },
                    ]}
                    onPress={() => toggleDay(day)}
                  >
                    <Text
                      style={[styles.dayText, { color: selectedDays[day] ? '#FFF' : colors.text }]}
                    >
                      {WEEKDAY_ABBREVIATIONS[index]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Duration */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Minimum session duration (minutes)
              </Text>
              <View style={styles.chipContainer}>
                {DURATIONS.map(min => (
                  <TouchableOpacity
                    key={min}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: duration === min ? phaseColor : colors.background,
                      },
                    ]}
                    onPress={() => setDuration(min)}
                  >
                    <Text
                      style={[styles.chipText, { color: duration === min ? '#FFF' : colors.text }]}
                    >
                      {min}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Weekly Goal */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Weekly goal (minutes)
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    backgroundColor: colors.background,
                    borderColor: colors.textSecondary,
                  },
                ]}
                value={weeklyGoal}
                onChangeText={text => {
                  setWeeklyGoal(text);
                  setManualGoal(true);
                }}
                keyboardType="numeric"
                placeholder="e.g. 120"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            {/* Ideal Phase */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>
                Ideal Phase (Optional)
              </Text>
              <View style={styles.phaseContainer}>
                {PHASES.map(phase => (
                  <TouchableOpacity
                    key={phase}
                    style={[
                      styles.phaseOption,
                      {
                        borderColor:
                          idealPhase === phase ? PHASE_COLORS[phase].primary : 'transparent',
                        backgroundColor:
                          idealPhase === phase
                            ? PHASE_COLORS[phase].light + '40'
                            : colors.background,
                      },
                    ]}
                    onPress={() => togglePhase(phase)}
                  >
                    {(() => {
                      const PhaseIco = PHASE_ICON_COMPONENTS[phase];
                      return PhaseIco ? (
                        <PhaseIco
                          color={
                            idealPhase === phase
                              ? PHASE_COLORS[phase].primary
                              : colors.textSecondary
                          }
                          size={20}
                        />
                      ) : null;
                    })()}
                    <Text style={[styles.phaseText, { color: colors.text }]}>{phase}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Keywords */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Keywords</Text>
              <View style={styles.keywordsContainer}>
                {KEYWORDS.map(keyword => {
                  const isSelected = selectedKeywords.includes(keyword);
                  return (
                    <TouchableOpacity
                      key={keyword}
                      style={[
                        styles.keywordChip,
                        {
                          backgroundColor: isSelected ? phaseColor : colors.background,
                          borderColor: isSelected ? phaseColor : colors.border,
                        },
                      ]}
                      onPress={() => toggleKeyword(keyword)}
                    >
                      <Text
                        style={[styles.keywordText, { color: isSelected ? '#FFF' : colors.text }]}
                      >
                        {keyword}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: title.trim() ? phaseColor : '#E0E0E0' },
              ]}
              onPress={handleSave}
              disabled={!title.trim()}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

            {initialHabit && onDelete && (
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { backgroundColor: 'transparent', marginTop: SPACING.s },
                ]}
                onPress={onDelete}
              >
                <Text style={{ color: '#FF3B30', fontWeight: '600', fontSize: 16 }}>
                  Delete Habit
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}; // End Component

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '90%',
    borderTopLeftRadius: BORDER_RADIUS.large,
    borderTopRightRadius: BORDER_RADIUS.large,
    padding: SPACING.m,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.l,
    paddingHorizontal: SPACING.s,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  section: {
    marginBottom: SPACING.l,
  },
  label: {
    fontSize: 14,
    marginBottom: SPACING.s,
    fontWeight: '500',
  },
  input: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 1,
    fontSize: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s,
  },
  chip: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: BORDER_RADIUS.circle,
  },
  daysContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.s,
  },
  dayButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  dayText: {
    fontSize: 12,
    fontWeight: '600',
  },
  chipText: {
    fontWeight: '600',
  },
  phaseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s,
  },
  phaseOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.s,
    padding: SPACING.s,
    borderRadius: BORDER_RADIUS.medium,
    borderWidth: 2,
    minWidth: '45%',
  },

  phaseText: {
    fontSize: 14,
    fontWeight: '600',
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  keywordChip: {
    width: '31%',
    marginBottom: SPACING.s,
    paddingVertical: SPACING.s,
    paddingHorizontal: 2,
    borderRadius: BORDER_RADIUS.small,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keywordText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  footer: {
    paddingTop: SPACING.m,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  saveButton: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
