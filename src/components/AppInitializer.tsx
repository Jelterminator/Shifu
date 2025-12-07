import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface Props {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<Props> = ({ children }): React.ReactElement => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('🎬 AppInitializer: Starting (simplified for web)');
    // Just set ready immediately - no complex initialization
    setIsReady(true);
    console.log('✅ AppInitializer: Ready');
  }, []);

  if (!isReady) {
    console.log('⏳ AppInitializer: Loading...');
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A7C59" />
      </View>
    );
  }

  console.log('🎉 AppInitializer: Rendering children');
  return <>{children}</>;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});
