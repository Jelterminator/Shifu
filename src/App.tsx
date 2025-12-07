import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppInitializer } from './components/AppInitializer';
import { RootNavigator } from './navigation/RootNavigator';

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <AppInitializer>
        <StatusBar style="auto" />
        <RootNavigator />
      </AppInitializer>
    </SafeAreaProvider>
  );
}
