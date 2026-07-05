import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { Card } from '../../components/ui/Card';
import { Theme } from '../../constants/Theme';
import { apiClient } from '../../api/client';

export default function HistoryScreen() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      // Fetching recent external orders
      const res = await apiClient.get('/Orders/recent?deliveryType=External');
      setOrders(res.data);
    } catch (e) {
      console.error('Failed to fetch recent orders', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const renderItem = ({ item }: { item: any }) => (
    <Card style={styles.orderCard}>
      <View style={styles.row}>
        <Text style={styles.orderNumber}>#{item.orderNumber}</Text>
        <Text style={styles.status}>{item.status}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.details}>رقم الطلب الخارجي: {item.externalOrderId}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.total}>{item.totalAmount} ر.س</Text>
        <Text style={styles.date}>{new Date(item.orderTime).toLocaleString('ar-SA')}</Text>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyText}>لا توجد طلبات حديثة مسجلة</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: Theme.spacing.md,
  },
  orderCard: {
    marginBottom: Theme.spacing.md,
  },
  row: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.xs,
  },
  orderNumber: {
    fontFamily: Theme.typography.fontFamilyBlack,
    fontSize: 18,
    color: Theme.colors.text,
  },
  status: {
    fontFamily: Theme.typography.fontFamilyBold,
    fontSize: 14,
    color: Theme.colors.primary,
  },
  details: {
    fontFamily: Theme.typography.fontFamily,
    fontSize: 14,
    color: '#555',
  },
  total: {
    fontFamily: Theme.typography.fontFamilyBold,
    fontSize: 16,
    color: Theme.colors.success,
  },
  date: {
    fontFamily: Theme.typography.fontFamily,
    fontSize: 12,
    color: '#888',
  },
  emptyText: {
    textAlign: 'center',
    fontFamily: Theme.typography.fontFamily,
    fontSize: 16,
    color: '#888',
    marginTop: Theme.spacing.xl,
  }
});
