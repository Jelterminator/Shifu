import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { phaseManager } from '../services/PhaseManager';
import { anchorsService } from '../services/data/Anchors';
import { useUserStore } from '../stores/userStore';
import { storage } from '../utils/storage';

interface Props {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<Props> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);
  const user = useUserStore((state) => state.user);

  useEffect(() => {
    const initialize = async () => {
      try {
        const onboardingComplete = storage.get('onboarding_complete') === 'true';

        if (onboardingComplete) {
            if (user.latitude && user.longitude) {
                await phaseManager.initialize(
                    user.latitude,
                    user.longitude,
                    user.timezone || 'Europe/Amsterdam'
                );
                await anchorsService.initialize(user.latitude, user.longitude);
            } else {
                console.warn('AppInitializer: Onboarding complete but user location missing. Using defaults.');
                await phaseManager.initialize(52.3676, 4.9041, 'Europe/Amsterdam');
                await anchorsService.initialize(52.3676, 4.9041);
            }
        }
      } catch (e) {
        console.error('AppInitializer: Failed to initialize', e);
      } finally {
        setIsReady(true);
      }
    };

    initialize();
  }, [user]); 

  // While initializing, use a safe render to prove we are alive
  if (!isReady) {
      return (
          <View style={styles.container}>
              <ActivityIndicator size="large" color="#4A7C59" />
          </View>
      );
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
