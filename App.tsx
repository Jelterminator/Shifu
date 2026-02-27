
// Polyfill crypto.getRandomValues for uuid on native platforms
import 'react-native-get-random-values/index';

import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppInitializer } from './src/components/AppInitializer';
import { RootNavigator } from './src/navigation/RootNavigator';

// ⚠️ Side-effectful import: defines the background task in global scope.
// Must be imported at the app entry point BEFORE components mount.
import './src/services/background/BackgroundTaskSetup';

import { ErrorBoundary } from './src/components/ErrorBoundary';

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppInitializer>
          <StatusBar style="auto" />
          <RootNavigator />
        </AppInitializer>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
