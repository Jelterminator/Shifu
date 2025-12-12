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
import { BORDER_RADIUS, SHADOWS, SPACING } from '../../constants';
import { appointmentRepository } from '../../db/repositories/AppointmentRepository';
import { useThemeStore } from '../../stores/themeStore';
import { useUserStore } from '../../stores/userStore';
import type { Appointment } from '../../types/database';

interface AppointmentModalProps {
  visible: boolean;
  onClose: () => void;
  appointment?: Appointment;
  onSave?: () => void;
  initialDate?: Date;
}

export function AppointmentModal({
  visible,
  onClose,
  appointment,
  onSave,
  initialDate,
}: AppointmentModalProps): React.JSX.Element {
  const { colors, phaseColor } = useThemeStore();
  const { user } = useUserStore();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Simple ISO date/time strings for MVP: YYYY-MM-DD HH:mm
  const [startText, setStartText] = useState('');
  const [endText, setEndText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (appointment) {
        setTitle(appointment.name);
        setDescription(appointment.description || '');
        setStartText(formatDateTime(appointment.startTime));
        setEndText(formatDateTime(appointment.endTime));
      } else {
        // New appointment
        setTitle('');
        setDescription('');

        const start = initialDate ? new Date(initialDate) : new Date();
        // Round to next 15/30 min logic or just current time
        start.setSeconds(0, 0);

        const end = new Date(start.getTime() + 60 * 60 * 1000); // 1 hour default

        setStartText(formatDateTime(start));
        setEndText(formatDateTime(end));
      }
    }
  }, [visible, appointment, initialDate]);

  function formatDateTime(date: Date): string {
    // Format: YYYY-MM-DD HH:mm
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
  }

  function parseDateTime(str: string): Date | null {
    // Expect YYYY-MM-DD HH:mm
    const regex = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/;
    const match = str.match(regex);
    if (!match) return null;

    const [_, y, m, d, h, min] = match;
    const date = new Date(
      parseInt(y!),
      parseInt(m!) - 1,
      parseInt(d!),
      parseInt(h!),
      parseInt(min!)
    );
    return isNaN(date.getTime()) ? null : date;
  }

  const handleSave = async (): Promise<void> => {
    if (!user) return;
    if (!title.trim()) return;

    const start = parseDateTime(startText);
    const end = parseDateTime(endText);

    if (!start || !end) {
      alert('Invalid date format. Use YYYY-MM-DD HH:mm');
      return;
    }

    if (end <= start) {
      alert('End time must be after start time');
      return;
    }

    setLoading(true);

    try {
      if (appointment) {
        await appointmentRepository.update(appointment.id, {
          name: title.trim(),
          description: description.trim(),
          startTime: start,
          endTime: end,
        });
      } else {
        await appointmentRepository.create(user.id!, {
          name: title.trim(),
          description: description.trim(),
          startTime: start,
          endTime: end,
          source: 'manual',
        });
      }

      onSave?.();
      onClose();
    } catch (e) {
      console.error('Failed to save appointment', e);
      alert('Failed to save appointment');
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
              {appointment ? 'Edit Appointment' : 'New Appointment'}
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
              placeholder="Meeting, Appointment, etc."
              placeholderTextColor={colors.textSecondary}
              autoFocus={!appointment}
            />

            <View style={{ flexDirection: 'row', gap: SPACING.m }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  Start (YYYY-MM-DD HH:mm)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                  value={startText}
                  onChangeText={setStartText}
                  placeholder="2024-01-01 10:00"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: SPACING.m }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.textSecondary }]}>
                  End (YYYY-MM-DD HH:mm)
                </Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: colors.text,
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                  value={endText}
                  onChangeText={setEndText}
                  placeholder="2024-01-01 11:00"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            {/* Description */}
            <Text style={[styles.label, { color: colors.textSecondary }]}>Description</Text>
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
              value={description}
              onChangeText={setDescription}
              multiline
              textAlignVertical="top"
              placeholder="Details..."
              placeholderTextColor={colors.textSecondary}
            />
          </ScrollView>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: phaseColor, opacity: loading ? 0.7 : 1 }]}
            onPress={() => void handleSave()}
            disabled={loading}
          >
            <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Appointment'}</Text>
          </TouchableOpacity>
        </View>
      </View>
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
