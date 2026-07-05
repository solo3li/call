import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { Package, MapPin, CheckCircle2 } from 'lucide-react-native';
import { ordersApi } from '../api';
import { useAuthStore } from '../store';
import { Order } from './OrderDetailScreen';

export default function HistoryScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const currencySymbol = useAuthStore((state) => state.currencySymbol) || 'ر.س';
  const driverName = useAuthStore((state) => state.driverName);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      await fetchOrders(driverName || '');
    } catch (error) {
      console.error(error);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchOrders = async (name: string) => {
    try {
      const response = await ordersApi.getAll();
      const myOrders = response.data.filter(
        (o: Order) =>
          o.driverName === name &&
          o.status === 'Completed'
      );
      // Sort by creation date descending (newest first)
      myOrders.sort((a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      
      setOrders(myOrders);
    } catch (error: any) {
      console.error('Error fetching history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const renderItem = ({ item }: { item: Order }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.orderNumberBadge}>
          <Text style={styles.orderNumberText}>#{item.orderNumber}</Text>
        </View>
        <View style={styles.statusBadge}>
          <CheckCircle2 color="#10B981" size={16} strokeWidth={3} />
          <Text style={styles.statusText}>مكتمل</Text>
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.customerName}>{item.customerName || 'عميل بدون اسم'}</Text>
          <Text style={styles.amountText}>{item.totalAmount} {currencySymbol}</Text>
        </View>
        
        {item.customerAddress && (
          <View style={styles.addressRow}>
            <MapPin size={16} color="#64748b" />
            <Text style={styles.addressText} numberOfLines={1}>
              {item.customerAddress}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>سجل الطلبات</Text>
        <Text style={styles.headerSubtitle}>الطلبات التي تم توصيلها</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerContainer}>
          <Package size={64} color="#CBD5E1" strokeWidth={1.5} />
          <Text style={styles.emptyTitle}>لا توجد طلبات مكتملة</Text>
          <Text style={styles.emptySubtitle}>الطلبات التي تقوم بتوصيلها ستظهر هنا</Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
          refreshing={refreshing}
          onRefresh={onRefresh}
          showsVerticalScrollIndicator={false}
        />
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
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FF6B35',
    borderBottomWidth: 4,
    borderBottomColor: '#1A1A1A',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    textAlign: 'right',
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1A1A1A',
    opacity: 0.8,
    textAlign: 'right',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A1A',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 8,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100, // Room for nav bar
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 0,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    marginBottom: 16,
    ...Platform.select({
      web: { boxShadow: '4px 4px 0px #1A1A1A' },
      default: { elevation: 0 }
    }),
  },
  cardHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FAFAFA',
  },
  orderNumberBadge: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  orderNumberText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  statusText: {
    color: '#10B981',
    fontWeight: '900',
    fontSize: 12,
  },
  cardContent: {
    padding: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  amountText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FF6B35',
  },
  addressRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  addressText: {
    fontSize: 14,
    color: '#64748b',
    flex: 1,
    textAlign: 'right',
    fontWeight: '600',
  },
});
