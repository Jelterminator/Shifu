import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { SafeAreaView, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { RELIGIOUS_PRACTICES, type PracticeCategory } from '../../data/practices';
import { useUserStore } from '../../stores/userStore';
import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'SpiritualPracticesSetup'>;

export const SpiritualPracticesSetupScreen: React.FC<Props> = ({ navigation, route }) => {
  const user = useUserStore(state => state.user);
  const setUser = useUserStore(state => state.setUser);
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
    
    // Import dynamically or use the imported instance
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { anchorsService } = require('../../services/data/Anchors');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
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
        style={[styles.practiceItem, isSelected && styles.practiceItemSelected]}
      >
        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
          {isSelected && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <View style={styles.practiceInfo}>
          <Text style={[styles.practiceName, isSelected && styles.practiceNameSelected]}>
            {practice.name}
          </Text>
          <Text style={styles.practiceDetail}>
            Hour {practice.romanHour} • {practice.durationMinutes}m
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderCategory = ({ item }: { item: PracticeCategory }): React.JSX.Element => (
    <View style={styles.categoryContainer}>
      <Text style={styles.categoryTitle}>{item.name}</Text>
      {item.practices.map(renderPracticeItem)}
    </View>
  );

  const sections = RELIGIOUS_PRACTICES.map(tradition => ({
    title: tradition.name,
    data: tradition.categories,
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {isEditing ? '🙏 Update Disciplines' : '🙏 Spiritual Anchors'}
        </Text>
        <Text style={styles.subtitle}>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
        )}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={styles.listContent}
      />

      <View style={styles.footer}>
        <TouchableOpacity onPress={handleContinue} style={styles.continueButton}>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1A1A1A',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#4A7C59',
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A7C59',
    marginBottom: 4,
  },
  categoryContainer: {
    marginBottom: 16,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#888',
    marginBottom: 8,
    marginLeft: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  practiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F9F9F9',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  practiceItemSelected: {
    backgroundColor: '#EDF7ED', // Light green
    borderColor: '#4A7C59',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#C0C0C0',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  checkboxSelected: {
    borderColor: '#4A7C59',
    backgroundColor: '#4A7C59',
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
    color: '#333333',
  },
  practiceNameSelected: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  practiceDetail: {
    fontSize: 13,
    color: '#888888',
    marginTop: 2,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#FFFFFF',
  },
  continueButton: {
    backgroundColor: '#4A7C59',
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
