import { useEffect, useState } from 'react';
import { phaseManager } from '../services/PhaseManager';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';

interface InitializationState {
  isInitializing: boolean;
  isInitialized: boolean;
  error: Error | null;
}

/**
 * Hook to initialize the app on startup
 *
 * Responsibilities:
 * 1. Read user location data from UserStore
 * 2. Initialize PhaseManager with location data
 * 3. Calculate and set current phase in ThemeStore
 * 4. Handle errors gracefully
 *
 * Should be called once in App.tsx or RootNavigator
 */
export function useInitializeApp(): InitializationState {
  const [state, setState] = useState<InitializationState>({
    isInitializing: true,
    isInitialized: false,
    error: null,
  });

  const user = useUserStore((store) => store.user);
  const setCurrentPhase = useThemeStore((store) => store.setCurrentPhase);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        console.log('🚀 Initializing app...');

        // Get location from UserStore or fall back to defaults
        const latitude = user.latitude ?? 52.3676; // Amsterdam default
        const longitude = user.longitude ?? 4.9041;
        const timezone = user.timezone || 'Europe/Amsterdam';

        console.log(`📍 Using location: ${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);

        // Initialize PhaseManager
        await phaseManager.initialize(latitude, longitude, timezone);

        // Calculate and set current phase
        const currentPhase = await phaseManager.getCurrentPhase();
        setCurrentPhase(currentPhase);

        console.log(`✅ App initialized. Current phase: ${currentPhase.name}`);

        if (mounted) {
          setState({
            isInitializing: false,
            isInitialized: true,
            error: null,
          });
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('❌ App initialization failed:', err);

        if (mounted) {
          setState({
            isInitializing: false,
            isInitialized: false,
            error: err,
          });
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [user.latitude, user.longitude, user.timezone, setCurrentPhase]);

  return state;
}

/**
 * Minimal initialization for subsequent phase updates
 * Call this when the user changes their location/timezone in settings
 */
export async function reinitializePhaseManager(): Promise<void> {
  try {
    const userStore = useUserStore.getState();
    const themeStore = useThemeStore.getState();

    const latitude = userStore.user.latitude ?? 52.3676;
    const longitude = userStore.user.longitude ?? 4.9041;
    const timezone = userStore.user.timezone || 'Europe/Amsterdam';

    await phaseManager.initialize(latitude, longitude, timezone);
    const currentPhase = await phaseManager.getCurrentPhase();
    themeStore.setCurrentPhase(currentPhase);

    console.log(`✅ PhaseManager reinitialized. New phase: ${currentPhase.name}`);
  } catch (error) {
    console.error('❌ PhaseManager reinitialization failed:', error);
    throw error;
  }
}