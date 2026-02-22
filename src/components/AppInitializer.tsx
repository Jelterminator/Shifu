import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { registerHeartbeatTask } from '../services/background';
import { anchorsService } from '../services/data/Anchors';
import { phaseManager } from '../services/data/PhaseManager';
import { notificationService } from '../services/notifications/NotificationService';
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

        // 1b. Initialize Storage Fallback (if needed)
        // This acts as a polyfill for MMKV on Expo Go using SQLite as backing store
        await storage.preload(db);

        // 2. Ensure User Identity exists (Self-Healing)
        // CRITICAL FIX: Always verify the user exists in the SQLite DB, even if we have it in the Store.
        // This prevents Foreign Key errors if the DB was cleared but LocalStorage wasn't.
        let currentUser = user;

        if (currentUser?.id) {
          // Verify existence in DB
          const userExists = await db.query('SELECT 1 FROM users WHERE id = ?', [currentUser.id]);
          if (userExists.length === 0) {
            await db.execute(
              'INSERT INTO users (id, timezone, spiritual_practices, created_at) VALUES (?, ?, ?, ?)',
              [
                currentUser.id,
                currentUser.timezone || 'UTC',
                JSON.stringify(currentUser.spiritualPractices || []),
                new Date().toISOString(),
              ]
            );
          }
        } else {
          // No user in Store. Check DB or create new.
          // Check if we have a user in DB (maybe store was cleared but DB persists)
          const users = await db.query<{
            id: string;
            timezone: string;
            spiritual_practices: string;
          }>('SELECT id, timezone, spiritual_practices FROM users LIMIT 1');

          const dbUser = users[0];
          if (dbUser) {
            // Rehydrate store from DB
            let practices: string[] = [];
            try {
              if (dbUser.spiritual_practices) {
                const parsed: unknown = JSON.parse(dbUser.spiritual_practices);
                if (Array.isArray(parsed)) {
                  practices = parsed as string[];
                }
              }
            } catch {
              // silent
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
            // Truly new or broken state -> Create new User
            const newId = uuidv4();
            const defaultTimezone = 'Europe/Amsterdam';

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
          } catch {
            // silent
          }

          // Request Notification Permissions
          try {
            await notificationService.requestPermissions();
          } catch {
            // silent
          }

          // Register background heartbeat task (Android WorkManager / iOS BGTaskScheduler)
          try {
            await registerHeartbeatTask();
          } catch {
            // silent — background tasks may not be available on all devices
          }
        }

        setIsReady(true);
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
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
