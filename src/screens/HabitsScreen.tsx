import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BaseScreen } from '../components/BaseScreen';
import type { MainTabScreenProps } from '../types/navigation';

/**
 * Props for the HabitsScreen component
 */
export type HabitsScreenProps = MainTabScreenProps<'Habits'>;

/**
 * Habits screen - displays habit tracking and progress
 */
export function HabitsScreen(_props: HabitsScreenProps): React.JSX.Element {
  const handleSettingsPress = (): void => {
    // console.log('HabitsScreen: Settings pressed');
  };

  return (
    <BaseScreen title="Habits" showSettings={true} onSettingsPress={handleSettingsPress}>
      <View style={styles.placeholder}>
        <Text style={styles.icon}>🌱</Text>
        <Text style={styles.title}>Your Habits</Text>
        <Text style={styles.description}>Track your daily habits and build better routines.</Text>
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
  },
});

export default HabitsScreen;
