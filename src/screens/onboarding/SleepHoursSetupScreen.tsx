import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeStore } from '../../stores/themeStore';
import { useUserStore } from '../../stores/userStore';
import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'SleepHoursSetup'>;

export const SleepHoursSetupScreen: React.FC<Props> = ({ navigation }) => {
  const [sleepStart, setSleepStart] = useState('22:00');
  const [sleepEnd, setSleepEnd] = useState('06:00');
  const setUser = useUserStore(state => state.setUser);
  const user = useUserStore(state => state.user);
  const colors = useThemeStore(state => state.colors);

  const handleContinue = (): void => {
    setUser({ ...user, sleepStart, sleepEnd });
    navigation.navigate('SpiritualPracticesSetup');
  };

  const inputStyle = {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16, color: colors.text }}>
        🕐 Sleep Hours
      </Text>

      <Text style={{ marginBottom: 24, fontSize: 16, color: colors.textSecondary }}>
        When do you typically sleep?
      </Text>

      <Text style={{ marginBottom: 8, fontWeight: '600', color: colors.text }}>Sleep starts:</Text>
      <TextInput
        placeholder="HH:MM"
        placeholderTextColor={colors.textSecondary}
        value={sleepStart}
        onChangeText={setSleepStart}
        style={inputStyle}
      />

      <Text style={{ marginBottom: 8, fontWeight: '600', color: colors.text }}>Sleep ends:</Text>
      <TextInput
        placeholder="HH:MM"
        placeholderTextColor={colors.textSecondary}
        value={sleepEnd}
        onChangeText={setSleepEnd}
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
