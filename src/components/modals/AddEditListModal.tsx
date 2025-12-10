import React, { useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { BORDER_RADIUS, DAYS, KEYWORDS, PHASES, SPACING } from '../../constants';
import { useListStore } from '../../stores/listStore';
import { useThemeStore } from '../../stores/themeStore';

interface AddEditListModalProps {
  visible: boolean;
  onClose: () => void;
  onSave?: () => void;
  initialListId?: string;
}

export function AddEditListModal({
  visible,
  onClose,
  onSave,
  initialListId,
}: AddEditListModalProps): React.JSX.Element {
  const { colors, phaseColor } = useThemeStore();
  const { addList, updateList } = useListStore();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📝');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [planDuringWork, setPlanDuringWork] = useState(true);
  const [planOutsideWork, setPlanOutsideWork] = useState(true);
  const [allowedDays, setAllowedDays] = useState<string[]>(DAYS);
  const [allowedPhases, setAllowedPhases] = useState<string[]>([...PHASES]);

  const handleSave = () => {
    const listData = {
      name,
      icon,
      keywords, // Already array
      plan_during_work: planDuringWork,
      plan_outside_work: planOutsideWork,
      allowedDays,
      allowedPhases,
      schedulingMode: 'Anytime' as const, // Default for now
    };

    if (initialListId) {
       updateList(initialListId, listData);
    } else {
       addList(listData);
    }

    onSave?.();
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setIcon('📝');
    setKeywords([]);
    setPlanDuringWork(true);
    setPlanOutsideWork(true);
    setAllowedDays(DAYS);
    setAllowedPhases([...PHASES]);
  }

  const toggleDay = (day: string) => {
    if (allowedDays.includes(day)) {
      setAllowedDays(allowedDays.filter(d => d !== day));
    } else {
      setAllowedDays([...allowedDays, day]);
    }
  };

  const togglePhase = (phase: string) => {
    if (allowedPhases.includes(phase)) {
      setAllowedPhases(allowedPhases.filter(p => p !== phase));
    } else {
      setAllowedPhases([...allowedPhases, phase]);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {initialListId ? 'Edit List' : 'New List'}
          </Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={{ color: colors.textSecondary }}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Name</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Work Projects"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Icon</Text>
            <TextInput
              style={[styles.input, { color: colors.text, borderColor: colors.border }]}
              value={icon}
              onChangeText={setIcon}
              placeholder="e.g. 💼"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Scheduling Rules</Text>
            
            <View style={styles.switchRow}>
              <Text style={{ color: colors.text }}>Plan during work hours</Text>
              <Switch value={planDuringWork} onValueChange={setPlanDuringWork} />
            </View>
             <View style={styles.switchRow}>
              <Text style={{ color: colors.text }}>Plan outside work hours</Text>
              <Switch value={planOutsideWork} onValueChange={setPlanOutsideWork} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Allowed Days</Text>
            <View style={styles.chipContainer}>
                {DAYS.map(day => (
                    <TouchableOpacity
                        key={day}
                        style={[
                            styles.chip, 
                            allowedDays.includes(day) && { backgroundColor: phaseColor }
                        ]}
                        onPress={() => toggleDay(day)}
                    >
                        <Text style={[
                             styles.chipText, 
                             { color: allowedDays.includes(day) ? '#fff' : colors.text }
                        ]}>
                            {day.slice(0, 3).toUpperCase()}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Allowed Phases</Text>
            <View style={styles.chipContainer}>
                {PHASES.map(phase => (
                    <TouchableOpacity
                        key={phase}
                        style={[
                            styles.chip, 
                            allowedPhases.includes(phase) && { backgroundColor: phaseColor }
                        ]}
                        onPress={() => togglePhase(phase)}
                    >
                         <Text style={[
                             styles.chipText, 
                             { color: allowedPhases.includes(phase) ? '#fff' : colors.text }
                        ]}>
                            {phase}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.text }]}>Keywords</Text>
            <View style={styles.keywordsContainer}>
               {KEYWORDS.map(keyword => {
                   const isSelected = keywords.includes(keyword);
                   return (
                       <TouchableOpacity
                           key={keyword}
                           style={[
                               styles.keywordChip, 
                               { 
                                   backgroundColor: isSelected ? phaseColor : colors.background,
                                   borderColor: isSelected ? phaseColor : colors.border
                               }
                           ]}
                           onPress={() => {
                               setKeywords(prev => 
                                   prev.includes(keyword) ? prev.filter(k => k !== keyword) : [...prev, keyword]
                               );
                           }}
                       >
                           <Text style={[
                                styles.keywordText, 
                                { color: isSelected ? '#fff' : colors.text }
                           ]}>
                               {keyword}
                           </Text>
                       </TouchableOpacity>
                   );
               })}
            </View>
          </View>

        </ScrollView>

        <View style={[styles.footer, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: phaseColor }]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Save List</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: SPACING.l,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    padding: SPACING.m,
  },
  formGroup: {
    marginBottom: SPACING.m,
  },
  label: {
    fontSize: 14,
    marginBottom: SPACING.xs,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.small,
    padding: SPACING.s,
    fontSize: 16,
  },
  section: {
    marginTop: SPACING.m,
    marginBottom: SPACING.m,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.s,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.s,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s,
  },
  chip: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: BORDER_RADIUS.large,
    borderWidth: 1,
    borderColor: '#e0e0e0', // TODO theme
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s,
  },
  keywordChip: {
    width: '30%', 
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
    padding: SPACING.m,
    borderTopWidth: 1,
    paddingBottom: SPACING.xl,
  },
  saveButton: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
