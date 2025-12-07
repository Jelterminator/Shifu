import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import React from 'react';
import { SafeAreaView, Text, TouchableOpacity } from 'react-native';

import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const handleGetStarted = () => {
    navigation.navigate('LocationSetup');
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#FFFFFF',
      }}
    >
      <Text style={{ fontSize: 32, fontWeight: 'bold', marginBottom: 16 }}>🌿 Shifu</Text>
      <Text style={{ fontSize: 18, marginBottom: 32, textAlign: 'center', color: '#666666' }}>
        AI-Powered Daily Planning Aligned with Natural Rhythms
      </Text>
      <TouchableOpacity
        onPress={handleGetStarted}
        style={{
          backgroundColor: '#4A7C59',
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
