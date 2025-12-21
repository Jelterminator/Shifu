import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useThemeStore } from '../../stores/themeStore';
import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const colors = useThemeStore(state => state.colors);

  const handleContinue = (): void => {
    navigation.navigate('StartupConfig');
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: colors.background,
      }}
    >
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 16, color: colors.text }}>
        🌿 Shifu
      </Text>
      <Text
        style={{
          fontSize: 18,
          marginBottom: 32,
          textAlign: 'center',
          color: colors.textSecondary,
        }}
      >
        AI-Powered Daily Planning Aligned with Natural Rhythms
      </Text>
      <TouchableOpacity
        onPress={handleContinue}
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 32,
          paddingVertical: 12,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '600' }}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};
