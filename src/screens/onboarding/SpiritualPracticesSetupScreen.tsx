import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { RELIGIOUS_PRACTICES, type PracticeCategory } from '../../constants/practices';
import { anchorsService } from '../../services/data/Anchors';
import { useThemeStore } from '../../stores/themeStore';
import { useUserStore } from '../../stores/userStore';
import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'SpiritualPracticesSetup'>;

/**
 * Converts a Roman hour (0-23) to an approximate Gregorian time description.
 * Roman hours 0-11 are daytime hours (sunrise to sunset).
 * Roman hours 12-23 are nighttime hours (sunset to next sunrise).
 *
 * This provides an approximate time assuming ~6AM sunrise and ~6PM sunset.
 */
const romanHourToTimeDescription = (romanHour: number): string => {
  // Approximate mapping based on a 6AM sunrise and 6PM sunset
  // Daytime hours (0-11): Each hour is ~1h of the 12h day
  // Nighttime hours (12-23): Each hour is ~1h of the 12h night
  const timeMap: Record<number, string> = {
    0: '~6:00 AM (Sunrise)',
    1: '~7:00 AM',
    2: '~8:00 AM',
    3: '~9:00 AM',
    4: '~10:00 AM',
    5: '~11:00 AM',
    6: '~12:00 PM (Midday)',
    7: '~1:00 PM',
    8: '~2:00 PM',
    9: '~3:00 PM',
    10: '~4:00 PM',
    11: '~5:00 PM',
    12: '~6:00 PM (Sunset)',
    13: '~7:00 PM',
    14: '~8:00 PM',
    15: '~9:00 PM',
    16: '~10:00 PM',
    17: '~11:00 PM',
    18: '~12:00 AM (Midnight)',
    19: '~1:00 AM',
    20: '~2:00 AM',
    21: '~3:00 AM',
    22: '~4:00 AM',
    23: '~5:00 AM',
  };
  return timeMap[romanHour] ?? `Hour ${romanHour}`;
};

export const SpiritualPracticesSetupScreen: React.FC<Props> = ({ navigation, route }) => {
  const user = useUserStore(state => state.user);
  const setUser = useUserStore(state => state.setUser);
  const colors = useThemeStore(state => state.colors);
  const isDark = useThemeStore(state => state.isDark);

  const [selectedPractices, setSelectedPractices] = useState<string[]>(
    user.spiritualPractices || []
  );

  const isEditing = route.params?.isEditing ?? false;

  const handleTogglePractice = (id: string): void => {
    setSelectedPractices(prev => (prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]));
  };

  const handleContinue = (): void => {
    setUser({
      ...user,
      spiritualPractices: selectedPractices,
    });

    // Recalculate anchors based on new settings (Future Only)
    // We do this sync-ish, but it might block slightly.
    // Ideally we pass coords. User object might not have them if basic, assume default or current provided.
    const lat = user.latitude ?? 52.3676;
    const long = user.longitude ?? 4.9041;

    // Recalculate anchors based on new settings (Future Only)
    anchorsService.recalculateFutureAnchors(lat, long);

    if (isEditing) {
      if (navigation.canGoBack()) {
        navigation.goBack();
      } else {
        // Fallback if accessed directly (unlikely)
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      }
    } else {
      navigation.navigate('LoadingSetup');
    }
  };

  const renderPracticeItem = (practice: {
    id: string;
    name: string;
    romanHour: number;
    durationMinutes: number;
  }): React.JSX.Element => {
    const isSelected = selectedPractices.includes(practice.id);
    return (
      <TouchableOpacity
        key={practice.id}
        onPress={() => handleTogglePractice(practice.id)}
        style={[
          styles.practiceItem,
          {
            backgroundColor: isSelected ? (isDark ? colors.surface : '#EDF7ED') : colors.surface,
            borderColor: isSelected ? colors.primary : 'transparent',
          },
        ]}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: isSelected ? colors.primary : colors.border,
              backgroundColor: isSelected ? colors.primary : 'transparent',
            },
          ]}
        >
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.practiceInfo}>
          <Text
            style={[
              styles.practiceName,
              isSelected && styles.practiceNameSelected,
              { color: colors.text },
            ]}
          >
            {practice.name}
          </Text>
          <Text style={[styles.practiceDetail, { color: colors.textSecondary }]}>
            {romanHourToTimeDescription(practice.romanHour)} • {practice.durationMinutes}m
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategory = ({ item }: { item: PracticeCategory }): React.JSX.Element => (
    <View style={styles.categoryContainer}>
      <Text style={[styles.categoryTitle, { color: colors.textSecondary }]}>{item.name}</Text>
      {item.practices.map(renderPracticeItem)}
    </View>
  );

  const sections = RELIGIOUS_PRACTICES.map(tradition => ({
    title: tradition.name,
    data: tradition.categories,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.background, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          {isEditing ? '🙏 Update Disciplines' : '🙏 Spiritual Anchors'}
        </Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {isEditing
            ? 'Reconfigure your daily practices.'
            : 'Select daily practices to anchor your rhythm.'}
        </Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item, index) => item.name + index}
        renderItem={renderCategory}
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.sectionHeader, { borderBottomColor: colors.primary }]}>
            <Text style={[styles.sectionTitle, { color: colors.primary }]}>{title}</Text>
          </View>
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
      />

      <View
        style={[
          styles.footer,
          { backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={handleContinue}
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.continueButtonText}>
            {isEditing ? 'Save Changes' : `Continue (${selectedPractices.length}) →`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    borderBottomWidth: 2,
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  practiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  practiceInfo: {
    flex: 1,
  },
  practiceName: {
    fontSize: 16,
    fontWeight: '500',
  },
  practiceNameSelected: {
    fontWeight: '700',
  },
  practiceDetail: {
    fontSize: 13,
    marginTop: 2,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
  },
  continueButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
