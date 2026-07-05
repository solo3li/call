import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Order } from '../types/Trip';
import { useTripStore } from '../store/useTripStore';
import { useAuthStore } from '../store';
import { CheckCircle2, MapPin, Navigation, Phone } from 'lucide-react-native';

interface TripOrderCardProps {
  order: Order;
  index: number;
}

export const TripOrderCard: React.FC<TripOrderCardProps> = ({ order, index }) => {
  const [expanded, setExpanded] = useState(false);
  const { updateOrderStatus } = useTripStore();
  const currencySymbol = useAuthStore((state) => state.currencySymbol) || 'ر.س';
  const isCompleted = order.status === 'COMPLETED';

  const toggleStatus = () => {
    updateOrderStatus(order.id, isCompleted ? 'PENDING' : 'COMPLETED');
  };

  return (
    <View style={[styles.card, isCompleted && styles.cardCompleted]}>
      <TouchableOpacity 
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}
      >
        {/* Header */}
        <View style={styles.cardHeaderRow}>
          <View style={styles.orderNumberContainer}>
            <View style={styles.indexCircle}>
              <Text style={styles.indexCircleText}>{index + 1}</Text>
            </View>
            <Text style={styles.orderNumberText}>#{order.id}</Text>
          </View>
          <View style={styles.amountContainer}>
            {isCompleted && (
              <View style={styles.completedBadge}>
                <CheckCircle2 size={12} color="#00E676" />
                <Text style={styles.completedBadgeText}>تم التوصيل</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Body */}
        <View style={styles.cardContent}>
          <Text style={styles.customerName}>{order.customerName}</Text>
          
          <View style={styles.addressRow}>
            <MapPin size={14} color="#666" />
            <Text style={styles.addressText} numberOfLines={expanded ? undefined : 1}>
              {order.address.street}
            </Text>
          </View>

          {expanded && (
            <View style={styles.expandedContent}>
              <View style={styles.divider} />
              <Text style={styles.detailLabel}>العنوان بالتفصيل:</Text>
              <Text style={styles.detailText}>{order.address.street}</Text>
              {order.address.city ? <Text style={styles.detailText}>{order.address.city}</Text> : null}
              {order.address.buildingDetails ? <Text style={styles.detailText}>{order.address.buildingDetails}</Text> : null}
            </View>
          )}
        </View>
      </TouchableOpacity>

      {/* Actions */}
      {expanded && (
        <View style={styles.actionsRow}>
          <TouchableOpacity 
            style={[styles.actionBtnPrimary, isCompleted ? styles.actionBtnRevert : styles.actionBtnComplete]} 
            onPress={toggleStatus}
          >
            <Text style={styles.actionBtnPrimaryText}>
              {isCompleted ? 'التراجع عن التسليم' : 'تأكيد التسليم'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    marginBottom: 15,
    padding: 0,
    ...Platform.select({ web: { boxShadow: '4px 4px 0px #1A1A1A' }, default: {} }),
  },
  cardCompleted: {
    opacity: 0.6,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderBottomWidth: 2,
    borderBottomColor: '#1A1A1A',
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
  cardContent: { padding: 16 },
  customerName: { fontSize: 20, fontWeight: '900', color: '#1A1A1A', marginBottom: 8 },
  addressRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  addressText: { fontSize: 13, fontWeight: '700', color: '#666', flexShrink: 1 },
  expandedContent: { marginTop: 12 },
  divider: { height: 2, backgroundColor: '#1A1A1A', marginVertical: 12 },
  detailLabel: { fontSize: 14, fontWeight: '900', color: '#1A1A1A', marginBottom: 4 },
  detailText: { fontSize: 14, color: '#1A1A1A', marginBottom: 2, fontWeight: '700' },
  actionsRow: {
    flexDirection: 'row', padding: 12, backgroundColor: '#F9FAFB',
    borderTopWidth: 2, borderTopColor: '#1A1A1A', gap: 8
  },
  actionBtnPrimary: {
    flex: 3, alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, borderWidth: 2, borderColor: '#1A1A1A'
  },
  actionBtnComplete: {
    backgroundColor: '#00E676',
  },
  actionBtnRevert: {
    backgroundColor: '#FFD700',
  },
  actionBtnPrimaryText: { color: '#1A1A1A', fontWeight: '900', fontSize: 16 }
});
