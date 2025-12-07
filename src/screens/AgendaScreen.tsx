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
import { anchorsService } from '../services/data/Anchors';
import { phaseManager, type WuXingPhase } from '../services/PhaseManager';
import { useThemeStore } from '../stores/themeStore';
import type { MainTabScreenProps } from '../types/navigation';
import { storage } from '../utils/storage';

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

const PHASE_ICONS: Record<string, string> = {
  WOOD: '🌳',
  FIRE: '🔥',
  EARTH: '🌍',
  METAL: '🔧',
  WATER: '💧',
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
};

const getEventTypeLabel = (type: EventType): string | null => {
  switch (type) {
    case 'fixed':
      return 'FIXED';
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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [phaseSections, setPhaseSections] = useState<PhaseSection[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fabOpen, setFabOpen] = useState(false);

  const loadData = useCallback(() => {
    setLoading(true);
    setError(null);

    try {
      // console.log('📅 AgendaScreen: Loading data for', selectedDate.toDateString());

      // Check if PhaseManager is initialized
      const phaseStatus = phaseManager.getInitializationStatus();
      if (!phaseStatus.isInitialized) {
        console.warn('⚠️ PhaseManager not initialized, using fallback');
        // Create a minimal fallback phase
        const fallbackPhase: WuXingPhase = {
          name: 'WOOD',
          startTime: new Date(),
          endTime: new Date(Date.now() + 3600000),
          color: '#4A7C59',
          romanHours: [0],
          qualities: 'Default phase',
          idealTasks: [],
        };
        setPhaseSections([{ phase: fallbackPhase, events: [], isCurrentPhase: true }]);
        setLoading(false);
        return;
      }

      const phases = phaseManager.calculatePhasesForDate(selectedDate);
      const currentPhase = phaseManager.getCurrentPhase();

      // Get Anchor/Practice events only if service is available
      let anchorEvents: AgendaEvent[] = [];

      if (Platform.OS !== 'web' || anchorsService.isInitialized()) {
        try {
          const rawAnchors = anchorsService.getAnchorsForDate(selectedDate);
          anchorEvents = rawAnchors.map(a => ({
            id: a.id,
            title: a.title,
            startTime: a.startTime,
            durationMinutes: a.durationMinutes,
            type: 'anchor' as EventType,
            completed: false,
            phaseColor: undefined,
          }));
          // console.log(`✅ Loaded ${anchorEvents.length} anchor events`);
        } catch (anchorError) {
          console.warn('⚠️ Failed to load anchor events:', anchorError);
        }
      } else {
        // console.log('⚠️ AnchorsService not available, skipping anchor events');
      }

      // Organize events by phase
      const sections: PhaseSection[] = phases.map(phase => ({
        phase,
        events: anchorEvents
          .filter(event => {
            return event.startTime >= phase.startTime && event.startTime < phase.endTime;
          })
          .map(e => ({ ...e, phaseColor: phase.color })),
        isCurrentPhase: phase.name === currentPhase.name,
      }));

      setPhaseSections(sections);
      // console.log('✅ AgendaScreen: Data loaded successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('❌ AgendaScreen: Failed to load data:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSettingsPress = (): void => {
    // console.log('AgendaScreen: Settings pressed');
  };

  const handleReset = (): void => {
    storage.delete('onboarding_complete');
    const parent = navigation.getParent();
    if (parent) {
      parent.reset({
        index: 0,
        routes: [{ name: 'Welcome' }],
      });
    }
  };

  const handleFabPress = (): void => setFabOpen(!fabOpen);

  const renderEventCard = (event: AgendaEvent): React.JSX.Element => {
    const typeLabel = getEventTypeLabel(event.type);
    const isCheckable = event.type === 'task' || event.type === 'habit' || event.type === 'anchor';

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
            borderBottomColor: '#eee',
          },
        ]}
      >
        <View style={styles.eventTimeContainer}>
          <Text style={[styles.eventTime, { color: colors.textSecondary }]}>
            {formatTime(event.startTime)}
          </Text>
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
            {typeLabel && (
              <Text style={[styles.inlineBadge, { color: event.phaseColor || '#999' }]}>
                [{typeLabel}]
              </Text>
            )}
            <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
          </View>
          {event.durationMinutes > 0 && (
            <Text style={styles.durationText}>({formatDuration(event.durationMinutes)})</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderPhaseSection = (section: PhaseSection): React.JSX.Element => {
    const icon = PHASE_ICONS[section.phase.name];
    const isCurrent = section.isCurrentPhase;

    return (
      <View key={section.phase.name} style={styles.phaseSection}>
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
      <CalendarView selectedDate={selectedDate} onSelectDate={setSelectedDate} />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
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

        <View style={{ height: 80 }} />
        {Platform.OS === 'web' && (
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetButtonText}>Reset Onboarding</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: phaseColor }]}
        onPress={handleFabPress}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
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
  eventTimeContainer: { width: 45, marginRight: 8 },
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
  durationText: { fontSize: 12, color: '#888', marginLeft: 6 },
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
  },
  fabIcon: { color: 'white', fontSize: 32 },
  resetButton: { alignSelf: 'center', padding: 10, opacity: 0.5, marginBottom: 20 },
  resetButtonText: { fontSize: 12, color: '#666' },
});

export default AgendaScreen;
