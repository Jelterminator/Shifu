import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BaseScreen } from '../components/BaseScreen';
import type { MainTabScreenProps } from '../types/navigation';

/**
 * Props for the JournalScreen component
 */
export type JournalScreenProps = MainTabScreenProps<'Journal'>;

/**
 * Journal screen - displays journal entries and writing interface
 */
export function JournalScreen(_props: JournalScreenProps): React.JSX.Element {
  const handleSettingsPress = (): void => {
    // console.log('JournalScreen: Settings pressed');
  };

  return (
    <BaseScreen title="Journal" showSettings={true} onSettingsPress={handleSettingsPress}>
      <View style={styles.placeholder}>
        <Text style={styles.icon}>📓</Text>
        <Text style={styles.title}>Your Journal</Text>
        <Text style={styles.description}>
          Capture your thoughts, reflections, and daily experiences.
        </Text>
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

export default JournalScreen;
