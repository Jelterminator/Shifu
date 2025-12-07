import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { SafeAreaView, Text, TextInput, TouchableOpacity } from 'react-native';

import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkHoursSetup'>;

export const WorkHoursSetupScreen: React.FC<Props> = ({ navigation }) => {
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('17:00');

  const handleContinue = () => {
    navigation.navigate('SpiritualPracticesSetup');
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: '#FFFFFF' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>💼 Work Hours</Text>

      <Text style={{ marginBottom: 24, fontSize: 16, color: '#666666' }}>
        What represent your core working hours?
      </Text>

      <Text style={{ marginBottom: 8, fontWeight: '600' }}>Work starts:</Text>
      <TextInput
        placeholder="HH:MM"
        value={workStart}
        onChangeText={setWorkStart}
        style={{
          borderWidth: 1,
          borderColor: '#E0E0E0',
          borderRadius: 8,
          padding: 12,
          marginBottom: 16,
          fontSize: 16,
        }}
      />

      <Text style={{ marginBottom: 8, fontWeight: '600' }}>Work ends:</Text>
      <TextInput
        placeholder="HH:MM"
        value={workEnd}
        onChangeText={setWorkEnd}
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
