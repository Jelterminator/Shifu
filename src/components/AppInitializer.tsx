import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../db/database';
import { registerHeartbeatTask } from '../services/background';
import { anchorsService } from '../services/data/Anchors';
import { phaseManager } from '../services/data/PhaseManager';
import { notificationService } from '../services/notifications/NotificationService';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import { storage } from '../utils/storage';
import { WuXingEmblem } from './icons/WuXingEmblem';

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

          // Immediately sync the theme store with the correct phase now that
          // phaseManager has been initialized with the real location.
          try {
            const currentPhase = phaseManager.getCurrentPhase();
            useThemeStore.getState().setCurrentPhase(currentPhase);
          } catch {
            // silent — theme will stay at defaults
          }

          // Initialize Anchors Service (Works on Web now via localStorage fallback)
          try {
            anchorsService.initialize(latitude, longitude);
          } catch {
            // silent
          }

          // Initialize Notification Service
          try {
            await notificationService.initialize();
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
        <WuXingEmblem size={160} />
        <Text style={styles.splashText}>S H I F U</Text>
        <ActivityIndicator size="small" color="#4A7C59" style={{ marginTop: 20 }} />
      </View>
    );
  }

  if (initError) {
    return (
      <View style={[styles.container, { padding: 40 }]}>
        <Text style={[styles.splashText, { color: '#E63946', fontSize: 18, letterSpacing: 4 }]}>
          INITIALIZATION ERROR
        </Text>
        <ScrollView style={styles.errorScroll}>
          <Text style={styles.errorTextDetail}>{initError}</Text>
        </ScrollView>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setInitError(null);
            setIsReady(false);
          }}
        >
          <Text style={styles.retryButtonText}>Retry Initialization</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: '#333', marginTop: 10 }]}
          onPress={() => {
            void (async () => {
              try {
                storage.clear();
                // Forcing a reload after clearing storage is often better
                Alert.alert('Purged', 'Local storage has been cleared. Please restart the app.');
              } catch (e) {
                Alert.alert('Error', 'Failed to clear storage');
              }
            })();
          }}
        >
          <Text style={styles.retryButtonText}>Clear Storage & Reset</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#121212',
  },
  splashText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '300',
    letterSpacing: 12,
    marginTop: 30,
    marginLeft: 12, // Offset for letter-spacing
  },
  errorScroll: {
    maxHeight: 200,
    marginVertical: 20,
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 10,
  },
  errorTextDetail: {
    color: '#E63946',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 12,
  },
  retryButton: {
    backgroundColor: '#4A7C59',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
