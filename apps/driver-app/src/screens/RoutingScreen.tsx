import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MapboxService } from '../services/MapboxService';

export default function RoutingScreen() {
  const [route, setRoute] = useState<any>(null);

  useEffect(() => {
    // Integrate Mapbox with routing screen and dynamic traffic updates
    MapboxService.getOptimizedRoute([0,0], [1,1]).then(setRoute);
  }, []);

  return (
    <View style={styles.container}>
      {route ? (
        <Text style={styles.text}>Navigating... ETA: {route.estimatedDuration}s</Text>
      ) : (
        <Text style={styles.text}>Loading route...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F172A' },
  text: { color: '#F8FAFC', fontSize: 18 }
});
