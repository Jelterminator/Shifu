// Polyfill crypto.getRandomValues for uuid on native platforms
import * as Crypto from 'expo-crypto';

if (!global.crypto) {
  Object.defineProperty(global, 'crypto', {
    value: {
      getRandomValues: (array: Uint8Array) => Crypto.getRandomValues(array),
    },
    writable: true,
    configurable: true,
  });
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
