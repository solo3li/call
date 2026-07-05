import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppNavigator from './index';
import { SyncService } from '../database/sync';

export default function App() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // T018: Trigger sync when connection restores
    if (!isOffline) {
      SyncService.syncWithBackend();
    }
  }, [isOffline]);

  return (
    <View style={{ flex: 1 }}>
      {isOffline && (
        <View style={styles.offlineBanner}>
          <Text style={styles.offlineText}>You are offline. Actions will sync later.</Text>
        </View>
      )}
      <AppNavigator />
    </View>
  );
}

const styles = StyleSheet.create({
  offlineBanner: { backgroundColor: '#EF4444', padding: 10, alignItems: 'center' },
  offlineText: { color: '#FFFFFF', fontWeight: 'bold' }
});
