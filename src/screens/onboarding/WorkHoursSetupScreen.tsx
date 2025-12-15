import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Text, TextInput, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeStore } from '../../stores/themeStore';
import { useUserStore } from '../../stores/userStore';
import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'WorkHoursSetup'>;

export const WorkHoursSetupScreen: React.FC<Props> = ({ navigation }) => {
  const [workStart, setWorkStart] = useState('09:00');
  const [workEnd, setWorkEnd] = useState('17:00');

  const setUser = useUserStore(state => state.setUser);
  const user = useUserStore(state => state.user);
  const colors = useThemeStore(state => state.colors);

  const handleContinue = (): void => {
    setUser({ ...user, workStart, workEnd });
    navigation.navigate('SleepHoursSetup');
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
        💼 Work Hours
      </Text>

      <Text style={{ marginBottom: 24, fontSize: 16, color: colors.textSecondary }}>
        What represent your core working hours?
      </Text>

      <Text style={{ marginBottom: 8, fontWeight: '600', color: colors.text }}>Work starts:</Text>
      <TextInput
        placeholder="HH:MM"
        placeholderTextColor={colors.textSecondary}
        value={workStart}
        onChangeText={setWorkStart}
        style={inputStyle}
      />

      <Text style={{ marginBottom: 8, fontWeight: '600', color: colors.text }}>Work ends:</Text>
      <TextInput
        placeholder="HH:MM"
        placeholderTextColor={colors.textSecondary}
        value={workEnd}
        onChangeText={setWorkEnd}
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
