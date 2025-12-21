/**
 * Navigation type definitions for React Navigation v6
 */

import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

/**
 * Bottom Tab Navigator parameter list
 */
export type MainTabParamList = {
  Agenda: undefined;
  Habits: undefined;
  Journal: undefined;
  Tasks: undefined;
  Chat: undefined;
};

/**
 * Root Stack Navigator parameter list
 */
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  Welcome: undefined;
  LocationSetup: undefined;
  SleepHoursSetup: undefined;
  WorkHoursSetup: undefined;
  SpiritualPracticesSetup: { isEditing?: boolean } | undefined;
  LoadingSetup: undefined;
  StartupConfig: undefined;
  Settings: undefined;
};

/**
 * Props for screens in the Root Stack Navigator
 */
export type RootStackScreenProps<T extends keyof RootStackParamList> = NativeStackScreenProps<
  RootStackParamList,
  T
>;

/**
 * Props for screens in the Main Tab Navigator
 */
export type MainTabScreenProps<T extends keyof MainTabParamList> = CompositeScreenProps<
  BottomTabScreenProps<MainTabParamList, T>,
  RootStackScreenProps<keyof RootStackParamList>
>;

export type HabitsScreenProps = MainTabScreenProps<'Habits'>;

/**
 * Declaration merging for useNavigation hook type safety
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
