import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeStore } from '../stores/themeStore';

/**
 * Props for the BaseScreen component
 */
export interface BaseScreenProps {
  /** Screen title displayed in the header */
  title: string;
  /** Content to render inside the screen */
  children: React.ReactNode;
  /** Whether to show the settings icon in the header */
  showSettings?: boolean;
  /** Callback when settings icon is pressed */
  onSettingsPress?: () => void;
}

/**
 * Reusable base screen component with consistent header and layout
 *
 * Features:
 * - Safe area handling for notches and status bars
 * - Header with title and optional settings icon
 * - Consistent 16px padding
 * - Full TypeScript typing
 */
export function BaseScreen({
  title,
  children,
  showSettings = true,
  onSettingsPress,
}: BaseScreenProps): React.JSX.Element {
  const colors = useThemeStore(state => state.colors);

  const handleSettingsPress = (): void => {
    if (onSettingsPress) {
      onSettingsPress();
    } else {
      // console.log(`Settings pressed on ${title} screen`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View style={[styles.header, { borderBottomColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {showSettings && (
          <TouchableOpacity
            onPress={handleSettingsPress}
            style={styles.settingsButton}
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // background color injected dynamically
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    // border color injected dynamically
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    // color injected dynamically
  },
  settingsButton: {
    padding: 8,
  },
  settingsIcon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
    padding: 16,
  },
});

export default BaseScreen;
