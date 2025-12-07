import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BaseScreen } from '../components/BaseScreen';
import { phaseManager, type WuXingPhase } from '../services/PhaseManager';
import { useThemeStore } from '../stores/themeStore';
import type { MainTabScreenProps } from '../types/navigation';
import { storage } from '../utils/storage';

/**
 * Event type for agenda items
 */
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

/**
 * Phase icons mapping
 */
const PHASE_ICONS: Record<string, string> = {
  WOOD: '🌳',
  FIRE: '🔥',
  EARTH: '🌍',
  METAL: '🔧',
  WATER: '💧',
};

/**
 * Format time in 24-hour format
 */
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * Format duration for display
 */
const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h${mins}m` : `${hours}h`;
};

/**
 * Get display label for event type
 */
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

/**
 * Props for the AgendaScreen component
 */
export type AgendaScreenProps = MainTabScreenProps<'Agenda'>;

/**
 * Agenda screen - displays daily schedule organized by Wu Xing phases
 */
export function AgendaScreen({ navigation }: AgendaScreenProps): React.JSX.Element {
  const colors = useThemeStore((state) => state.colors);
  const currentPhaseFromStore = useThemeStore((state) => state.currentPhase);
  const phaseColor = useThemeStore((state) => state.phaseColor);

  const [loading, setLoading] = useState(true);
  const [phaseSections, setPhaseSections] = useState<PhaseSection[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fabOpen, setFabOpen] = useState(false);

  /**
   * Generate mock events for demo purposes
   */
  const generateMockEvents = useCallback((phases: WuXingPhase[]): AgendaEvent[] => {
    const events: AgendaEvent[] = [];
    const now = new Date();

    // Sample events for each phase
    const eventTemplates: Array<{
      phase: string;
      title: string;
      offsetMinutes: number;
      duration: number;
      type: EventType;
    }> = [
      { phase: 'WOOD', title: 'Morning Meditation', offsetMinutes: 15, duration: 15, type: 'habit' },
      { phase: 'WOOD', title: 'Morning Stretch', offsetMinutes: 45, duration: 10, type: 'habit' },
      { phase: 'FIRE', title: 'Team Standup', offsetMinutes: 30, duration: 30, type: 'fixed' },
      { phase: 'FIRE', title: 'Deep Work: Project Alpha', offsetMinutes: 90, duration: 120, type: 'task' },
      { phase: 'EARTH', title: 'Lunch Break', offsetMinutes: 0, duration: 60, type: 'anchor' },
      { phase: 'METAL', title: 'Code Review', offsetMinutes: 30, duration: 60, type: 'task' },
      { phase: 'METAL', title: 'Email Processing', offsetMinutes: 120, duration: 30, type: 'task' },
      { phase: 'WATER', title: 'Evening Prayer', offsetMinutes: 30, duration: 15, type: 'anchor' },
      { phase: 'WATER', title: 'Evening Reading', offsetMinutes: 60, duration: 30, type: 'habit' },
    ];

    for (const template of eventTemplates) {
      const phase = phases.find((p) => p.name === template.phase);
      if (phase) {
        const startTime = new Date(phase.startTime.getTime() + template.offsetMinutes * 60000);
        events.push({
          id: `${template.phase}-${template.title}-${template.offsetMinutes}`,
          title: template.title,
          startTime,
          durationMinutes: template.duration,
          type: template.type,
          completed: startTime < now && Math.random() > 0.3, // Randomly mark past events as completed
          phaseColor: phase.color,
        });
      }
    }

    return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, []);

  /**
   * Load phases and events
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const phases = await phaseManager.calculatePhasesForDate(selectedDate);
      const currentPhase = await phaseManager.getCurrentPhase();
      const events = generateMockEvents(phases);

      // Organize events by phase
      const sections: PhaseSection[] = phases.map((phase) => ({
        phase,
        events: events.filter((event) => {
          return event.startTime >= phase.startTime && event.startTime < phase.endTime;
        }),
        isCurrentPhase: phase.name === currentPhase.name,
      }));

      setPhaseSections(sections);
    } catch (error) {
      console.error('Failed to load agenda data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, generateMockEvents]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSettingsPress = (): void => {
    console.log('AgendaScreen: Settings pressed');
  };

  const handleReset = () => {
    storage.delete('onboarding_complete');
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  const handleEventToggle = (eventId: string) => {
    setPhaseSections((prevSections) =>
      prevSections.map((section) => ({
        ...section,
        events: section.events.map((event) =>
          event.id === eventId ? { ...event, completed: !event.completed } : event
        ),
      }))
    );
  };

  const handleFabPress = () => {
    setFabOpen(!fabOpen);
  };

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    setFabOpen(false);
    // TODO: Implement actual actions
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(newDate);
  };

  const getDateLabel = (): string => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    const diff = (selected.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);

    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return 'Yesterday';

    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  /**
   * Render a single event card
   */
  const renderEventCard = (event: AgendaEvent) => {
    const typeLabel = getEventTypeLabel(event.type);
    const isCheckable = event.type === 'task' || event.type === 'habit';

    return (
      <TouchableOpacity
        key={event.id}
        onPress={() => isCheckable && handleEventToggle(event.id)}
        style={[
          styles.eventCard,
          {
            backgroundColor: event.type === 'anchor' 
              ? `${event.phaseColor}20` 
              : event.type === 'fixed'
              ? colors.surface
              : colors.surface,
            borderLeftColor: event.phaseColor || phaseColor,
            opacity: event.completed ? 0.6 : 1,
          },
        ]}
        activeOpacity={isCheckable ? 0.7 : 1}
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
                  {
                    borderColor: event.completed ? '#4CAF50' : colors.textSecondary,
                    backgroundColor: event.completed ? '#4CAF50' : 'transparent',
                  },
                ]}
              >
                {event.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
            )}
            {typeLabel && (
              <View
                style={[
                  styles.typeBadge,
                  {
                    backgroundColor:
                      event.type === 'anchor' ? event.phaseColor : '#9E9E9E',
                  },
                ]}
              >
                <Text style={styles.typeBadgeText}>{typeLabel}</Text>
              </View>
            )}
            <Text
              style={[
                styles.eventTitle,
                {
                  color: colors.text,
                  textDecorationLine: event.completed ? 'line-through' : 'none',
                },
              ]}
              numberOfLines={1}
            >
              {event.title}
            </Text>
          </View>
          <Text style={[styles.eventDuration, { color: colors.textSecondary }]}>
            {formatDuration(event.durationMinutes)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Render a phase section
   */
  const renderPhaseSection = (section: PhaseSection) => {
    const icon = PHASE_ICONS[section.phase.name] || '🔮';

    return (
      <View key={section.phase.name} style={styles.phaseSection}>
        <View
          style={[
            styles.phaseSectionHeader,
            {
              backgroundColor: `${section.phase.color}${section.isCurrentPhase ? '30' : '10'}`,
              borderLeftColor: section.phase.color,
            },
          ]}
        >
          <Text
            style={[
              styles.phaseSectionTitle,
              {
                color: section.phase.color,
                fontWeight: section.isCurrentPhase ? '700' : '600',
              },
            ]}
          >
            {icon} {section.phase.name} PHASE
          </Text>
          <Text style={[styles.phaseSectionTime, { color: colors.textSecondary }]}>
            {formatTime(section.phase.startTime)} - {formatTime(section.phase.endTime)}
          </Text>
        </View>

        {section.events.length > 0 ? (
          <View style={styles.phaseEvents}>
            {section.events.map(renderEventCard)}
          </View>
        ) : (
          <View style={styles.emptyPhase}>
            <Text style={[styles.emptyPhaseText, { color: colors.textSecondary }]}>
              No events in this phase
            </Text>
          </View>
        )}
      </View>
    );
  };

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateIcon}>✨</Text>
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>A Blank Canvas</Text>
      <Text style={[styles.emptyStateSubtitle, { color: colors.textSecondary }]}>
        No events scheduled for today.{'\n'}Want to generate a plan?
      </Text>
      <View style={styles.emptyStateActions}>
        <TouchableOpacity
          style={[styles.emptyStateButton, { backgroundColor: phaseColor }]}
          onPress={() => handleQuickAction('generate')}
        >
          <Text style={styles.emptyStateButtonText}>🤖 Generate Plan</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.emptyStateButtonSecondary, { borderColor: phaseColor }]}
          onPress={() => handleQuickAction('add')}
        >
          <Text style={[styles.emptyStateButtonSecondaryText, { color: phaseColor }]}>
            + Add Event
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <BaseScreen title={getDateLabel()} showSettings={true} onSettingsPress={handleSettingsPress}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={phaseColor} />
          <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
            Loading your schedule...
          </Text>
        </View>
      </BaseScreen>
    );
  }

  const hasEvents = phaseSections.some((section) => section.events.length > 0);

  return (
    <BaseScreen title={getDateLabel()} showSettings={true} onSettingsPress={handleSettingsPress}>
      {/* Date Navigation */}
      <View style={styles.dateNavigation}>
        <TouchableOpacity onPress={() => navigateDate('prev')} style={styles.dateNavButton}>
          <Text style={[styles.dateNavText, { color: phaseColor }]}>← Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedDate(new Date())}
          style={[styles.todayButton, { borderColor: phaseColor }]}
        >
          <Text style={[styles.todayButtonText, { color: phaseColor }]}>Today</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigateDate('next')} style={styles.dateNavButton}>
          <Text style={[styles.dateNavText, { color: phaseColor }]}>Next →</Text>
        </TouchableOpacity>
      </View>

      {hasEvents ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {phaseSections.map(renderPhaseSection)}

          {/* Dev Reset Button - Remove in production */}
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetText}>Reset Onboarding (Dev Only)</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        renderEmptyState()
      )}

      {/* Floating Action Button */}
      <View style={styles.fabContainer}>
        {fabOpen && (
          <View style={[styles.fabMenu, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => handleQuickAction('task')}
            >
              <Text style={[styles.fabMenuText, { color: colors.text }]}>+ Add Task</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => handleQuickAction('habit')}
            >
              <Text style={[styles.fabMenuText, { color: colors.text }]}>+ Add Habit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => handleQuickAction('event')}
            >
              <Text style={[styles.fabMenuText, { color: colors.text }]}>+ Add Event</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.fabMenuItem}
              onPress={() => handleQuickAction('generate')}
            >
              <Text style={[styles.fabMenuText, { color: colors.text }]}>🤖 Generate Plan</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity
          style={[styles.fab, { backgroundColor: phaseColor }]}
          onPress={handleFabPress}
          activeOpacity={0.8}
        >
          <Text style={[styles.fabIcon, { transform: [{ rotate: fabOpen ? '45deg' : '0deg' }] }]}>
            +
          </Text>
        </TouchableOpacity>
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 14,
  },
  dateNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 8,
  },
  dateNavButton: {
    padding: 8,
  },
  dateNavText: {
    fontSize: 14,
    fontWeight: '500',
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  phaseSection: {
    marginBottom: 16,
  },
  phaseSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderLeftWidth: 4,
    borderRadius: 4,
    marginBottom: 8,
  },
  phaseSectionTitle: {
    fontSize: 14,
    letterSpacing: 0.5,
  },
  phaseSectionTime: {
    fontSize: 12,
  },
  phaseEvents: {
    paddingLeft: 4,
  },
  emptyPhase: {
    paddingVertical: 12,
    paddingLeft: 16,
  },
  emptyPhaseText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
  eventCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    borderLeftWidth: 4,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
  },
  eventTimeContainer: {
    width: 50,
    marginRight: 12,
  },
  eventTime: {
    fontSize: 13,
    fontWeight: '500',
  },
  eventContent: {
    flex: 1,
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  eventTitle: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  eventDuration: {
    fontSize: 12,
    marginTop: 4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  emptyStateActions: {
    gap: 12,
    alignItems: 'center',
  },
  emptyStateButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyStateButtonSecondary: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  emptyStateButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    alignItems: 'flex-end',
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  fabIcon: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '300',
  },
  fabMenu: {
    marginBottom: 12,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  fabMenuItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  fabMenuText: {
    fontSize: 14,
    fontWeight: '500',
  },
  resetButton: {
    marginTop: 24,
    padding: 12,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    alignSelf: 'center',
  },
  resetText: {
    color: '#D00',
    fontWeight: '600',
    fontSize: 12,
  },
});

export default AgendaScreen;
