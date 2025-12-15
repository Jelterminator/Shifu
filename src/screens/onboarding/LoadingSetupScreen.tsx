import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { ActivityIndicator, Alert, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { phaseManager } from '../../services/PhaseManager';
import { anchorsService } from '../../services/data/Anchors';
import { useThemeStore } from '../../stores/themeStore';
import { useUserStore } from '../../stores/userStore';
import type { RootStackParamList } from '../../types/navigation';
import { storage } from '../../utils/storage';

type Props = NativeStackScreenProps<RootStackParamList, 'LoadingSetup'>;

export const LoadingSetupScreen: React.FC<Props> = ({ navigation }) => {
  const user = useUserStore(state => state.user);
  const setCurrentPhase = useThemeStore(state => state.setCurrentPhase);
  const colors = useThemeStore(state => state.colors);

  useEffect(() => {
    const initializeApp = (): void => {
      try {
        // Initialize PhaseManager with stored location (or defaults)
        const latitude = user.latitude ?? 52.3676; // Default to Amsterdam if missing
        const longitude = user.longitude ?? 4.9041;
        const timezone = user.timezone || 'Europe/Amsterdam';

        phaseManager.initialize(latitude, longitude, timezone);

        // Initialize Anchors Service to generate anchors based on user's location and practices
        anchorsService.initialize(latitude, longitude);

        // Calculate phases
        const currentPhase = phaseManager.getCurrentPhase();

        // Update Theme Manager
        setCurrentPhase(currentPhase);

        // Mark onboarding as complete
        storage.set('onboarding_complete', 'true');

        // Navigate to main app
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }],
          });
        }, 1500); // Small delay for UX
      } catch (error) {
        console.error('Failed to initialize app:', error);
        Alert.alert('Initialization Error', 'Failed to prepare the app. Please try again.');
      }
    };

    void initializeApp();
  }, [navigation, user.latitude, user.longitude, user.timezone, setCurrentPhase]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background, // Apply theme background
      }}
    >
      <Text style={{ fontSize: 32, marginBottom: 24, fontWeight: 'bold', color: colors.text }}>
        🌿 Shifu
      </Text>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={{ marginTop: 24, color: colors.textSecondary, fontSize: 16 }}>
        Preparing your personalized daily rhythm...
      </Text>
    </SafeAreaView>
  );
};
