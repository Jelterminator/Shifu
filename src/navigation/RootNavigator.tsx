import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Text } from 'react-native';

import {
  AgendaScreen,
  ChatScreen,
  HabitsScreen,
  JournalScreen,
  LoadingSetupScreen,
  LocationSetupScreen,
  SettingsScreen,
  SleepHoursSetupScreen,
  SpiritualPracticesSetupScreen,
  TasksScreen,
  WelcomeScreen,
  WorkHoursSetupScreen,
} from '../screens';
import { useThemeStore } from '../stores/themeStore';
import { type MainTabParamList, type RootStackParamList } from '../types/navigation';
import { storage } from '../utils/storage';

// -- Icons --
function TabIcon({ name, color }: { name: string; color: string }): React.JSX.Element {
  const icons: Record<string, string> = {
    Agenda: '📅', // Calendar
    Tasks: '✅',
    Habits: '🔄',
    Journal: '📖',
    Chat: '💬',
  };
  return <Text style={{ fontSize: 24, color }}>{icons[name] || '?'}</Text>;
}

// -- Main Tab Navigator --
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabNavigator(): React.JSX.Element {
  const colors = useThemeStore(state => state.colors);

  return (
    <Tab.Navigator
      initialRouteName="Agenda"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.background,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ color }) => <TabIcon name={route.name} color={color} />,
      })}
    >
      <Tab.Screen name="Habits" component={HabitsScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
}

// -- Root Stack Navigator --
const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator(): React.JSX.Element {
  // Check completion status from storage
  const onboardingComplete = storage.get('onboarding_complete') === 'true';
  const initialRouteName = onboardingComplete ? 'MainTabs' : 'Welcome';

  // Use a safer selection from store
  const themeColors = useThemeStore(state => state.colors);

  if (!themeColors) {
    return <></>; // Return empty fragment to satisfy JSX.Element return type
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
        {/* Onboarding Flow */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="LocationSetup" component={LocationSetupScreen} />
        <Stack.Screen name="SleepHoursSetup" component={SleepHoursSetupScreen} />
        <Stack.Screen name="WorkHoursSetup" component={WorkHoursSetupScreen} />
        <Stack.Screen name="SpiritualPracticesSetup" component={SpiritualPracticesSetupScreen} />
        <Stack.Screen name="LoadingSetup" component={LoadingSetupScreen} />

        {/* Main App */}
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            headerShown: true, // Show header for Settings
            presentation: 'modal', // Nice modal presentation
            headerStyle: { backgroundColor: themeColors.surface },
            headerTintColor: themeColors.text,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
