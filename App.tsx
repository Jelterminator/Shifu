// Polyfill crypto.getRandomValues for uuid on native platforms
import * as Crypto from 'expo-crypto';

if (!global.crypto) {
  (global as any).crypto = {
    getRandomValues: (array: any) => Crypto.getRandomValues(array),
  };
}

import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppInitializer } from './src/components/AppInitializer';
import { RootNavigator } from './src/navigation/RootNavigator';

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
