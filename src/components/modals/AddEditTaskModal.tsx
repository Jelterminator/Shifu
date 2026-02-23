import React, { useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BORDER_RADIUS, KEYWORDS, SHADOWS, SPACING } from '../../constants';
import { taskRepository } from '../../db/repositories/TaskRepository';
import { useListStore } from '../../stores/listStore';
import { useThemeStore } from '../../stores/themeStore';
import { useUserStore } from '../../stores/userStore';
import type { Task } from '../../types/database';
import { LIST_ICONS } from '../icons/AppIcons';
import { ConfirmationModal } from './ConfirmationModal';

interface AddEditTaskModalProps {
  visible: boolean;
  onClose: () => void;
  task?: Task;
  onSave?: () => void;
  initialListId?: string;
  initialProjectId?: string;
  initialDeadline?: Date;
  initialKeywords?: string[];
  isSubtaskMode?: boolean;
}

export function AddEditTaskModal({
  visible,
  onClose,
  task,
  onSave,
  initialListId,
  initialProjectId,
  initialDeadline,
  initialKeywords,
  isSubtaskMode = false,
}: AddEditTaskModalProps): React.JSX.Element {
  const { colors, phaseColor } = useThemeStore();
  const { lists } = useListStore();
  const { user } = useUserStore();

  const [title, setTitle] = useState('');
  const [effortMinutes, setEffortMinutes] = useState('30');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [deadlineText, setDeadlineText] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteConfVisible, setDeleteConfVisible] = useState(false);

  useEffect(() => {
    if (visible && task) {
      setTitle(task.title);
      setEffortMinutes(task.effortMinutes.toString());
      setNotes(task.notes || '');
      setDeadlineText(task.deadline ? new Date(task.deadline).toISOString().slice(0, 10) : '');
      setSelectedKeywords(task.selectedKeywords || []);
    } else if (visible) {
      // New task
      setTitle('');
      setEffortMinutes('30');
      setNotes('');
      // Inherit deadline if provided
      setDeadlineText(initialDeadline ? initialDeadline.toISOString().slice(0, 10) : '');

      if (initialListId) {
        const list = lists.find(l => l.id === initialListId);
        if (list) setSelectedKeywords(list.keywords || []);
      } else if (initialKeywords) {
        // Inherit keywords (e.g. from Project)
        setSelectedKeywords(initialKeywords);
      } else {
        setSelectedKeywords([]);
      }
    }
  }, [visible, task, initialListId, lists, initialDeadline, initialKeywords]);

  const handleSave = async (closeAfter = true): Promise<void> => {
    if (!user) return;

    // If title is empty:
    // - If closing (Done), just close.
    // - If staying (Create Next), do nothing.
    if (!title.trim()) {
      if (closeAfter) {
        onClose();
      }
      return;
    }

    setLoading(true);

    try {
      let deadline: Date | undefined;
      // Simple validation for YYYY-MM-DD
      if (deadlineText.match(/^\d{4}-\d{2}-\d{2}$/)) {
        deadline = new Date(deadlineText);
      }

      const data = {
        title: title.trim(),
        effortMinutes: parseInt(effortMinutes) || 30,
        notes: notes.trim(),
        selectedKeywords, // Array
        deadline,
        projectId: initialProjectId, // Inherit project ID
      };

      if (task) {
        await taskRepository.update(task.id, data);
      } else {
        await taskRepository.create(user.id!, data);
      }

      onSave?.();

      if (closeAfter) {
        onClose();
      } else {
        // Reset for next task
        setTitle('');
        setEffortMinutes('30');
        setNotes('');
        // Keep deadline and keywords as is for batch entry
      }
    } catch (e) {
      console.error('Failed to save task', e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (): void => {
    if (!task) return;
    setDeleteConfVisible(true);
  };

  const executeDelete = async (): Promise<void> => {
    if (!task) return;
    try {
      await taskRepository.delete(task.id);
      setDeleteConfVisible(false);
      onSave?.();
      onClose();
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to delete task');
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {task ? 'Edit Task' : 'New Task'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={[styles.closeButton, { color: colors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            {/* Title Input */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Title</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="What needs doing?"
              placeholderTextColor={colors.textSecondary}
              autoFocus={!task}
            />

            {/* List Selection - Hidden in Subtask Mode */}
            {!isSubtaskMode && (
              <>
                <Text style={[styles.label, { color: colors.textSecondary }]}>List</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.listSelector}
                >
                  {lists.map(list => {
                    const isSelected = selectedKeywords.some(k => list.keywords.includes(k));
                    return (
                      <TouchableOpacity
                        key={list.id}
                        style={[
                          styles.liChip,
                          {
                            backgroundColor: isSelected ? phaseColor : colors.background,
                            borderColor: isSelected ? phaseColor : colors.border,
                          },
                        ]}
                        onPress={() => {
                          const newKeywords = new Set(selectedKeywords);
                          // Clear other list keywords first? simpler to just add for now or toggle
                          if (list.keywords && list.keywords.length > 0) {
                            list.keywords.forEach(k => newKeywords.add(k));
                          }
                          setSelectedKeywords(Array.from(newKeywords));
                        }}
                      >
                        {(() => {
                          const IconComp = LIST_ICONS[list.icon] ?? LIST_ICONS['default'];
                          return IconComp ? (
                            <IconComp
                              color={isSelected ? '#fff' : colors.textSecondary}
                              size={16}
                            />
                          ) : null;
                        })()}
                        <Text
                          style={{
                            color: isSelected ? '#fff' : colors.text,
                            fontWeight: isSelected ? '600' : '400',
                          }}
                        >
                          {list.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </>
            )}

            <View style={{ flexDirection: 'row', gap: SPACING.m }}>
              <View style={{ flex: 1 }}>
                {/* Effort */}
                <Text style={[styles.label, { color: colors.textSecondary }]}>Effort (min)</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                  value={effortMinutes}
                  onChangeText={setEffortMinutes}
                  keyboardType="numeric"
                  placeholder="30"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                {/* Deadline */}
                <Text style={[styles.label, { color: colors.textSecondary }]}>Deadline</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                  value={deadlineText}
                  onChangeText={setDeadlineText}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            {/* Notes */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Notes</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                },
              ]}
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
              placeholder="Details..."
              placeholderTextColor={colors.textSecondary}
            />

            {/* Keywords (Bottom) */}
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
                    onPress={() => {
                      setSelectedKeywords(prev =>
                        prev.includes(keyword)
                          ? prev.filter(k => k !== keyword)
                          : [...prev, keyword]
                      );
                    }}
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
          </ScrollView>

          {isSubtaskMode ? (
            <View style={{ flexDirection: 'row', gap: SPACING.m, marginTop: SPACING.m }}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  {
                    flex: 1,
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: phaseColor,
                    opacity: loading ? 0.7 : 1,
                  },
                ]}
                onPress={() => void handleSave(false)}
                disabled={loading}
              >
                <Text style={[styles.saveButtonText, { color: phaseColor }]}>
                  {loading ? 'Saving...' : 'Create Next'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { flex: 1, backgroundColor: phaseColor, opacity: loading ? 0.7 : 1 },
                ]}
                onPress={() => void handleSave(true)}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Done'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[
                styles.saveButton,
                { backgroundColor: phaseColor, opacity: loading ? 0.7 : 1 },
              ]}
              onPress={() => void handleSave(true)}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Task'}</Text>
            </TouchableOpacity>
          )}

          {task && (
            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: 'transparent', marginTop: SPACING.s }]}
              onPress={handleDelete}
            >
              <Text style={{ color: '#FF3B30', fontWeight: '600' }}>Delete Task</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ConfirmationModal
        visible={deleteConfVisible}
        title="Delete Task"
        message="Are you sure you want to delete this task?"
        onConfirm={() => void executeDelete()}
        onCancel={() => setDeleteConfVisible(false)}
        confirmLabel="Delete"
        isDestructive
      />
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BORDER_RADIUS.large,
    borderTopRightRadius: BORDER_RADIUS.large,
    padding: SPACING.l,
    maxHeight: '90%',
    ...SHADOWS.level3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.l,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    fontSize: 24,
    padding: SPACING.xs,
  },
  form: {
    marginBottom: SPACING.l,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: SPACING.xs,
    marginTop: SPACING.m,
  },
  input: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.m,
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
  keywordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.s,
  },
  keywordChip: {
    width: '31%',
    flexGrow: 1,
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
  listSelector: {
    flexDirection: 'row',
    marginBottom: SPACING.s,
  },
  liChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: BORDER_RADIUS.circle,
    borderWidth: 1,
    marginRight: SPACING.s,
  },
  saveButton: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
    marginTop: SPACING.m,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
