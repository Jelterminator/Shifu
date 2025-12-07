import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

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
import type { MainTabParamList, RootStackParamList } from '../types/navigation';
import { storage } from '../utils/storage';

const Tab = createBottomTabNavigator<MainTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Tab bar icon configuration
 */
interface TabIconConfig {
  icon: string;
  label: string;
}

const TAB_ICONS: Record<keyof MainTabParamList, TabIconConfig> = {
  Habits: { icon: '🌱', label: 'Habits' },
  Journal: { icon: '📓', label: 'Journal' },
  Agenda: { icon: '📅', label: 'Agenda' },
  Tasks: { icon: '✓', label: 'Tasks' },
  Chat: { icon: '💬', label: 'Chat' },
};

/**
 * Tab bar icon component
 */
interface TabBarIconProps {
  routeName: keyof MainTabParamList;
  focused: boolean;
}

function TabBarIcon({ routeName, focused }: TabBarIconProps): React.JSX.Element {
  const config = TAB_ICONS[routeName];
  return <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>{config.icon}</Text>;
}

/**
 * Main Tab Navigator with bottom tabs
 */
function MainTabNavigator(): React.JSX.Element {
  return (
    <Tab.Navigator
      initialRouteName="Agenda"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => <TabBarIcon routeName={route.name} focused={focused} />,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
      })}
    >
      <Tab.Screen name="Habits" component={HabitsScreen} options={{ tabBarLabel: 'Habits' }} />
      <Tab.Screen name="Journal" component={JournalScreen} options={{ tabBarLabel: 'Journal' }} />
      <Tab.Screen name="Agenda" component={AgendaScreen} options={{ tabBarLabel: 'Agenda' }} />
      <Tab.Screen name="Tasks" component={TasksScreen} options={{ tabBarLabel: 'Tasks' }} />
      <Tab.Screen name="Chat" component={ChatScreen} options={{ tabBarLabel: 'Chat' }} />
    </Tab.Navigator>
  );
}

/**
 * Root Navigator - wraps the entire navigation structure
 */
export function RootNavigator(): React.JSX.Element {
  // Check if onboarding is complete
  const onboardingComplete = storage.get('onboarding_complete') === 'true';
  const initialRouteName = onboardingComplete ? 'MainTabs' : 'Welcome';

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="LocationSetup" component={LocationSetupScreen} />
        <Stack.Screen name="SleepHoursSetup" component={SleepHoursSetupScreen} />
        <Stack.Screen name="WorkHoursSetup" component={WorkHoursSetupScreen} />
        <Stack.Screen name="SpiritualPracticesSetup" component={SpiritualPracticesSetupScreen} />
        <Stack.Screen name="LoadingSetup" component={LoadingSetupScreen} />
        <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingTop: 8,
    paddingBottom: 8,
    height: 60,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabIcon: {
    fontSize: 24,
    opacity: 0.6,
  },
  tabIconFocused: {
    opacity: 1,
  },
});

export default RootNavigator;
