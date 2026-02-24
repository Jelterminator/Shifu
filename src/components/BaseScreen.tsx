import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DIMENSIONS, SPACING } from '../constants/theme';
import { useThemeStore } from '../stores/themeStore';
import type { RootStackParamList } from '../types/navigation';
import { SettingsIcon } from './icons/AppIcons';
import PhaseClock from './PhaseClock';

/**
 * Props for the BaseScreen component
 */
export interface BaseScreenProps {
  /** Screen title displayed in the header */
  title: string | React.ReactNode;
  /** Content to render inside the screen */
  children: React.ReactNode;
  /** Whether to show the settings icon in the header */
  showSettings?: boolean;
  /** Callback when settings icon is pressed */
  onSettingsPress?: () => void;
  /** Optional Nav props if we need them, though usually handled by parent */
  navigation?: unknown;
  /** Optional Footer component */
  footer?: React.ReactNode;
  /** Whether to add top padding to the content area (default: true) */
  withTopPadding?: boolean;
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
  footer,
  withTopPadding = true,
}: BaseScreenProps): React.JSX.Element {
  const colors = useThemeStore(state => state.colors);
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSettingsPress = (): void => {
    if (onSettingsPress) {
      onSettingsPress();
    } else {
      navigation.navigate('Settings');
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      <StatusBar
        barStyle={colors.text === '#FFFFFF' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.surface, backgroundColor: colors.background },
        ]}
      >
        {typeof title === 'string' ? (
          <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        ) : (
          title
        )}
        {showSettings && (
          <TouchableOpacity
            onPress={handleSettingsPress}
            style={styles.settingsButton}
            accessibilityLabel="Settings"
            accessibilityRole="button"
          >
            <SettingsIcon color={colors.textSecondary} size={24} />
          </TouchableOpacity>
        )}
      </View>
      <View style={[styles.content, withTopPadding && styles.topPadding]}>{children}</View>
      {footer}
      <PhaseClock />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // background color injected dynamically
  },
  header: {
    height: DIMENSIONS.BAR_HEIGHT,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  content: {
    flex: 1,
  },
  topPadding: {
    paddingTop: SPACING.m,
  },
});

export default BaseScreen;
