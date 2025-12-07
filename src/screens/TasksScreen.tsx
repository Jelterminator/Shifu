import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BaseScreen } from '../components/BaseScreen';
import type { MainTabScreenProps } from '../types/navigation';

/**
 * Props for the TasksScreen component
 */
export type TasksScreenProps = MainTabScreenProps<'Tasks'>;

/**
 * Tasks screen - displays task list and management interface
 */
export function TasksScreen(_props: TasksScreenProps): React.JSX.Element {
  const handleSettingsPress = (): void => {
    //console.log('TasksScreen: Settings pressed');
  };

  return (
    <BaseScreen title="Tasks" showSettings={true} onSettingsPress={handleSettingsPress}>
      <View style={styles.placeholder}>
        <Text style={styles.icon}>✓</Text>
        <Text style={styles.title}>Your Tasks</Text>
        <Text style={styles.description}>
          Manage your to-do list and stay on top of your goals.
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

export default TasksScreen;
