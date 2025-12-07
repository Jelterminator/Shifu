import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './navigation/RootNavigator';

/**
 * Main App component - entry point for the Shifu application
 *
 * Sets up:
 * - SafeAreaProvider for safe area insets
 * - StatusBar configuration
 * - Root navigation structure
 */
export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <RootNavigator />
    </SafeAreaProvider>
  );
}
