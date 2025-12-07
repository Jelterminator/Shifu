import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import React, { useState } from 'react';
import { Alert, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  const setUser = useUserStore((state) => state.setUser);
  const user = useUserStore((state) => state.user);

  const handleDetectLocation = async () => {
    setLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
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

      navigation.navigate('SleepHoursSetup');
    } catch (error) {
      console.error('Location detection failed:', error);
      Alert.alert('Error', 'Failed to detect location. Please enter manually below.');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
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

    navigation.navigate('SleepHoursSetup');
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: '#FFFFFF' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>📍 Your Location</Text>

      <Text style={{ marginBottom: 24, fontSize: 16, color: '#666666' }}>
        We need your location to calculate solar phases and prayer times.
      </Text>

      <TouchableOpacity
        onPress={handleDetectLocation}
        disabled={loading}
        style={{
          backgroundColor: '#457B9D',
          padding: 16,
          borderRadius: 8,
          marginBottom: 24,
        }}
      >
        <Text style={{ color: '#FFFFFF', textAlign: 'center', fontSize: 16, fontWeight: '600' }}>
          {loading ? 'Detecting...' : 'Detect Automatically'}
        </Text>
      </TouchableOpacity>

      <Text style={{ marginBottom: 8, fontWeight: '600' }}>Or enter manually:</Text>
      
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ marginBottom: 4, fontSize: 12, color: '#666' }}>Latitude</Text>
          <TextInput
            placeholder="e.g. 52.3"
            value={manualLat}
            onChangeText={setManualLat}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: '#E0E0E0',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
            }}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ marginBottom: 4, fontSize: 12, color: '#666' }}>Longitude</Text>
          <TextInput
            placeholder="e.g. 4.9"
            value={manualLong}
            onChangeText={setManualLong}
            keyboardType="numeric"
            style={{
              borderWidth: 1,
              borderColor: '#E0E0E0',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
            }}
          />
        </View>
      </View>

      <Text style={{ marginBottom: 8, fontWeight: '600' }}>City (Optional)</Text>
      <TextInput
        placeholder="City Name"
        value={city}
        onChangeText={setCity}
        style={{
          borderWidth: 1,
          borderColor: '#E0E0E0',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          fontSize: 16,
        }}
      />

      <Text style={{ marginBottom: 8, fontWeight: '600' }}>Timezone:</Text>
      <TextInput
        value={timezone}
        onChangeText={setTimezone}
        placeholder="e.g. Europe/Amsterdam"
        style={{
          borderWidth: 1,
          borderColor: '#E0E0E0',
          borderRadius: 8,
          padding: 12,
          marginBottom: 32,
          fontSize: 16,
        }}
      />

      <TouchableOpacity
        onPress={handleContinue}
        style={{
          backgroundColor: '#4A7C59',
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
