import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  RefreshControl,
  Platform,
  ScrollView,
} from 'react-native';
import {
  Navigation,
  Phone,
  CheckCircle2,
  MapPin,
  Truck,
  Map,
} from 'lucide-react-native';
import { deliveryApi, ordersApi } from '../api';
import { useAuthStore } from '../store';
import OrderDetailScreen from './OrderDetailScreen';

export interface SuggestedOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerAddress?: string;
  customerPhone?: string;
  latitude?: number;
  longitude?: number;
  totalAmount: number;
  status: string;
}

export interface DeliveryTrip {
  id: string;
  tripNumber: string;
  driverName: string;
  status: string;
  orders: SuggestedOrderItem[];
  mapsUrl?: string;
}

export default function OrdersScreen() {
  const [trips, setTrips] = useState<DeliveryTrip[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<SuggestedOrderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const currencySymbol = useAuthStore((state) => state.currencySymbol) || 'ر.س';
  const driverName = useAuthStore((state) => state.driverName);

  useEffect(() => {
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      await fetchTrips(driverName || '');
    } catch (error) {
      console.error(error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchTrips = async (name: string) => {
    try {
      const response = await deliveryApi.getTrips();
      const myTrips = response.data.filter(
        (t: DeliveryTrip) => t.driverName === name && t.status !== 'Completed'
      );
      setTrips(myTrips);
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        Alert.alert('Offline Mode', 'Network error. Showing mock data.');
        setTrips([
          {
            id: 'mock-trip-1',
            tripNumber: 'TRIP-1001',
            driverName: name,
            status: 'InProgress',
            mapsUrl: 'https://maps.google.com/?q=24.7136,46.6753',
            orders: [
              {
                id: 'mock-1',
                orderNumber: 'ORD-2938',
                customerName: 'Mohammed Ahmed',
                customerPhone: '0501234567',
                totalAmount: 145,
                status: 'Ready',
                customerAddress: 'Riyadh, King Fahd Road',
              },
              {
                id: 'mock-2',
                orderNumber: 'ORD-2940',
                customerName: 'Sarah Khalid',
                customerPhone: '0507654321',
                totalAmount: 85,
                status: 'Ready',
                customerAddress: 'Riyadh, Olaya Street',
              },
            ],
          }
        ]);
      } else {
        Alert.alert('Error', 'Failed to fetch trips.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrips(driverName || '');
  };

  const completeOrder = async (orderId: string, tripId: string, orders: SuggestedOrderItem[]) => {
    Alert.alert(
      'تأكيد استلام وتوصيل الطلب',
      'هل تم توصيل الطلب للعميل واستلام المبلغ؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'نعم، تم التوصيل',
          onPress: async () => {
            try {
              await ordersApi.updateStatus(orderId, 'Completed');
              
              // Check if this was the last pending order in the trip
              const pendingOrders = orders.filter(o => o.id !== orderId && o.status !== 'Completed' && o.status !== 'مكتمل');
              if (pendingOrders.length === 0) {
                await deliveryApi.updateTripStatus(tripId, 'Completed');
                Alert.alert('عمل رائع!', 'لقد أتممت جميع طلبات هذه الرحلة بنجاح.');
              }
              
              fetchTrips(driverName || '');
            } catch (error: any) {
              Alert.alert('Error', error.response?.data?.message || 'فشل تحديث حالة الطلب');
            }
          },
        },
      ]
    );
  };

  const openGoogleMaps = (url?: string) => {
    if (url) {
      Linking.openURL(url);
    } else {
      Alert.alert('خطأ', 'الرابط غير متوفر.');
    }
  };

  const openAddress = (address?: string) => {
    if (!address) return;
    const coordsMatch = address.trim().match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    let mapsUrl = '';
    if (coordsMatch) {
      mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${coordsMatch[1]},${coordsMatch[2]}&travelmode=driving`;
    } else {
      mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`;
    }
    Linking.openURL(mapsUrl);
  };

  const callCustomer = (phone?: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    } else {
      Alert.alert('خطأ', 'رقم العميل غير متوفر.');
    }
  };

  const activeTrip = trips[0];

  const renderOrder = ({ item, index }: { item: SuggestedOrderItem; index: number }) => {
    const isCompleted = item.status === 'Completed' || item.status === 'مكتمل';
    
    return (
      <TouchableOpacity 
        style={[styles.card, isCompleted && styles.cardCompleted]}
        activeOpacity={0.8}
        onPress={() => setSelectedOrder(item)}
      >
        {/* Header */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.orderNumberContainer}>
            <View style={styles.indexCircle}>
              <Text style={styles.indexCircleText}>{index + 1}</Text>
            </View>
            <Text style={styles.orderNumberText}>#{item.orderNumber}</Text>
          </View>
          <View style={styles.amountContainer}>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <CheckCircle2 size={12} color="#00E676" />
                <Text style={styles.completedBadgeText}>تم التوصيل</Text>
              </View>
            )}
            <Text style={styles.amountText}>{item.totalAmount} {currencySymbol}</Text>
          </View>
        </View>

        {/* Body */}
        <View style={styles.cardContent}>
          <Text style={styles.customerName}>{item.customerName || 'عميل بدون اسم'}</Text>
          {item.customerAddress && (
            <View style={styles.addressRow}>
              <MapPin size={14} color="#666" />
              <Text style={styles.addressText}>{item.customerAddress}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {!isCompleted && (
          <View style={styles.actionsRow}>
            <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => callCustomer(item.customerPhone)}>
              <Phone size={18} color="#1A1A1A" strokeWidth={2.5} />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionBtnSecondary} onPress={() => openAddress(item.customerAddress)}>
              <Navigation size={18} color="#1A1A1A" strokeWidth={2.5} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtnPrimary} onPress={(e) => { e.stopPropagation(); completeOrder(item.id, activeTrip.id, activeTrip.orders); }}>
              <Text style={styles.actionBtnPrimaryText}>تأكيد التسليم</Text>
            </TouchableOpacity>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (selectedOrder && activeTrip) {
    return (
      <OrderDetailScreen 
        order={selectedOrder as any} 
        onBack={() => setSelectedOrder(null)} 
        onComplete={(id) => {
          completeOrder(id, activeTrip.id, activeTrip.orders);
          setSelectedOrder(null);
        }} 
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>رحلتي</Text>
          <Text style={styles.driverNameText}>{driverName}</Text>
        </View>
        <TouchableOpacity style={styles.refreshBtn} onPress={onRefresh}>
          <Text style={styles.refreshBtnText}>تحديث</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : !activeTrip ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <Truck size={48} color="#1A1A1A" strokeWidth={3} />
          </View>
          <Text style={styles.emptyTitle}>لا يوجد رحلات حالياً!</Text>
          <Text style={styles.emptySubtitle}>أنت في وضع الاستعداد.</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView 
            style={styles.contentContainer}
            contentContainerStyle={{ paddingBottom: 100 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6B35" />}
          >
            <View style={styles.tripCard}>
              <View style={styles.tripHeader}>
                <Text style={styles.tripTitle}>{activeTrip.tripNumber}</Text>
                <View style={styles.tripBadge}>
                  <Text style={styles.tripBadgeText}>{activeTrip.orders.length} طلبات</Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>محطات التوصيل</Text>

            <View style={styles.listContent}>
              {activeTrip.orders.map((item, index) => renderOrder({ item, index }))}
            </View>
          </ScrollView>
          
          {activeTrip.mapsUrl && (
            <TouchableOpacity style={styles.fab} onPress={() => openGoogleMaps(activeTrip.mapsUrl)}>
              <Map size={24} color="#FFFFFF" strokeWidth={2.5} />
              <Text style={styles.fabText}>خريطة الرحلة</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFBEB' },
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyIconContainer: {
    width: 96, height: 96, backgroundColor: '#FFD700',
    borderWidth: 3, borderColor: '#1A1A1A', alignItems: 'center',
    justifyContent: 'center', marginBottom: 24,
  },
  emptyTitle: { fontSize: 28, fontWeight: '900', color: '#1A1A1A', marginBottom: 12 },
  emptySubtitle: { fontSize: 16, fontWeight: '700', color: '#666' },
  contentContainer: { flex: 1 },
  tripCard: {
    backgroundColor: '#FFD700', padding: 20, margin: 20,
    borderWidth: 3, borderColor: '#1A1A1A',
    ...Platform.select({ web: { boxShadow: '4px 4px 0px #1A1A1A' }, default: {} }),
  },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tripTitle: { fontSize: 22, fontWeight: '900', color: '#1A1A1A' },
  tripBadge: { backgroundColor: '#FFFFFF', paddingHorizontal: 10, paddingVertical: 4, borderWidth: 2, borderColor: '#1A1A1A' },
  tripBadgeText: { fontSize: 14, fontWeight: '900', color: '#1A1A1A' },
  mapsBtn: {
    backgroundColor: '#2A5CFF', padding: 14, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: 10, borderWidth: 3, borderColor: '#1A1A1A',
  },
  mapsBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  sectionTitle: { fontSize: 18, fontWeight: '900', color: '#2A5CFF', marginHorizontal: 20, marginBottom: 10 },
  listContent: { paddingHorizontal: 20, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFFFFF', borderWidth: 3, borderColor: '#1A1A1A',
    marginBottom: 15, padding: 0,
    ...Platform.select({ web: { boxShadow: '4px 4px 0px #1A1A1A' }, default: {} }),
  },
  cardCompleted: { opacity: 0.6 },
  cardHeaderRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F3F4F6', padding: 12, borderBottomWidth: 2, borderBottomColor: '#1A1A1A',
  },
  orderNumberContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  indexCircle: {
    width: 24, height: 24, borderRadius: 12, backgroundColor: '#2A5CFF',
    alignItems: 'center', justifyContent: 'center'
  },
  indexCircleText: { color: '#FFF', fontWeight: '900', fontSize: 12 },
  orderNumberText: { fontSize: 16, fontWeight: '900', color: '#1A1A1A' },
  amountContainer: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  completedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  completedBadgeText: { color: '#00E676', fontWeight: '900', fontSize: 10 },
  amountText: { fontSize: 16, fontWeight: '900', color: '#1A1A1A', backgroundColor: '#FFF', paddingHorizontal: 6, paddingVertical: 2, borderWidth: 1, borderColor: '#1A1A1A' },
  cardContent: { padding: 16 },
  customerName: { fontSize: 20, fontWeight: '900', color: '#1A1A1A', marginBottom: 8 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addressText: { fontSize: 13, fontWeight: '700', color: '#666', flexShrink: 1 },
  actionsRow: {
    flexDirection: 'row', padding: 12, backgroundColor: '#F9FAFB',
    borderTopWidth: 2, borderTopColor: '#1A1A1A', gap: 8
  },
  actionBtnSecondary: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#FFFFFF', paddingVertical: 10, borderWidth: 2, borderColor: '#1A1A1A'
  },
  actionBtnPrimary: {
    flex: 3, alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#00E676', paddingVertical: 10, borderWidth: 2, borderColor: '#1A1A1A'
  },
  actionBtnPrimaryText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
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
  }
});
