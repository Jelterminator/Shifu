import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BaseScreen } from '../components/BaseScreen';
import { CalendarView } from '../components/CalendarView';
import { AppointmentModal } from '../components/modals/AppointmentModal';
import { PHASE_ICONS } from '../constants/theme';
import { appointmentRepository } from '../db/repositories/AppointmentRepository';
import { anchorsService } from '../services/data/Anchors';
import { phaseManager, type WuXingPhase } from '../services/PhaseManager';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import type { MainTabScreenProps } from '../types/navigation';

type EventType = 'task' | 'habit' | 'fixed' | 'anchor';

interface AgendaEvent {
  id: string;
  title: string;
  startTime: Date;
  durationMinutes: number;
  type: EventType;
  completed: boolean;
  phaseColor?: string;
}

interface PhaseSection {
  phase: WuXingPhase;
  events: AgendaEvent[];
  isCurrentPhase: boolean;
}

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const getEventTypeLabel = (type: EventType): string | null => {
  switch (type) {
    case 'fixed':
      return 'APPOINTMENT';
    case 'anchor':
      return 'ANCHOR';
    default:
      return null;
  }
};

export type AgendaScreenProps = MainTabScreenProps<'Agenda'>;

export function AgendaScreen({ navigation }: AgendaScreenProps): React.JSX.Element {
  const colors = useThemeStore(state => state.colors);
  const phaseColor = useThemeStore(state => state.phaseColor);
  const { user } = useUserStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phaseSections, setPhaseSections] = useState<PhaseSection[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Modals
  const [appointmentModalVisible, setAppointmentModalVisible] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if PhaseManager is initialized
      const phaseStatus = phaseManager.getInitializationStatus();
      if (!phaseStatus.isInitialized) {
        // Fallback logic kept for safety
      }

      const phases = phaseManager.getPhasesForGregorianDate(selectedDate);
      const currentPhase = phaseManager.getCurrentPhase();

      let events: AgendaEvent[] = [];

      // 1. Anchors
      if (Platform.OS !== 'web' || anchorsService.isInitialized()) {
        try {
          const rawAnchors = anchorsService.getAnchorsForDate(selectedDate);
          events = events.concat(
            rawAnchors.map(a => ({
              id: a.id,
              title: a.title,
              startTime: a.startTime,
              durationMinutes: a.durationMinutes,
              type: 'anchor' as EventType,
              completed: false,
            }))
          );
        } catch (e) {
          console.warn('Failed to load anchors', e);
        }
      }

      // 2. Appointments
      if (user?.id) {
        try {
          const appointments = await appointmentRepository.getForDate(user.id, selectedDate);
          events = events.concat(
            appointments.map(a => {
              const duration = (a.endTime.getTime() - a.startTime.getTime()) / (1000 * 60);
              return {
                id: a.id,
                title: a.name,
                startTime: a.startTime,
                durationMinutes: Math.round(duration),
                type: 'fixed' as EventType,
                completed: false, // Appointments aren't tasks
              };
            })
          );
        } catch (e) {
          console.warn('Failed to load appointments', e);
        }
      }

      // Organize events by phase
      const sections: PhaseSection[] = phases.map(phase => ({
        phase,
        events: events
          .filter(event => {
            return event.startTime >= phase.startTime && event.startTime < phase.endTime;
          })
          .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
          .map(e => ({ ...e, phaseColor: phase.color })),
        isCurrentPhase: phase.name === currentPhase.name,
      }));

      setPhaseSections(sections);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, user]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSettingsPress = (): void => {
    navigation.navigate('Settings');
  };

  const handleFabPress = (): void => {
    setAppointmentModalVisible(true);
  };

  const renderEventCard = (event: AgendaEvent): React.JSX.Element => {
    // ... existing logic ...
    const typeLabel = getEventTypeLabel(event.type);
    const isCheckable = event.type === 'task' || event.type === 'habit';

    const endTime = new Date(event.startTime.getTime() + event.durationMinutes * 60000);
    const timeRange = `${formatTime(event.startTime)} - ${formatTime(endTime)}`;

    return (
      <TouchableOpacity
        key={event.id}
        onPress={() => {}}
        style={[
          styles.eventCard,
          {
            backgroundColor: colors.surface,
            borderLeftColor: event.phaseColor || phaseColor,
            opacity: event.completed ? 0.6 : 1,
            borderBottomWidth: 1,
            borderBottomColor: colors.textSecondary,
          },
        ]}
      >
        <View style={styles.eventTimeContainer}>
          <Text style={[styles.eventTime, { color: colors.textSecondary }]}>{timeRange}</Text>
        </View>

        <View style={styles.eventContent}>
          <View style={styles.eventHeader}>
            {isCheckable && (
              <View
                style={[
                  styles.checkbox,
                  { borderColor: event.completed ? '#4CAF50' : colors.textSecondary },
                ]}
              />
            )}
            {!isCheckable && (
              <View style={{ width: 14, marginRight: 8 }} /> // Spacer to align text if checkable column exists
            )}
            {typeLabel && (
              <Text
                style={[styles.inlineBadge, { color: event.phaseColor || colors.textSecondary }]}
              >
                [{typeLabel}]
              </Text>
            )}
            <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPhaseSection = (section: PhaseSection): React.JSX.Element => {
    const icon = PHASE_ICONS[section.phase.name];
    const isCurrent = section.isCurrentPhase;

    return (
      <View
        key={`${section.phase.name}-${section.phase.startTime.toISOString()}`}
        style={styles.phaseSection}
      >
        <View
          style={[styles.phaseHeader, isCurrent && { backgroundColor: `${section.phase.color}15` }]}
        >
          <Text
            style={[
              styles.phaseTitle,
              { color: section.phase.color, fontWeight: isCurrent ? '700' : '500' },
            ]}
          >
            {icon} {section.phase.name} PHASE ({formatTime(section.phase.startTime)}-
            {formatTime(section.phase.endTime)})
          </Text>
        </View>
        <View>
          {section.events.map(renderEventCard)}
          {section.events.length === 0 && <View style={{ height: 20 }} />}
        </View>
      </View>
    );
  };

  return (
    <BaseScreen title="Agenda" showSettings={true} onSettingsPress={handleSettingsPress}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <CalendarView selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        {loading ? (
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
            <TouchableOpacity onPress={() => void loadData()} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          phaseSections.map(renderPhaseSection)
        )}

        <TouchableOpacity onPress={handleFabPress} style={{ height: 1 }} />
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: phaseColor }]}
        onPress={handleFabPress}
      >
        <Text style={[styles.fabIcon, { marginTop: -8 }]}>+</Text>
      </TouchableOpacity>

      <AppointmentModal
        visible={appointmentModalVisible}
        onClose={() => setAppointmentModalVisible(false)}
        initialDate={selectedDate}
        onSave={() => void loadData()}
      />
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
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
    backgroundColor: '#4A7C59', // This should technically be dynamic but retry is often green/safe
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  phaseSection: { marginBottom: 16 },
  phaseHeader: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: 4,
  },
  phaseTitle: { fontSize: 13, letterSpacing: 0.5 },
  eventCard: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderLeftWidth: 3,
    marginLeft: 16,
    marginBottom: 2,
  },
  eventTimeContainer: { width: 90, marginRight: 8 },
  eventTime: { fontSize: 13, fontWeight: '500' },
  eventContent: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  eventHeader: { flexDirection: 'row', alignItems: 'center' },
  checkbox: {
    width: 14,
    height: 14,
    borderWidth: 1,
    marginRight: 8,
    borderRadius: 2,
  },
  inlineBadge: { fontSize: 11, fontWeight: '700', marginRight: 6 },
  eventTitle: { fontSize: 14 },
  durationText: { fontSize: 12, marginLeft: 6 },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.3)',
  },
  fabIcon: { color: 'white', fontSize: 32 },
  resetButton: { alignSelf: 'center', padding: 10, opacity: 0.5, marginBottom: 20 },
  resetButtonText: { fontSize: 12, color: '#666' },
});

export default AgendaScreen;
