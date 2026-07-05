import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, TouchableOpacity, Linking, Alert, Platform } from 'react-native';
import { TripOrderList } from '../components/TripOrderList';
import { useTripStore } from '../store/useTripStore';
import { calculateETA } from '../utils/routingHelpers';
import { deliveryApi } from '../api';
import { useAuthStore } from '../store';
import { Trip, Order } from '../types/Trip';
import { Map, RefreshCw } from 'lucide-react-native';

export default function TripOverviewScreen() {
  const { activeTrip, setActiveTrip, setEstimatedTime } = useTripStore();
  const driverName = useAuthStore((state) => state.driverName);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadRealTrip = async () => {
    try {
      const response = await deliveryApi.getTrips();
      const myTrips = response.data.filter(
        (t: any) => t.driverName === driverName && t.status !== 'Completed'
      );
      
      if (myTrips.length > 0) {
        const realTrip = myTrips[0];
        const mappedTrip: Trip = {
          id: realTrip.id,
          status: 'IN_PROGRESS',
          estimatedTimeMinutes: 0,
          mapsUrl: realTrip.mapsUrl,
          orders: realTrip.orders.map((o: any) => {
            let lat = o.latitude || 24.7136;
            let lon = o.longitude || 46.6753;
            if (o.customerAddress) {
               const coordsMatch = o.customerAddress.trim().match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
               if (coordsMatch) {
                 lat = parseFloat(coordsMatch[1]);
                 lon = parseFloat(coordsMatch[2]);
               }
            }
            return {
              id: o.id,
              tripId: realTrip.id,
              customerName: o.customerName || 'عميل بدون اسم',
              address: { street: o.customerAddress || 'عنوان غير متوفر', city: '' },
              status: (o.status === 'Completed' || o.status === 'مكتمل') ? 'COMPLETED' : 'PENDING',
              coordinates: { latitude: lat, longitude: lon },
            } as Order;
          })
        };
        setActiveTrip(mappedTrip);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRealTrip();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadRealTrip();
  };

  useEffect(() => {
    if (activeTrip && activeTrip.orders) {
      const eta = calculateETA(activeTrip.orders);
      setEstimatedTime(eta);
    }
  }, [activeTrip?.orders]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  const openGoogleMaps = () => {
    if (activeTrip?.mapsUrl) {
      Linking.openURL(activeTrip.mapsUrl);
    } else {
      Alert.alert('عذراً', 'لا يوجد مسار خريطة متاح لهذه الرحلة.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>تفاصيل الرحلة</Text>
          <Text style={styles.driverNameText}>{driverName}</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshBtnText}>تحديث</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />}
      >
        {activeTrip ? (
          <View style={{ flex: 1 }}>
            <View style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <Text style={styles.tripTitle}>رحلة الحالية</Text>
                <View style={styles.tripBadge}>
                  <Text style={styles.tripBadgeText}>{activeTrip.orders.length} طلبات</Text>
                </View>
              </View>
              <Text style={styles.etaText}>الوقت التقديري للانتهاء: {activeTrip.estimatedTimeMinutes} دقيقة</Text>
            </View>

            <View style={styles.listContainer}>
              <Text style={styles.sectionTitle}>طلبات الرحلة</Text>
              <TripOrderList />
            </View>
          </View>
        ) : (
          <View style={styles.center}>
             <Text style={styles.emptyTitle}>لا توجد رحلة حالياً</Text>
          </View>
        )}
      </ScrollView>
      
      {activeTrip && activeTrip.mapsUrl && (
        <TouchableOpacity style={styles.fab} onPress={openGoogleMaps}>
          <Map size={24} color="#FFFFFF" strokeWidth={2.5} />
          <Text style={styles.fabText}>خريطة الرحلة</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  header: {
    paddingTop: 60, paddingHorizontal: 20, paddingBottom: 15,
    backgroundColor: '#FF6B35', flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    borderBottomWidth: 4, borderBottomColor: '#1A1A1A',
  },
  headerTitle: { fontSize: 24, fontWeight: '900', color: '#1A1A1A' },
  driverNameText: { fontSize: 14, fontWeight: '700', color: '#1A1A1A', opacity: 0.8 },
  refreshBtn: {
    backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 2, borderColor: '#1A1A1A',
    ...Platform.select({ web: { boxShadow: '2px 2px 0px #1A1A1A' }, default: {} }),
  },
  refreshBtnText: { color: '#1A1A1A', fontWeight: '900', fontSize: 14 },
  contentContainer: {
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  tripCard: {
    backgroundColor: '#FFD700',
    padding: 20,
    margin: 20,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    ...Platform.select({ web: { boxShadow: '4px 4px 0px #1A1A1A' }, default: {} }),
  },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tripTitle: { fontSize: 22, fontWeight: '900', color: '#1A1A1A' },
  tripBadge: { backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 4, borderWidth: 2, borderColor: '#1A1A1A' },
  tripBadgeText: { fontSize: 14, fontWeight: '900', color: '#1A1A1A' },
  etaText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 16,
    backgroundColor: '#FFF',
    padding: 10,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    alignSelf: 'flex-start'
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2A5CFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 30,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    gap: 8,
    ...Platform.select({ web: { boxShadow: '4px 4px 0px #1A1A1A' }, default: {} }),
    zIndex: 999,
  },
  fabText: {
    color: '#FFF',
    fontWeight: '900',
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#2A5CFF',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  listContainer: {
    flex: 1,
  }
});
