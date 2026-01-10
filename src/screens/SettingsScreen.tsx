import React from 'react';
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BaseScreen } from '../components/BaseScreen';
import { ConfirmationModal } from '../components/modals/ConfirmationModal';
import { db } from '../db/database';
import { useThemeStore } from '../stores/themeStore';
import { useUserStore } from '../stores/userStore';
import type { RootStackScreenProps } from '../types/navigation';
import { config } from '../utils/config';
import { storage } from '../utils/storage';

export function SettingsScreen({
  navigation,
}: RootStackScreenProps<'Settings'>): React.JSX.Element {
  const { colors } = useThemeStore();
  const clearUser = useUserStore(state => state.clearUser);
  const deviceConnected = useUserStore(state => state.deviceConnected);
  const setDeviceConnected = useUserStore(state => state.setDeviceConnected);

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

  const handleDeviceCalendarSync = async (): Promise<void> => {
    if (Platform.OS === 'web') {
      Alert.alert('Not Available', 'Device calendar sync is only available on mobile devices.');
      return;
    }

    if (deviceConnected) {
      // Disconnect
      setDeviceConnected(false);
      return;
    }

    try {
      const { deviceCalendarSync } = await import('../services/DeviceCalendarSync');
      const granted = await deviceCalendarSync.requestPermissions();

      if (!granted) {
        Alert.alert('Permission Denied', 'Please enable calendar permissions in settings.');
        return;
      }

      const count = await deviceCalendarSync.sync();
      setDeviceConnected(true);
      Alert.alert('Synced', `Successfully synced ${count} events from your device calendar.`);
    } catch (e) {
      console.error('Device calendar sync failed', e);
      const errorMessage = e instanceof Error ? e.message : JSON.stringify(e);
      Alert.alert('Error', `Failed to sync device calendar: ${errorMessage}`);
    }
  };

  return (
    <BaseScreen title="Settings">
      <View style={styles.container}>
        {/* Calendar Sync Section */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Calendar Sync</Text>
          <View style={styles.separator} />

          <View style={styles.syncRow}>
            <Text style={{ color: colors.text, fontSize: 16 }}>Device Calendar</Text>
            <TouchableOpacity
              onPress={() => void handleDeviceCalendarSync()}
              style={[
                styles.syncButton,
                {
                  backgroundColor: deviceConnected ? '#FF3B30' : '#34C759',
                },
              ]}
            >
              <Text style={{ color: '#FFF', fontWeight: '600' }}>
                {deviceConnected ? 'Disconnect' : 'Sync'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Data & Storage Section */}
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
    color: '#FF3B30',
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
    paddingVertical: 8,
  },
  syncButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
});
