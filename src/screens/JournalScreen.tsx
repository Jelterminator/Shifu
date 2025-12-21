import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BaseScreen } from '../components/BaseScreen';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';
import { BORDER_RADIUS, MOOD_COLORS, SHADOWS, SPACING } from '../constants/theme';
import { journalRepository } from '../db/repositories/JournalRepository';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import type { JournalEntry } from '../types/database';
import type { MainTabScreenProps } from '../types/navigation';

/**
 * Props for the JournalScreen component
 */
export type JournalScreenProps = MainTabScreenProps<'Journal'>;

const MAX_CHARACTERS = 200;

/**
 * Format date for display with time
 */
const formatDisplayDateTime = (date: Date): string => {
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Format date for list display
 */
const formatListDate = (date: Date): string => {
  // Use shorter format for list
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Extract mood from content (stored as prefix like "[MOOD:4] Content...")
 */
const extractMoodFromContent = (content?: string): number => {
  if (!content) return 0;
  const match = content.match(/^\[MOOD:(\d)\]/);
  if (match?.[1]) {
    return parseInt(match[1], 10);
  }
  return 0;
};

// ... existing helpers ...

/**
 * Format content for storage with mood prefix
 */
const formatContentWithMood = (content: string, mood: number): string => {
  return `[MOOD:${mood}] ${content}`;
};

/**
 * Strip mood prefix from content for display
 */
const stripMoodPrefix = (content?: string): string => {
  if (!content) return '';
  return content.replace(/^\[MOOD:\d\]\s*/, '');
};

/**
 * JournalScreen - Daily reflection with mood tracking
 */
export function JournalScreen(_props: JournalScreenProps): React.JSX.Element {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPreviousEntries, setShowPreviousEntries] = useState(false);

  // Today's entry state
  const [moodRating, setMoodRating] = useState<number>(0);
  const [entryContent, setEntryContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfVisible, setDeleteConfVisible] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<JournalEntry | null>(null);

  const userId = useUserStore(state => state.user.id);
  const { colors, phaseColor } = useThemeStore();

  const loadEntries = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const data = await journalRepository.getRecent(userId);
      setEntries(data);
    } catch (error) {
      console.error('Failed to load journal:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void loadEntries();
  }, [loadEntries]);

  const handleSaveEntry = async (): Promise<void> => {
    if (!userId || moodRating === 0) return;

    setIsSaving(true);
    try {
      // Store mood in content as prefix (workaround since schema doesn't have moodRating)
      const contentWithMood = formatContentWithMood(entryContent, moodRating);

      await journalRepository.create(userId, {
        entryDate: new Date(),
        content: contentWithMood,
      });

      // Reset form and reload entries
      setMoodRating(0);
      setEntryContent('');
      await loadEntries();
    } catch (error) {
      console.error('Failed to save entry:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const renderMoodStars = (): React.JSX.Element => (
    <View style={styles.moodContainer}>
      <Text style={[styles.moodLabel, { color: colors.text }]}>How are you feeling now?</Text>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map(star => (
          <TouchableOpacity
            key={star}
            onPress={() => setMoodRating(star)}
            style={styles.starButton}
            accessibilityLabel={`Rate ${star} stars`}
            accessibilityRole="button"
          >
            <Text
              style={[
                styles.star,
                {
                  color: star <= moodRating ? MOOD_COLORS[star] : '#E0E0E0',
                },
              ]}
            >
              ★
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTodaysEntry = (): React.JSX.Element => (
    <View style={[styles.todayCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.todayTitle, { color: colors.text }]}>
        {formatDisplayDateTime(new Date())}
      </Text>

      {renderMoodStars()}

      <View style={styles.inputContainer}>
        <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>
          Your thoughts ({entryContent.length}/{MAX_CHARACTERS})
        </Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.background,
              color: colors.text,
              borderColor: colors.textSecondary,
            },
          ]}
          placeholder="Reflect on how things are going in this moment..."
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={MAX_CHARACTERS}
          value={entryContent}
          onChangeText={setEntryContent}
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity
        style={[styles.saveButton, { backgroundColor: moodRating > 0 ? phaseColor : '#E0E0E0' }]}
        onPress={() => void handleSaveEntry()}
        disabled={moodRating === 0 || isSaving}
      >
        <Text style={styles.saveButtonText}>{isSaving ? 'Saving...' : 'Save Entry'}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAIInsights = (): React.JSX.Element => (
    <View style={[styles.insightsCard, { backgroundColor: colors.surface }]}>
      <Text style={[styles.insightsTitle, { color: colors.text }]}>💡 AI Insights</Text>
      <View style={styles.insightsDivider} />
      {entries.length > 0 ? (
        <Text style={[styles.insightsText, { color: colors.textSecondary }]}>
          {"You've been consistent with your daily reflections. Your mood tends to improve on days"}
          {' when you complete your morning habits.'}
        </Text>
      ) : (
        <Text style={[styles.insightsText, { color: colors.textSecondary }]}>
          {
            'Start journaling regularly to receive personalized insights about your patterns and moods.'
          }
        </Text>
      )}
    </View>
  );

  const handleDeleteEntry = (entry: JournalEntry): void => {
    setEntryToDelete(entry);
    setDeleteConfVisible(true);
  };

  const executeDeleteEntry = async (): Promise<void> => {
    if (!entryToDelete) return;
    try {
      await journalRepository.delete(entryToDelete.id);
      setDeleteConfVisible(false);
      setEntryToDelete(null);
      await loadEntries();
    } catch (e) {
      Alert.alert('Error', 'Failed to delete entry');
    }
  };

  const renderEntry = ({ item }: { item: JournalEntry }): React.JSX.Element => {
    const mood = extractMoodFromContent(item.content);
    const displayContent = stripMoodPrefix(item.content);
    const moodColor = mood > 0 ? MOOD_COLORS[mood] : '#9E9E9E';
    const stars = mood > 0 ? '★'.repeat(mood) + '☆'.repeat(5 - mood) : '☆☆☆☆☆';

    return (
      <View style={[styles.entryCard, { backgroundColor: colors.surface }]}>
        <View style={styles.entryHeader}>
          <View>
            <Text style={[styles.entryDate, { color: colors.textSecondary }]}>
              {formatListDate(new Date(item.entryDate))}
            </Text>
            <Text style={[styles.entryMood, { color: moodColor }]}>{stars}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDeleteEntry(item)} style={{ padding: 8 }}>
            <Text style={{ fontSize: 16 }}>🗑️</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.entryContent, { color: colors.text }]} numberOfLines={3}>
          {displayContent || '(No reflection written)'}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <BaseScreen title="Journal">
        <View style={styles.centered}>
          <Text style={{ color: colors.text }}>Loading...</Text>
        </View>
      </BaseScreen>
    );
  }

  return (
    <BaseScreen title="Journal">
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {renderTodaysEntry()}

        <TouchableOpacity
          style={styles.previousEntriesButton}
          onPress={() => setShowPreviousEntries(!showPreviousEntries)}
        >
          <Text style={[styles.previousEntriesText, { color: phaseColor }]}>
            {showPreviousEntries ? 'Hide Previous Entries' : 'See Previous Entries →'}
          </Text>
        </TouchableOpacity>

        {showPreviousEntries && (
          <View style={styles.previousEntriesContainer}>
            {entries.length > 0 ? (
              <FlatList
                data={entries}
                renderItem={renderEntry}
                keyExtractor={item => item.id}
                scrollEnabled={false}
              />
            ) : (
              <Text style={[styles.noEntriesText, { color: colors.textSecondary }]}>
                No previous entries yet
              </Text>
            )}
          </View>
        )}

        {renderAIInsights()}
      </ScrollView>

      <ConfirmationModal
        visible={deleteConfVisible}
        title="Delete Entry"
        message="Are you sure you want to delete this journal entry?"
        onConfirm={() => void executeDeleteEntry()}
        onCancel={() => {
          setDeleteConfVisible(false);
          setEntryToDelete(null);
        }}
        confirmLabel="Delete"
        isDestructive
      />
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SPACING.m,
    paddingBottom: SPACING.xxl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayCard: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.medium,
    ...SHADOWS.level1,
  },
  todayTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: SPACING.m,
  },
  moodContainer: {
    marginBottom: SPACING.m,
  },
  moodLabel: {
    fontSize: 14,
    marginBottom: SPACING.s,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: SPACING.s,
  },
  starButton: {
    padding: SPACING.xs,
  },
  star: {
    fontSize: 36,
  },
  inputContainer: {
    marginBottom: SPACING.m,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.m,
    height: 120,
    fontSize: 16,
  },
  saveButton: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.medium,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  previousEntriesButton: {
    paddingVertical: SPACING.m,
  },
  previousEntriesText: {
    fontSize: 14,
    fontWeight: '500',
  },
  previousEntriesContainer: {
    marginBottom: SPACING.m,
  },
  noEntriesText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: SPACING.m,
  },
  insightsCard: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.medium,
    ...SHADOWS.level1,
  },
  insightsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  insightsDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: SPACING.s,
  },
  insightsText: {
    fontSize: 14,
    lineHeight: 22,
  },
  entryCard: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.medium,
    marginBottom: SPACING.s,
    ...SHADOWS.level1,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  entryDate: {
    fontSize: 14,
  },
  entryMood: {
    fontSize: 14,
  },
  entryContent: {
    fontSize: 16,
    lineHeight: 22,
  },
});

export default JournalScreen;
