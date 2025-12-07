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
  SleepHoursSetupScreen,
  SpiritualPracticesSetupScreen,
  TasksScreen,
  WelcomeScreen,
  WorkHoursSetupScreen,
} from '../screens';
import { useThemeStore } from '../stores/themeStore';
import { storage } from '../utils/storage';

// -- Icons (Placeholder logic since we don't have the icon library import handy, 
//    but usually it's Ionicons/MaterialCommunityIcons. Using Text for now or safe lookup)
function TabIcon({ name, color, focused }: { name: string; color: string; focused: boolean }) {
  // Simple mapping for visual feedback
  const icons: Record<string, string> = {
    Agenda: '📅',
    Tasks: '✅',
    Habits: '🔄',
    Journal: '📖',
    Chat: '💬',
  };
  return <Text style={{ fontSize: 24, color }}>{icons[name] || '?'}</Text>;
}

// -- Main Tab Navigator --
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  const colors = useThemeStore(state => state.colors);
  
  return (
    <Tab.Navigator
        screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.background,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarIcon: ({ color, focused }) => (
            <TabIcon name={route.name} color={color} focused={focused} />
        ),
        })}
    >
      <Tab.Screen name="Agenda" component={AgendaScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Habits" component={HabitsScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
    </Tab.Navigator>
  );
}

// -- Root Stack Navigator --
const Stack = createNativeStackNavigator();

export function RootNavigator(): React.JSX.Element {
  // Check completion status from storage
  const onboardingComplete = storage.get('onboarding_complete') === 'true';
  const initialRouteName = onboardingComplete ? 'MainTabs' : 'Welcome';

  // console.log('🧭 RootNavigator: Initial route:', initialRouteName);

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default RootNavigator;
