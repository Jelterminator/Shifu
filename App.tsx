import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppInitializer } from './src/components/AppInitializer';
import { RootNavigator } from './src/navigation/RootNavigator';

export default function App(): React.JSX.Element {
  console.log('✅ Step 5: Adding RootNavigator - FULL APP');
  return (
    <SafeAreaProvider>
      <AppInitializer>
        <StatusBar style="auto" />
        <RootNavigator />
      </AppInitializer>
    </SafeAreaProvider>
  );
}
