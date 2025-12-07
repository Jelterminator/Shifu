import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { phaseManager } from '../services/PhaseManager';
import { anchorsService } from '../services/data/Anchors';
import { useUserStore } from '../stores/userStore';
import { storage } from '../utils/storage';

interface Props {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<Props> = ({ children }): React.ReactElement => {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const user = useUserStore(state => state.user);

  useEffect(() => {
    const initialize = (): void => {
      try {
        // console.log('🚀 AppInitializer: Starting initialization...');

        const onboardingComplete = storage.get('onboarding_complete') === 'true';
        // console.log(`📋 Onboarding complete: ${onboardingComplete}`);

        if (onboardingComplete) {
          // Use user location or fall back to Amsterdam defaults
          const latitude = user.latitude ?? 52.3676;
          const longitude = user.longitude ?? 4.9041;
          const timezone = user.timezone || 'Europe/Amsterdam';

          // console.log(`📍 Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}, ${timezone}`);

          try {
            // Initialize PhaseManager
            phaseManager.initialize(latitude, longitude, timezone);
            // console.log('✅ PhaseManager initialized');

            // Only initialize anchorsService on native platforms or if explicitly supported
            if (Platform.OS !== 'web') {
              anchorsService.initialize(latitude, longitude); // initialization
              // console.log('✅ AnchorsService initialized');
            } else {
              // console.log('⚠️ AnchorsService skipped on web platform');
            }
          } catch (serviceError) {
            console.error('⚠️ Service initialization error:', serviceError);
            // Continue anyway - services can fail gracefully
          }
        } else {
          // console.log('⏭️ Onboarding not complete, skipping service initialization');
        }

        setIsReady(true);
        // console.log('✅ AppInitializer: Initialization complete');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ AppInitializer: Fatal initialization error:', errorMessage);
        setInitError(errorMessage);
        // Still set ready to true to allow app to render with degraded functionality
        setIsReady(true);
      }
    };

    void initialize();
  }, [user]);

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A7C59" />
      </View>
    );
  }

  if (initError) {
    console.warn('⚠️ App running with initialization errors:', initError);
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
