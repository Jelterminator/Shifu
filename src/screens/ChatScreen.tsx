/* eslint-disable */
import React, { useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { BaseScreen } from '../components/BaseScreen';
import { BotIcon, SendIcon } from '../components/icons/AppIcons';
import { BORDER_RADIUS, DIMENSIONS, SHADOWS, SPACING } from '../constants/theme';
import { AgentLoop } from '../services/ai/AgentLoop';
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

  const sendMessage = async (text: string): Promise<void> => {
    if (!text.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    try {
      // Prepare history (last 10 messages, excluding the current one being sent)
      // We use 'messages' state which doesn't have the new user message yet in this closure,
      // or we can just filter. The 'messages' in scope is the state at render time.
      const history = messages
        .slice(-10) // Limit to last 10
        .filter(m => m.type !== 'system' && m.id !== 'welcome') // Skip system/welcome messages if needed
        .map(m => ({
          role: (m.type === 'ai' ? 'assistant' : m.type) as 'assistant' | 'user' | 'system',
          content: m.content,
        }));

      // Execute the request via the AgentLoop
      const responseText = await AgentLoop.getInstance().executeUserRequest(text.trim(), history);

      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: responseText,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error in chat:', error);
      const errorResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'system',
        content: 'Sorry, I encountered an error processing your request.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
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
            <BotIcon color={phaseColor} size={24} />
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
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={DIMENSIONS.BAR_HEIGHT}
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
                <View style={styles.avatarContainer}>
                  <BotIcon color={phaseColor} size={24} />
                </View>
                <View style={[styles.typingBubble, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.typingText, { color: colors.textSecondary }]}>
                    Typing...
                  </Text>
                </View>
              </View>
            ) : null
          }
        />

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
            nativeID="chat-input"
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: inputText.trim() ? phaseColor : '#E0E0E0' },
            ]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim()}
          >
            <SendIcon color={inputText.trim() ? '#fff' : '#9E9E9E'} size={20} />
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
    paddingHorizontal: SPACING.m,
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
  typingBubble: {
    padding: SPACING.m,
    borderRadius: BORDER_RADIUS.large,
    borderTopLeftRadius: SPACING.xs,
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
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
