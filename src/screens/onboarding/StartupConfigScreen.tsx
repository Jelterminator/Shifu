import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BaseScreen } from '../../components/BaseScreen';
import { authService } from '../../services/AuthService';
import { useThemeStore } from '../../stores/themeStore';
import { useUserStore } from '../../stores/userStore';
import type { RootStackParamList } from '../../types/navigation';

import {
  exchangeCodeAsync,
  makeRedirectUri,
  ResponseType,
  useAuthRequest,
} from 'expo-auth-session';
import { authConfig } from '../../config/authConfig';
import { microsoftAuthService } from '../../services/MicrosoftAuthService';
// We might want to import the sync service dynamically or just use it if installed
// import { microsoftCalendarSync } from '../../services/sync/MicrosoftCalendarSync';

const discovery = {
  authorizationEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenEndpoint: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
};

type Props = NativeStackScreenProps<RootStackParamList, 'StartupConfig'>;

export function StartupConfigScreen({ navigation }: Props): React.JSX.Element {
  const { colors } = useThemeStore();
  const setGoogleConnected = useUserStore(state => state.setGoogleConnected);
  const setMicrosoftConnected = useUserStore(state => state.setMicrosoftConnected);
  const [loading, setLoading] = React.useState(false);

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

  React.useEffect((): void => {
    if (response?.type === 'success') {
      const { code } = response.params;

      const exchangeToken = async (): Promise<void> => {
        try {
          const tokenResult = await exchangeCodeAsync(
            {
              clientId: authConfig.microsoft.clientId,
              code: code || '',
              redirectUri: makeRedirectUri({ scheme: 'shifu', path: 'auth' }),
              extraParams: {
                // Microsoft-specific: PKCE is handled by default in recent versions,
                // but sometimes scope is needed again.
                code_verifier: request?.codeVerifier || '',
              },
            },
            discovery
          );

          if (tokenResult.accessToken) {
            microsoftAuthService.setAccessToken(
              tokenResult.accessToken,
              tokenResult.expiresIn || 3600
            );
            setMicrosoftConnected(true);

            // Trigger sync
            try {
              const { microsoftCalendarSync } =
                await import('../../services/sync/MicrosoftCalendarSync');
              await microsoftCalendarSync.sync();
              Alert.alert('Success', 'Microsoft Calendar connected and synced!');
            } catch (syncError: unknown) {
              const errorMessage = syncError instanceof Error ? syncError.message : String(syncError);
              console.error('Sync error', syncError);
              Alert.alert('Connected', `Connected, but initial sync failed: ${errorMessage}`);
            }
          }
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error('Token Exchange Failed', error);
          Alert.alert('Error', `Failed to connect to Microsoft: ${errorMessage}`);
        }
      };

      void exchangeToken();
    }
  }, [response, request?.codeVerifier, setMicrosoftConnected]);

  const handleGoogleSignIn = async (): Promise<void> => {
    setLoading(true);
    const result = await authService.signInWithGoogle();
    setLoading(false);

    if (result.success) {
      setGoogleConnected(true);
      // Trigger sync
      try {
        const { googleCalendarSync } = await import('../../services/sync/GoogleCalendarSync');
        await googleCalendarSync.sync();
        Alert.alert('Success', 'Google Calendar connected and synced!');
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : String(e);
        console.error('Sync failed', e);
        Alert.alert('Error', `Google Sync failed: ${errorMessage}`);
      }
    } else {
      console.error('Google Sign in failed', result.error);
      Alert.alert('Error', result.error || 'Google Sign-In Failed');
    }
  };

  const handleContinue = (): void => {
    navigation.navigate('LocationSetup');
  };

  return (
    <BaseScreen title="Setup">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>Connect Your Life</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Sync your calendars to get the most out of Shifu.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          {/* Google */}
          <TouchableOpacity
            style={[styles.connectButton, { backgroundColor: colors.surface }]}
            onPress={() => {
              void handleGoogleSignIn();
            }}
            disabled={loading}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Connect Google</Text>
          </TouchableOpacity>

          {/* Microsoft */}
          <TouchableOpacity
            style={[styles.connectButton, { backgroundColor: colors.surface }]}
            onPress={() => {
              if (request) void promptAsync();
              else Alert.alert('Error', 'Microsoft Auth not initialized');
            }}
            // disabled={!request}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Connect Microsoft</Text>
          </TouchableOpacity>

          {/* Device Calendar */}
          <TouchableOpacity
            style={[styles.connectButton, { backgroundColor: colors.surface }]}
            onPress={() => {
              void (async () => {
                try {
                  const { deviceCalendarSync } =
                    await import('../../services/sync/DeviceCalendarSync');
                  const granted = await deviceCalendarSync.requestPermissions();
                  if (granted) {
                    await deviceCalendarSync.sync();

                    // Update store
                    useUserStore.getState().setDeviceConnected(true);

                    Alert.alert('Success', 'Device Calendar synced!');
                  } else {
                    Alert.alert(
                      'Permission Denied',
                      'Please enable calendar permissions in settings.'
                    );
                  }
                } catch (e: unknown) {
                  const errorMessage = e instanceof Error ? e.message : String(e);
                  console.error('Device sync failed', e);
                  Alert.alert('Error', `Failed to sync device calendar: ${errorMessage}`);
                }
              })();
            }}
          >
            <Text style={[styles.buttonText, { color: colors.text }]}>Sync Device Calendar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          onPress={handleContinue}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </BaseScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  header: {
    marginTop: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    gap: 16,
  },
  connectButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    padding: 16,
    borderRadius: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  continueText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
