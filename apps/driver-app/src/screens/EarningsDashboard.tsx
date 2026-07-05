import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { EarningsService } from '../services/EarningsService';

export default function EarningsDashboard() {
  const [earnings, setEarnings] = useState<any>(null);

  useEffect(() => {
    EarningsService.getWeeklyEarnings().then(setEarnings);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Earnings Dashboard</Text>
      {earnings ? (
        <View style={styles.card}>
          <Text style={styles.period}>{earnings.period}</Text>
          <Text style={styles.total}>${earnings.total.toFixed(2)}</Text>
          <View style={styles.row}><Text>Base:</Text><Text>${earnings.basePay}</Text></View>
          <View style={styles.row}><Text>Tips:</Text><Text>${earnings.tips}</Text></View>
          <View style={styles.row}><Text>Bonus:</Text><Text>${earnings.bonuses}</Text></View>
        </View>
      ) : (
        <Text>Loading earnings...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#0F172A' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#F8FAFC', marginBottom: 20 },
  card: { backgroundColor: '#1E293B', padding: 20, borderRadius: 12 },
  period: { color: '#94A3B8', marginBottom: 10 },
  total: { fontSize: 36, fontWeight: 'bold', color: '#10B981', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4, color: '#F8FAFC' }
});
