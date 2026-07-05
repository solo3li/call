import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TrendingUp, CheckCircle, Star, MapPin } from 'lucide-react-native';
import { useAuthStore } from '../store';
import { ordersApi } from '../api';

export default function DashboardScreen() {
  const driverName = useAuthStore((state) => state.driverName);
  const currencySymbol = useAuthStore((state) => state.currencySymbol) || 'ر.س';

  const [earnings, setEarnings] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [driverName]);

  const fetchStats = async () => {
    if (!driverName) return;
    try {
      const response = await ordersApi.getAll();
      const myOrders = response.data.filter((o: any) => o.driverName === driverName && (o.status === 'Completed' || o.status === 'مكتمل'));
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let todayEarnings = 0;
      let todayCount = 0;

      for (const order of myOrders) {
        const orderDate = new Date(order.createdAt || 0);
        if (orderDate >= today) {
          todayEarnings += order.totalAmount || 0;
          todayCount++;
        }
      }

      setEarnings(todayEarnings);
      setDeliveredCount(todayCount);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>صباح الخير،</Text>
        <Text style={styles.name}>{driverName || 'المندوب'}!</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: '#FFD700' }]}>
            <TrendingUp color="#1A1A1A" size={24} strokeWidth={3} />
          </View>
          {loading ? <ActivityIndicator color="#1A1A1A" /> : <Text style={styles.statValue}>{earnings.toFixed(2)} {currencySymbol}</Text>}
          <Text style={styles.statLabel}>أرباح اليوم</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: '#00E676' }]}>
            <CheckCircle color="#1A1A1A" size={24} strokeWidth={3} />
          </View>
          {loading ? <ActivityIndicator color="#1A1A1A" /> : <Text style={styles.statValue}>{deliveredCount}</Text>}
          <Text style={styles.statLabel}>تم التوصيل</Text>
        </View>

        <View style={styles.statCard}>
          <View style={[styles.iconBox, { backgroundColor: '#FF6B35' }]}>
            <Star color="#1A1A1A" size={24} strokeWidth={3} />
          </View>
          <Text style={styles.statValue}>4.9</Text>
          <Text style={styles.statLabel}>التقييم</Text>
        </View>
      </View>

      <View style={styles.statusSection}>
        <Text style={styles.sectionTitle}>الحالة الحالية</Text>
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={styles.statusIndicator} />
            <Text style={styles.statusText}>متاح وجاهز</Text>
          </View>
          <Text style={styles.statusSubtext}>أنت متصل وتتلقى طلبات جديدة من الفرع.</Text>
          
          <TouchableOpacity style={styles.actionButton}>
            <MapPin color="#1A1A1A" size={20} strokeWidth={3} />
            <Text style={styles.actionButtonText}>فتح خريطة التغطية</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 4,
    borderBottomColor: '#1A1A1A',
  },
  greeting: {
    fontSize: 20,
    color: '#1A1A1A',
    fontWeight: '700',
    marginBottom: 4,
  },
  name: {
    fontSize: 32,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 20,
    gap: 16,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    ...Platform.select({
      web: { boxShadow: '4px 4px 0px #1A1A1A' },
      default: { elevation: 0 }
    }),
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '700',
  },
  statusSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  statusCard: {
    backgroundColor: '#FFD700',
    padding: 24,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    ...Platform.select({
      web: { boxShadow: '6px 6px 0px #1A1A1A' },
      default: { elevation: 0 }
    }),
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  statusIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#00E676',
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  statusText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  statusSubtext: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    ...Platform.select({
      web: { boxShadow: '3px 3px 0px #1A1A1A' },
      default: { elevation: 0 }
    }),
  },
  actionButtonText: {
    color: '#1A1A1A',
    fontWeight: '900',
    fontSize: 16,
  }
});
