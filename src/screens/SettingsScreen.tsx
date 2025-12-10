import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BaseScreen } from '../components/BaseScreen';
import { useThemeStore } from '../stores/themeStore';
import type { RootStackScreenProps } from '../types/navigation';
import { storage } from '../utils/storage';

export function SettingsScreen({
  navigation,
}: RootStackScreenProps<'Settings'>): React.JSX.Element {
  const { colors } = useThemeStore();

  const handleResetOnboarding = (): void => {
    Alert.alert(
      'Reset Onboarding',
      'Are you sure you want to reset the onboarding process? This will clear your setup progress.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            storage.delete('onboarding_complete');
            navigation.reset({
              index: 0,
              routes: [{ name: 'Welcome' }],
            });
          },
        },
      ]
    );
  };

  return (
    <BaseScreen title="Settings">
      <View style={styles.container}>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Data & Storage</Text>
          <View style={styles.separator} />

          <TouchableOpacity onPress={handleResetOnboarding} style={styles.dangerButton}>
            <Text style={styles.dangerButtonText}>Reset Onboarding</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.versionText, { color: colors.textSecondary }]}>Shifu v0.1.0</Text>
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 16,
  },
  dangerButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#FF3B30', // System Red
    fontSize: 16,
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
  },
});
