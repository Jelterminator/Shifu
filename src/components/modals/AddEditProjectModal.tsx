import React, { useCallback, useEffect, useState } from 'react';
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
// Note: imports adjusted to match existing file structure if needed, or assuming constants/index exports them.
import { projectRepository } from '../../db/repositories/ProjectRepository';
import { taskRepository } from '../../db/repositories/TaskRepository';
import { useThemeStore } from '../../stores/themeStore';
import { useUserStore } from '../../stores/userStore';
import type { Project, Task } from '../../types/database';
import { TaskCard } from '../TaskCard';
import { AddEditTaskModal } from './AddEditTaskModal';
import { ConfirmationModal } from './ConfirmationModal';

interface AddEditProjectModalProps {
  visible: boolean;
  onClose: () => void;
  project?: Project;
  onSave?: () => void;
  initialKeywords?: string[];
}

export function AddEditProjectModal({
  visible,
  onClose,
  project,
  onSave,
  initialKeywords = [],
}: AddEditProjectModalProps): React.JSX.Element {
  const { colors, phaseColor } = useThemeStore();
  const { user } = useUserStore();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [deadlineText, setDeadlineText] = useState('');
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteConfVisible, setDeleteConfVisible] = useState(false);

  // Subtask logic
  const [currentProject, setCurrentProject] = useState<Project | undefined>(project);
  const [subtasks, setSubtasks] = useState<Task[]>([]);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);

  const loadSubtasks = useCallback(
    async (projectId: string): Promise<void> => {
      if (!user?.id) return;
      try {
        const tasks = await taskRepository.getTasksByProjectId(user.id, projectId);
        setSubtasks(tasks);
      } catch (e) {
        console.error('Failed to load subtasks', e);
      }
    },
    [user?.id]
  );

  useEffect(() => {
    if (visible && project) {
      setCurrentProject(project);

      setTitle(project.title);
      setNotes(project.notes || '');
      setDeadlineText(
        project.deadline ? new Date(project.deadline).toISOString().slice(0, 10) : ''
      );
      setSelectedKeywords(project.selectedKeywords || []);

      void loadSubtasks(project.id);
    } else if (visible) {
      // New project
      setCurrentProject(undefined);
      setSubtasks([]);

      setTitle('');
      setNotes('');
      setDeadlineText('');
      setSelectedKeywords(initialKeywords);
    }
  }, [visible, project, initialKeywords, loadSubtasks]);

  const handleMoveTask = async (index: number, direction: 'up' | 'down'): Promise<void> => {
    if (!currentProject) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === subtasks.length - 1) return;

    const newSubtasks = [...subtasks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    // Swap
    const itemToMove = newSubtasks[index];
    const targetItem = newSubtasks[targetIndex];

    if (itemToMove && targetItem) {
      newSubtasks[index] = targetItem;
      newSubtasks[targetIndex] = itemToMove;
    }

    // Assign positions
    const updates = newSubtasks.map((t, i) => ({
      id: t.id,
      position: i,
    }));

    // Optimistic update
    setSubtasks(newSubtasks);

    // DB Update
    try {
      await taskRepository.updatePositions(updates);
    } catch (error) {
      console.error('Failed to reorder', error);
      Alert.alert('Error', 'Failed to save order');
      void loadSubtasks(currentProject.id); // Revert
    }
  };

  const handleDelete = (): void => {
    if (!currentProject) return;
    setDeleteConfVisible(true);
  };

  const executeDelete = async (): Promise<void> => {
    if (!currentProject) return;
    try {
      await projectRepository.delete(currentProject.id);
      onSave?.();
      onClose();
      setDeleteConfVisible(false);
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to delete project');
    }
  };

  const handleSave = async (openTasksAfter = false): Promise<void> => {
    if (!user || !user.id || !title.trim()) {
      console.warn('Cannot save project: Missing user or title', { user, title });
      return;
    }
    setLoading(true);

    try {
      let deadline: Date | undefined;
      if (deadlineText.match(/^\d{4}-\d{2}-\d{2}$/)) {
        deadline = new Date(deadlineText);
      }

      const data = {
        title: title.trim(),
        notes: notes.trim(),
        deadline,
        selectedKeywords,
      };

      let savedProject: Project;
      if (currentProject) {
        await projectRepository.update(currentProject.id, data);
        savedProject = { ...currentProject, ...data, updatedAt: new Date() } as Project;
      } else {
        savedProject = await projectRepository.create(user.id, data);
        Alert.alert('Success', 'Project created. You can now add subtasks.');
      }

      setCurrentProject(savedProject);

      // If we want to continue to add tasks, don't close.
      if (openTasksAfter) {
        setIsTaskModalVisible(true);
      } else {
        onSave?.();
        onClose(); // Only close if not adding tasks
      }
    } catch (e) {
      console.error('Failed to save project', e);
      Alert.alert('Error', 'Failed to save project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {project ? 'Edit Project' : 'New Project'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={{ color: colors.textSecondary, fontSize: 16 }}>✕ Close</Text>
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
                  backgroundColor: colors.background,
                  borderColor: colors.textSecondary,
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Project Name"
              placeholderTextColor={colors.textSecondary}
              autoFocus={!project}
            />

            {/* Deadline */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Deadline</Text>
            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: colors.textSecondary,
                },
              ]}
              value={deadlineText}
              onChangeText={setDeadlineText}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.textSecondary}
            />

            {/* Notes */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Notes</Text>
            <TextInput
              style={[
                styles.input,
                styles.textArea,
                {
                  color: colors.text,
                  backgroundColor: colors.background,
                  borderColor: colors.textSecondary,
                },
              ]}
              value={notes}
              onChangeText={setNotes}
              multiline
              textAlignVertical="top"
              placeholder="Details..."
              placeholderTextColor={colors.textSecondary}
            />

            {/* Keywords */}
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
            {/* Subtasks Section */}
            {currentProject && (
              <View style={{ marginTop: SPACING.l }}>
                <Text style={[styles.label, { marginTop: 0, color: colors.textSecondary }]}>
                  Subtasks (Planned Order)
                </Text>

                {subtasks.length === 0 ? (
                  <Text
                    style={{
                      color: colors.textSecondary,
                      fontStyle: 'italic',
                      marginBottom: SPACING.m,
                    }}
                  >
                    No subtasks yet.
                  </Text>
                ) : (
                  subtasks.map((task, index) => (
                    <View key={task.id} style={{ marginBottom: SPACING.s }}>
                      <TaskCard
                        task={task}
                        mode="planning"
                        index={index}
                        isFirst={index === 0}
                        isLast={index === subtasks.length - 1}
                        onMoveUp={() => void handleMoveTask(index, 'up')}
                        onMoveDown={() => void handleMoveTask(index, 'down')}
                      />
                    </View>
                  ))
                )}

                <TouchableOpacity
                  onPress={() => setIsTaskModalVisible(true)}
                  style={{ alignSelf: 'flex-start', paddingVertical: SPACING.xs }}
                >
                  <Text style={{ color: phaseColor, fontWeight: '600' }}>+ Add Subtask</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>

          <View style={{ gap: SPACING.s, marginTop: SPACING.m }}>
            {currentProject && (
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { backgroundColor: phaseColor, opacity: loading ? 0.7 : 1 },
                ]}
                onPress={() => void handleSave(false)}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Changes'}</Text>
              </TouchableOpacity>
            )}

            {currentProject && (
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { backgroundColor: 'transparent', marginTop: SPACING.s },
                ]}
                onPress={handleDelete}
              >
                <Text style={{ color: '#FF3B30', fontWeight: '600', fontSize: 16 }}>
                  Delete Project
                </Text>
              </TouchableOpacity>
            )}

            {/* Creating new project -> Enforce adding tasks */}
            {!currentProject && (
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  { backgroundColor: phaseColor, opacity: loading ? 0.7 : 1 },
                ]}
                onPress={() => void handleSave(true)}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? 'Saving...' : 'Next: Add Subtasks'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Add Task Modal */}
          <AddEditTaskModal
            visible={isTaskModalVisible}
            onClose={() => setIsTaskModalVisible(false)}
            initialProjectId={currentProject?.id}
            initialDeadline={currentProject?.deadline}
            initialKeywords={currentProject?.selectedKeywords}
            isSubtaskMode={true}
            onSave={() => {
              if (currentProject) void loadSubtasks(currentProject.id);
            }}
          />
        </View>
      </View>

      <ConfirmationModal
        visible={deleteConfVisible}
        title="Delete Project"
        message="Are you sure you want to delete this project? All subtasks will be deleted."
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
    paddingHorizontal: SPACING.s,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  form: {
    flexShrink: 1,
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
});
