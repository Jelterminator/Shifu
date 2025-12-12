/* eslint-disable no-console */
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { db } from '../db/database';
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
    const initialize = async (): Promise<void> => {
      try {
        // 1. Initialize database FIRST
        await db.initialize();

        // 2. Ensure User Identity exists (Self-Healing)
        let currentUser = user;
        if (!currentUser?.id) {
          // Check if we have a user in DB (maybe store was cleared but DB persists)
          // Simple query to get the first user
          const users = await db.query<{
            id: string;
            timezone: string;
            spiritual_practices: string;
          }>('SELECT * FROM users LIMIT 1');

          if (users.length > 0 && users[0]) {
            // Rehydrate store from DB (simplified for now, just ID and defaults)
            // Ideally we load full profile
            const dbUser = users[0];
            let practices: string[] = [];

            try {
              if (dbUser.spiritual_practices) {
                practices = JSON.parse(dbUser.spiritual_practices) as string[];
              }
            } catch (e) {
              console.warn('Failed to parse spiritual practices', e);
            }

            const fullUser = {
              id: dbUser.id,
              name: null,
              email: null,
              timezone: dbUser.timezone,
              spiritualPractices: practices,
            };
            useUserStore.getState().setUser(fullUser);
            currentUser = fullUser;
          } else {
            // truly new or broken state -> Create new User

            const newId = crypto.randomUUID();
            const defaultTimezone = 'Europe/Amsterdam'; // Fallback

            await db.execute('INSERT INTO users (id, timezone, created_at) VALUES (?, ?, ?)', [
              newId,
              defaultTimezone,
              new Date().toISOString(),
            ]);

            const newUser = {
              id: newId,
              name: null,
              email: null,
              timezone: defaultTimezone,
            };
            useUserStore.getState().setUser(newUser);
            currentUser = newUser;
          }
        } else {
        }

        // 3. One-time Onboarding Check
        const valBool = storage.getBoolean('onboarding_complete') ?? false;
        const valString = storage.getString('onboarding_complete');
        const visitedOnboarding = valBool || valString === 'true';

        if (visitedOnboarding && currentUser?.id) {
          // Initialize services
          const latitude = currentUser.latitude ?? 52.3676;
          const longitude = currentUser.longitude ?? 4.9041;
          const timezone = currentUser.timezone || 'Europe/Amsterdam';

          phaseManager.initialize(latitude, longitude, timezone);

          // Initialize Anchors Service (Works on Web now via localStorage fallback)
          try {
            anchorsService.initialize(latitude, longitude);
          } catch (e) {
            console.warn('⚠️ AnchorsService init warning:', e);
          }
        }

        setIsReady(true);
      } catch (error) {
        // ... err handling
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error('❌ AppInitializer: Fatal initialization error:', errorMessage);
        setInitError(errorMessage);
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
    // In dev, show the error. In prod, maybe show a generic error or toast.
    console.warn('⚠️ App running with initialization errors:', initError);
    return (
      <View style={styles.container}>
        <Text style={{ color: 'red', margin: 20 }}>Initialization Error: {initError}</Text>
        {children}
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
