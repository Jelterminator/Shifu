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
import { CalendarView } from '../components/CalendarView';
import { anchorsService } from '../services/data/Anchors';
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
    case 'fixed': return 'FIXED';
    case 'anchor': return 'ANCHOR';
    default: return null;
  }
};

export type AgendaScreenProps = MainTabScreenProps<'Agenda'>;

export function AgendaScreen({ navigation }: AgendaScreenProps): React.JSX.Element {
  const colors = useThemeStore((state) => state.colors);
  // const currentPhaseFromStore = useThemeStore((state) => state.currentPhase);
  const phaseColor = useThemeStore((state) => state.phaseColor);

  const [loading, setLoading] = useState(true);
  const [phaseSections, setPhaseSections] = useState<PhaseSection[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [fabOpen, setFabOpen] = useState(false);

  /**
   * Load phases and events
   */
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const phases = await phaseManager.calculatePhasesForDate(selectedDate);
      const currentPhase = await phaseManager.getCurrentPhase();
      
      // Get Anchor/Practice events
      const anchorEvents = anchorsService.getAnchorsForDate(selectedDate);
      
      // Convert to AgendaEvent
      const mappedEvents: AgendaEvent[] = anchorEvents.map(a => ({
          id: a.id,
          title: a.title,
          startTime: a.startTime,
          durationMinutes: a.durationMinutes,
          type: 'anchor', // or 'habit' if we want to differentiate? 
          completed: false, // Anchors are not "completable" in the same way? Or maybe yes.
          phaseColor: undefined // Will be set by phase matching
      }));

      // Organize events by phase
      const sections: PhaseSection[] = phases.map((phase) => ({
        phase,
        events: mappedEvents.filter((event) => {
          return event.startTime >= phase.startTime && event.startTime < phase.endTime;
        }).map(e => ({ ...e, phaseColor: phase.color })), // Inject phase color
        isCurrentPhase: phase.name === currentPhase.name,
      }));

      setPhaseSections(sections);
    } catch (error) {
      console.error('Failed to load agenda data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

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

  const handleFabPress = () => setFabOpen(!fabOpen);
  // const handleQuickAction = (action: string) => setFabOpen(false);

  // Render Logic
  const renderEventCard = (event: AgendaEvent) => {
    const typeLabel = getEventTypeLabel(event.type);
    const isCheckable = event.type === 'task' || event.type === 'habit' || event.type === 'anchor'; // Anchors (practices) can be checked

    return (
      <TouchableOpacity
        key={event.id}
        onPress={() => {}} // Toggle logic
        style={[
          styles.eventCard,
          {
            backgroundColor: colors.surface,
            borderLeftColor: event.phaseColor || phaseColor,
            opacity: event.completed ? 0.6 : 1,
            borderBottomWidth:1,
            borderBottomColor:'#eee' // faint line
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
                  { borderColor: event.completed ? '#4CAF50' : colors.textSecondary }
                 ]}
              />
            )}
            {typeLabel && (
              <Text style={[styles.inlineBadge, { color: event.phaseColor || '#999' }]}>[{typeLabel}]</Text>
            )}
            <Text style={[styles.eventTitle, { color: colors.text }]}>{event.title}</Text>
          </View>
           {event.durationMinutes > 0 && 
             <Text style={styles.durationText}>({formatDuration(event.durationMinutes)})</Text>
           }
        </View>
      </TouchableOpacity>
    );
  };

  const renderPhaseSection = (section: PhaseSection) => {
    const icon = PHASE_ICONS[section.phase.name];
    const isCurrent = section.isCurrentPhase;
    
    // Design request:
    // WOOD PHASE (05:30-09:00)
    
    return (
      <View key={section.phase.name} style={styles.phaseSection}>
        <View style={[styles.phaseHeader, isCurrent && { backgroundColor: `${section.phase.color}15` }]}>
             <Text style={[styles.phaseTitle, { color: section.phase.color, fontWeight: isCurrent ? '700':'500' }]}>
                 {icon} {section.phase.name} PHASE ({formatTime(section.phase.startTime)}-{formatTime(section.phase.endTime)})
             </Text>
        </View>
        <View>
            {section.events.map(renderEventCard)}
             {section.events.length === 0 && (
                <View style={{height: 20}} /> /* Spacer or empty? Design shows empty space */
             )}
        </View>
      </View>
    );
  };

  return (
    <BaseScreen title="Agenda" showSettings={true} onSettingsPress={handleSettingsPress}>
        <CalendarView
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
        />
        
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
            {loading ? (
                <ActivityIndicator style={{marginTop: 20}} color={phaseColor} />
            ) : (
                phaseSections.map(renderPhaseSection)
            )}
            
            {/* Action Buttons/Reset */}
            <View style={{height: 80}} />
            <TouchableOpacity onPress={handleReset} style={styles.resetButton}><Text>Reset</Text></TouchableOpacity>
        </ScrollView>
        
        {/* FAB */}
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
  phaseSection: { marginBottom: 16 },
  phaseHeader: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      marginBottom: 4
  },
  phaseTitle: { fontSize: 13, letterSpacing: 0.5 },
  eventCard: {
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderLeftWidth: 3,
      marginLeft: 16, // Indent like design
      marginBottom: 2
  },
  eventTimeContainer: { width: 45, marginRight: 8 },
  eventTime: { fontSize: 13, fontWeight: '500' },
  eventContent: { flex: 1, flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  eventHeader: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { 
      width: 14, height: 14, borderWidth: 1, marginRight: 8, borderRadius: 2 
  },
  inlineBadge: { fontSize: 11, fontWeight: '700', marginRight: 6 },
  eventTitle: { fontSize: 14 },
  durationText: { fontSize: 12, color: '#888', marginLeft: 6 },
  
  fab: {
    position: 'absolute', bottom: 24, right: 24,
    width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center',
    elevation: 6, shadowColor: '#000', shadowOffset: {width:0, height:3}, shadowOpacity: 0.3
  },
  fabIcon: { color: 'white', fontSize: 32 },
  resetButton: { alignSelf: 'center', padding: 10, opacity: 0.3 }
});

export default AgendaScreen;