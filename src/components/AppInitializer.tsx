import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

interface Props {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<Props> = ({ children }): React.ReactElement => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Just set ready immediately - no complex initialization
    setIsReady(true);
  }, []);

  if (!isReady) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4A7C59" />
      </View>
    );
  }

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
