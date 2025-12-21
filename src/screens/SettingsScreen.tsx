import React from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BaseScreen } from '../components/BaseScreen';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';
import { db } from '../db/database';
import { authService } from '../services/AuthService';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import type { RootStackScreenProps } from '../types/navigation';
import { config } from '../utils/config';
import { storage } from '../utils/storage';

import {
  exchangeCodeAsync,
  makeRedirectUri,
  ResponseType,
  useAuthRequest,
} from 'expo-auth-session';
import { authConfig } from '../config/authConfig';

const discovery = {
  authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
};

export function SettingsScreen({
  navigation,
}: RootStackScreenProps<'Settings'>): React.JSX.Element {
  const { colors } = useThemeStore();
  const setMicrosoftConnected = useUserStore(state => state.setMicrosoftConnected);

  // Microsoft Auth Hook
  const [request, response, promptAsync] = useAuthRequest(
    {
      clientId: authConfig.microsoft.clientId,
      scopes: authConfig.microsoft.scopes,
      redirectUri: makeRedirectUri({ scheme: 'shifu', path: 'auth' }),
      responseType: ResponseType.Code,
    },
    discovery
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { code } = response.params;
      void (async () => {
        try {
          const tokenResult = await exchangeCodeAsync(
            {
              clientId: authConfig.microsoft.clientId,
              code: code || '',
              redirectUri: makeRedirectUri({ scheme: 'shifu', path: 'auth' }),
              extraParams: {
                code_verifier: request?.codeVerifier || '',
              },
            },
            discovery
          );

          if (tokenResult.accessToken) {
            // Import dynamically to avoid circular deps or heavy load if not needed?
            // Better to just use the service singleton.
            // We need to ensure we can access the service instance.
            const { microsoftAuthService } = await import('../services/MicrosoftAuthService');
            const { microsoftCalendarSync } =
              await import('../services/sync/MicrosoftCalendarSync');

            microsoftAuthService.setAccessToken(
              tokenResult.accessToken,
              tokenResult.expiresIn || 3600
            );
            setMicrosoftConnected(true);

            // Initial Sync
            await microsoftCalendarSync.sync();
            Alert.alert('Connected', 'Microsoft Calendar connected and synced!');
          }
        } catch (e) {
          console.error('Microsoft Sync Failed', e);
          Alert.alert('Error', 'Failed to connect/sync Microsoft.');
        }
      })();
    }
  }, [response, request?.codeVerifier, setMicrosoftConnected]);

  const clearUser = useUserStore(state => state.clearUser);

  const [confirmConfig, setConfirmConfig] = React.useState<{
    visible: boolean;
    title: string;
    message: string;
    action: () => Promise<void> | void;
    confirmLabel: string;
  }>({
    visible: false,
    title: '',
    message: '',
    action: () => {},
    confirmLabel: 'Confirm',
  });

  const handleResetOnboarding = (): void => {
    setConfirmConfig({
      visible: true,
      title: 'Reset Onboarding',
      message:
        'Are you sure you want to reset the onboarding process? This will clear your setup progress.',
      confirmLabel: 'Reset',
      action: () => {
        storage.delete('onboarding_complete');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Welcome' }],
        });
        setConfirmConfig(prev => ({ ...prev, visible: false }));
      },
    });
  };

  const handleWipeData = (): void => {
    setConfirmConfig({
      visible: true,
      title: 'Wipe Data',
      message:
        'Are you sure you want to wipe ALL data? This includes tasks, habits, journals, and settings. This cannot be undone.',
      confirmLabel: 'Wipe Everything',
      action: async () => {
        try {
          // 1. Clear Database Tables
          await db.transaction(async tx => {
            await tx.runAsync('DELETE FROM journal_segments');
            await tx.runAsync('DELETE FROM journal_entries');
            await tx.runAsync('DELETE FROM plans');
            await tx.runAsync('DELETE FROM appointments');
            await tx.runAsync('DELETE FROM tasks');
            await tx.runAsync('DELETE FROM habits');
            await tx.runAsync('DELETE FROM projects');
          });

          // 2. Clear Local Storage
          storage.clear();

          // 3. Clear User Store
          clearUser();

          // 4. Navigate
          navigation.reset({
            index: 0,
            routes: [{ name: 'Welcome' }],
          });

          setConfirmConfig(prev => ({ ...prev, visible: false }));

          // Optional: Show success alert (info only)
          if (Platform.OS !== 'web') {
            Alert.alert('Data Wiped', 'Application has been reset to factory settings.');
          }
        } catch (e) {
          console.error('Failed to wipe data', e);
          if (Platform.OS !== 'web') {
            Alert.alert('Error', 'Failed to wipe data. Please try again.');
          }
        }
      },
    });
  };

  return (
    <BaseScreen title="Settings">
      <View style={styles.container}>
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Data & Storage</Text>
          <View style={styles.separator} />

          <TouchableOpacity onPress={handleResetOnboarding} style={styles.dangerButton}>
            <Text style={styles.dangerButtonText}>Reset Onboarding</Text>
          </TouchableOpacity>
          <View style={styles.separator} />
          <TouchableOpacity onPress={handleWipeData} style={styles.dangerButton}>
            <Text style={styles.dangerButtonText}>Wipe Data</Text>
          </TouchableOpacity>
        </View>

        {/* Syncronisations Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Syncronisations</Text>
          <View style={styles.separator} />

          <View style={styles.syncRow}>
            <Text style={{ color: colors.text, fontSize: 16 }}>Google Calendar</Text>
            <TouchableOpacity
              onPress={() => {
                void (async () => {
                  const connected = useUserStore.getState().googleConnected;
                  if (connected) {
                    await authService.signOut();
                    useUserStore.getState().setGoogleConnected(false);
                  } else {
                    const result = await authService.signInWithGoogle();
                    if (result.success) {
                      useUserStore.getState().setGoogleConnected(true);
                      // Trigger initial sync
                      try {
                        const { googleCalendarSync } =
                          await import('../services/sync/GoogleCalendarSync');
                        await googleCalendarSync.sync();
                        Alert.alert('Connected', 'Google Calendar connected and synced!');
                      } catch (e) {
                        console.error('Sync failed', e);
                        Alert.alert('Connected', 'Connected, but initial sync failed.');
                      }
                    } else {
                      Alert.alert('Error', 'Failed to connect Google: ' + result.error);
                    }
                  }
                })();
              }}
              style={[
                styles.syncButton,
                {
                  backgroundColor: useUserStore.getState().googleConnected ? '#FF3B30' : '#34C759',
                },
              ]}
            >
              <Text style={{ color: '#FFF', fontWeight: '600' }}>
                {useUserStore(state => state.googleConnected) ? 'Disconnect' : 'Connect'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Microsoft Sync Row */}
          <View style={styles.syncRow}>
            <Text style={{ color: colors.text, fontSize: 16 }}>Microsoft Calendar</Text>
            <TouchableOpacity
              onPress={() => {
                const connected = useUserStore.getState().microsoftConnected;
                if (connected) {
                  useUserStore.getState().setMicrosoftConnected(false);
                } else {
                  if (request) {
                    void promptAsync();
                  } else {
                    Alert.alert(
                      'Configuration Error',
                      'Microsoft Auth request is not ready. Check Client ID.'
                    );
                  }
                }
              }}
              // disabled={!request} // Let user click so we can show error if request is missing
              style={[
                styles.syncButton,
                {
                  backgroundColor: useUserStore.getState().microsoftConnected
                    ? '#FF3B30'
                    : '#34C759',
                  opacity: !request ? 0.5 : 1,
                },
              ]}
            >
              <Text style={{ color: '#FFF', fontWeight: '600' }}>
                {useUserStore(state => state.microsoftConnected) ? 'Disconnect' : 'Connect'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Device Calendar Row */}
          <View style={styles.syncRow}>
            <Text style={{ color: colors.text, fontSize: 16 }}>Device Calendar</Text>
            <TouchableOpacity
              onPress={() => {
                void (async () => {
                  const connected = useUserStore.getState().deviceConnected;
                  if (connected) {
                    // Logic to "disconnect" or stop syncing?
                    // For now, just set state to false
                    useUserStore.getState().setDeviceConnected(false);
                  } else {
                    try {
                      const { deviceCalendarSync } =
                        await import('../services/sync/DeviceCalendarSync');
                      const granted = await deviceCalendarSync.requestPermissions();
                      if (granted) {
                        await deviceCalendarSync.sync();
                        useUserStore.getState().setDeviceConnected(true);
                        Alert.alert('Connected', 'Device Calendar synced!');
                      } else {
                        Alert.alert('Permission Denied', 'Please enable calendar permissions.');
                      }
                    } catch (e) {
                      console.error(e);
                      Alert.alert('Error', 'Failed to sync device calendar.');
                    }
                  }
                })();
              }}
              style={[
                styles.syncButton,
                {
                  backgroundColor: useUserStore.getState().deviceConnected ? '#FF3B30' : '#34C759',
                },
              ]}
            >
              <Text style={{ color: '#FFF', fontWeight: '600' }}>
                {useUserStore(state => state.deviceConnected) ? 'Disconnect' : 'Sync'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          Shifu v{config.appVersion}
        </Text>
      </View>

      <ConfirmationModal
        visible={confirmConfig.visible}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        onConfirm={() => void confirmConfig.action()}
        onCancel={() => setConfirmConfig(prev => ({ ...prev, visible: false }))}
        isDestructive
      />
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 16,
  },
  dangerButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#FF3B30', // System Red
    fontSize: 16,
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
  },
  syncRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  syncButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
