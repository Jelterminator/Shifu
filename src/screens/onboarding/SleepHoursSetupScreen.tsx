import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity } from 'react-native';

import { useUserStore } from '../../stores/userStore';
import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'SleepHoursSetup'>;

export const SleepHoursSetupScreen: React.FC<Props> = ({ navigation }) => {
  const [sleepStart, setSleepStart] = useState('22:00');
  const [sleepEnd, setSleepEnd] = useState('06:00');
  const setUser = useUserStore(state => state.setUser);
  const user = useUserStore(state => state.user);

  const handleContinue = (): void => {
    setUser({ ...user, sleepStart, sleepEnd });
    navigation.navigate('SpiritualPracticesSetup');
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: '#FFFFFF' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>🕐 Sleep Hours</Text>

      <Text style={{ marginBottom: 24, fontSize: 16, color: '#666666' }}>
        When do you typically sleep?
      </Text>

      <Text style={{ marginBottom: 8, fontWeight: '600' }}>Sleep starts:</Text>
      <TextInput
        placeholder="HH:MM"
        value={sleepStart}
        onChangeText={setSleepStart}
        style={{
          borderWidth: 1,
          borderColor: '#E0E0E0',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          fontSize: 16,
        }}
      />

      <Text style={{ marginBottom: 8, fontWeight: '600' }}>Sleep ends:</Text>
      <TextInput
        placeholder="HH:MM"
        value={sleepEnd}
        onChangeText={setSleepEnd}
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
