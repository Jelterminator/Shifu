import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BaseScreen } from '../components/BaseScreen';
import type { MainTabScreenProps } from '../types/navigation';
import { storage } from '../utils/storage';

/**
 * Props for the AgendaScreen component
 */
export type AgendaScreenProps = MainTabScreenProps<'Agenda'>;

/**
 * Agenda screen - displays daily schedule and upcoming events
 */
export function AgendaScreen({ navigation }: AgendaScreenProps): React.JSX.Element {
  const handleSettingsPress = (): void => {
    console.log('AgendaScreen: Settings pressed');
  };

  const handleReset = () => {
    storage.delete('onboarding_complete');
    // We need to use the Root navigator to reset to Welcome
    // Since Agenda is inside MainTabs, we need to go up.
    navigation.getParent()?.reset({
      index: 0,
      routes: [{ name: 'Welcome' }],
    });
  };

  return (
    <BaseScreen title="Agenda" showSettings={true} onSettingsPress={handleSettingsPress}>
      <View style={styles.placeholder}>
        <Text style={styles.icon}>📅</Text>
        <Text style={styles.title}>Your Agenda</Text>
        <Text style={styles.description}>View your daily schedule and upcoming events here.</Text>
        
        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetText}>Reset Onboarding Demo</Text>
        </TouchableOpacity>
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  resetButton: {
      padding: 12,
      backgroundColor: '#FFE5E5',
      borderRadius: 8,
  },
  resetText: {
      color: '#D00',
      fontWeight: '600',
  }
});

export default AgendaScreen;
