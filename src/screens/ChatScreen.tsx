import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { BaseScreen } from '../components/BaseScreen';
import type { MainTabScreenProps } from '../types/navigation';

/**
 * Props for the ChatScreen component
 */
export type ChatScreenProps = MainTabScreenProps<'Chat'>;

/**
 * Chat screen - displays AI chat interface
 */
export function ChatScreen(_props: ChatScreenProps): React.JSX.Element {
  const handleSettingsPress = (): void => {
    //console.log('ChatScreen: Settings pressed');
  };

  return (
    <BaseScreen title="Chat" showSettings={true} onSettingsPress={handleSettingsPress}>
      <View style={styles.placeholder}>
        <Text style={styles.icon}>💬</Text>
        <Text style={styles.title}>Chat with Shifu</Text>
        <Text style={styles.description}>
          Get personalized guidance and support from your AI coach.
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

export default ChatScreen;
