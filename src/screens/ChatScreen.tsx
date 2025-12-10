import React, { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BaseScreen } from '../components/BaseScreen';
import { BORDER_RADIUS, SHADOWS, SPACING } from '../constants/theme';
import { useThemeStore } from '../stores/themeStore';
import type { MainTabScreenProps } from '../types/navigation';

/**
 * Props for the ChatScreen component
 */
export type ChatScreenProps = MainTabScreenProps<'Chat'>;

/**
 * Message type
 */
type MessageType = 'ai' | 'user' | 'system';

/**
 * Chat message interface
 */
interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
}

/**
 * Quick action interface
 */
interface QuickAction {
  id: string;
  label: string;
  prompt: string;
}

/**
 * Format time for display
 */
const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Quick actions for common requests
 */
const QUICK_ACTIONS: QuickAction[] = [
  { id: '1', label: 'Optimize Today', prompt: 'Can you regenerate my schedule for today?' },
  { id: '2', label: 'Schedule Habit', prompt: 'Add a new habit to my routine' },
  { id: '3', label: 'Add Tasks', prompt: 'I need to add multiple tasks...' },
  { id: '4', label: "What's Next?", prompt: 'What should I focus on now?' },
];

/**
 * Welcome message for empty chat
 */
const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  type: 'ai',
  content:
    "Hi! I'm your AI assistant. I can help you manage your schedule, tasks, and habits. Try asking me something!",
  timestamp: new Date(),
};

/**
 * ChatScreen - AI-powered secretary interface
 */
export function ChatScreen(_props: ChatScreenProps): React.JSX.Element {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const { colors, phaseColor } = useThemeStore();

  const sendMessage = (text: string): void => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // Simulate AI typing
    setIsTyping(true);

    // Simulate AI response after a delay
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: getAIResponse(text),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1000);
  };

  const getAIResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();

    if (input.includes('task') || input.includes('add')) {
      return 'I can help you add that task! Which list should it go to? And do you have a deadline in mind?';
    }
    if (input.includes('schedule') || input.includes('today')) {
      return 'Looking at your schedule for today... You have a few open blocks in the afternoon that would be perfect for deep work. Would you like me to optimize your day?';
    }
    if (input.includes('habit')) {
      return "I'd be happy to help you build a new habit! What would you like to work on, and which phase of the day works best for you?";
    }
    if (input.includes('focus') || input.includes('next')) {
      return "Based on your current phase and priorities, I'd suggest focusing on your highest-priority task. You have about 2 hours until your next scheduled event.";
    }

    return "I understand. Is there anything specific you'd like me to help you with? I can manage your schedule, add tasks, or provide advice on your daily routine.";
  };

  const handleQuickAction = (action: QuickAction): void => {
    sendMessage(action.prompt);
  };

  const renderMessage = ({ item }: { item: ChatMessage }): React.JSX.Element => {
    const isAI = item.type === 'ai';
    const isSystem = item.type === 'system';

    if (isSystem) {
      return (
        <View style={styles.systemMessage}>
          <Text style={[styles.systemMessageText, { color: colors.textSecondary }]}>
            {item.content}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.messageRow, !isAI && styles.messageRowUser]}>
        {isAI && (
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>🤖</Text>
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isAI
              ? [styles.aiBubble, { backgroundColor: colors.surface }]
              : [styles.userBubble, { backgroundColor: phaseColor + '33' }],
          ]}
        >
          <Text style={[styles.messageText, { color: colors.text }]}>{item.content}</Text>
          <Text style={[styles.timestamp, { color: colors.textSecondary }]}>
            {formatTime(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const renderQuickActions = (): React.JSX.Element => (
    <View style={styles.quickActionsContainer}>
      <Text style={[styles.quickActionsLabel, { color: colors.textSecondary }]}>
        ⚡ Quick Actions
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.quickActionsScroll}
      >
        {QUICK_ACTIONS.map(action => (
          <TouchableOpacity
            key={action.id}
            style={[
              styles.quickActionChip,
              { backgroundColor: colors.surface, borderColor: phaseColor },
            ]}
            onPress={() => handleQuickAction(action)}
          >
            <Text style={[styles.quickActionText, { color: phaseColor }]}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderEmptyState = (): React.JSX.Element => (
    <View style={styles.emptyStateContainer}>
      <Text style={styles.emptyStateIcon}>🤖</Text>
      <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
        {"Hi! I'm your AI assistant."}
      </Text>
      <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
        I can help you:{'\n'}• Manage your schedule{'\n'}• Add and organize tasks{'\n'}• Track your
        habits{'\n'}• Provide personalized advice
      </Text>
      <Text style={[styles.emptyStateSuggestion, { color: colors.textSecondary }]}>
        Try saying:
        {'\n'}
        {`"What should I focus on now?"`}
        {'\n'}
        {`"Add a task to review PRs"`}
        {'\n'}
        {`"Show my productivity patterns"`}
      </Text>
    </View>
  );

  return (
    <BaseScreen title="AI Coach" showSettings={true}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={
            isTyping ? (
              <View style={styles.typingContainer}>
                <Text style={styles.typingAvatar}>🤖</Text>
                <View style={[styles.typingBubble, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.typingText, { color: colors.textSecondary }]}>
                    Typing...
                  </Text>
                </View>
              </View>
            ) : null
          }
        />

        {/* Quick Actions */}
        {renderQuickActions()}

        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: colors.surface }]}>
          <TextInput
            style={[styles.textInput, { backgroundColor: colors.background, color: colors.text }]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textSecondary}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(inputText)}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? phaseColor : '#E0E0E0' },
            ]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
          >
            <Text style={styles.sendButtonText}>📤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messagesList: {
    padding: SPACING.m,
    paddingBottom: SPACING.s,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: SPACING.m,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  avatarContainer: {
    marginRight: SPACING.s,
  },
  avatar: {
    fontSize: 24,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.large,
    ...SHADOWS.level1,
  },
  aiBubble: {
    borderTopLeftRadius: SPACING.xs,
  },
  userBubble: {
    borderTopRightRadius: SPACING.xs,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  timestamp: {
    fontSize: 11,
    marginTop: SPACING.xs,
    alignSelf: 'flex-end',
  },
  systemMessage: {
    alignItems: 'center',
    marginVertical: SPACING.s,
  },
  systemMessageText: {
    fontSize: 12,
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SPACING.m,
  },
  typingAvatar: {
    fontSize: 24,
    marginRight: SPACING.s,
  },
  typingBubble: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.large,
    borderTopLeftRadius: SPACING.xs,
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  quickActionsContainer: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
  },
  quickActionsLabel: {
    fontSize: 12,
    marginBottom: SPACING.xs,
  },
  quickActionsScroll: {
    flexDirection: 'row',
  },
  quickActionChip: {
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    borderRadius: BORDER_RADIUS.large,
    borderWidth: 1,
    marginRight: SPACING.s,
  },
  quickActionText: {
    fontSize: 13,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.s,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  textInput: {
    flex: 1,
    borderRadius: BORDER_RADIUS.large,
    paddingHorizontal: SPACING.m,
    paddingVertical: SPACING.s,
    fontSize: 16,
    maxHeight: 100,
    marginRight: SPACING.s,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    fontSize: 20,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: SPACING.m,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: SPACING.m,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 15,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: SPACING.m,
  },
  emptyStateSuggestion: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default ChatScreen;
