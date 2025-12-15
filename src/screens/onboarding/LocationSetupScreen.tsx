import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeStore } from '../../stores/themeStore';
import { useUserStore } from '../../stores/userStore';
import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'LocationSetup'>;

export const LocationSetupScreen: React.FC<Props> = ({ navigation }) => {
  const [city, setCity] = useState('');
  const [manualLat, setManualLat] = useState('');
  const [manualLong, setManualLong] = useState('');
  const [timezone, setTimezone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Amsterdam'
  );
  const [loading, setLoading] = useState(false);
  const setUser = useUserStore(state => state.setUser);
  const user = useUserStore(state => state.user);
  const colors = useThemeStore(state => state.colors);

  const handleDetectLocation = async (): Promise<void> => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== Location.PermissionStatus.GRANTED) {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Update store
      setUser({
        ...user,
        latitude,
        longitude,
        timezone,
      });

      navigation.navigate('WorkHoursSetup');
    } catch (error) {
      console.error('Location detection failed:', error);
      Alert.alert('Error', 'Failed to detect location. Please enter manually below.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = (): void => {
    if (!timezone) {
      Alert.alert('Validation', 'Please enter a timezone');
      return;
    }

    // Parse manual lat/long if provided
    let latitude = user.latitude;
    let longitude = user.longitude;

    if (manualLat && manualLong) {
      const lat = parseFloat(manualLat);
      const long = parseFloat(manualLong);
      if (!isNaN(lat) && !isNaN(long)) {
        latitude = lat;
        longitude = long;
      }
    }

    // Default to defaults if still missing (last resort, though we ideally want user input)
    // We won't block if they are missing, but LoadingSetupScreen will use defaults.

    setUser({
      ...user,
      latitude,
      longitude,
      timezone,
    });

    navigation.navigate('WorkHoursSetup');
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: colors.text }}>
        📍 Your Location
      </Text>

      <Text style={{ marginBottom: 24, fontSize: 16, color: colors.textSecondary }}>
        We need your location to calculate solar phases and prayer times.
      </Text>

      <TouchableOpacity
        onPress={() => void handleDetectLocation()}
        disabled={loading}
        style={{
          backgroundColor: colors.primary,
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 16, fontWeight: '600' }}>
          {loading ? 'Detecting...' : 'Detect Automatically'}
        </Text>
      </TouchableOpacity>

      <Text style={{ marginBottom: 8, fontWeight: '600', color: colors.text }}>
        Or enter manually:
      </Text>

      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ marginBottom: 4, fontSize: 12, color: colors.textSecondary }}>
            Latitude
          </Text>
          <TextInput
            placeholder="e.g. 52.3"
            placeholderTextColor={colors.textSecondary}
            value={manualLat}
            onChangeText={setManualLat}
            keyboardType="numeric"
            style={inputStyle}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ marginBottom: 4, fontSize: 12, color: colors.textSecondary }}>
            Longitude
          </Text>
          <TextInput
            placeholder="e.g. 4.9"
            placeholderTextColor={colors.textSecondary}
            value={manualLong}
            onChangeText={setManualLong}
            keyboardType="numeric"
            style={inputStyle}
          />
        </View>
      </View>

      <Text style={{ marginBottom: 8, fontWeight: '600', color: colors.text }}>
        City (Optional)
      </Text>
      <TextInput
        placeholder="City Name"
        placeholderTextColor={colors.textSecondary}
        value={city}
        onChangeText={setCity}
        style={{
          ...inputStyle,
          marginBottom: 16,
        }}
      />

      <Text style={{ marginBottom: 8, fontWeight: '600', color: colors.text }}>Timezone:</Text>
      <TextInput
        value={timezone}
        onChangeText={setTimezone}
        placeholder="e.g. Europe/Amsterdam"
        placeholderTextColor={colors.textSecondary}
        style={{
          ...inputStyle,
          marginBottom: 32,
        }}
      />

      <TouchableOpacity
        onPress={handleContinue}
        style={{
          backgroundColor: colors.primary,
          padding: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '600', fontSize: 16 }}>
          Continue →
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
