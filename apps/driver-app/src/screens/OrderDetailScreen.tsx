import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  ScrollView,
  Platform,
} from 'react-native';
import {
  ArrowRight,
  MapPin,
  Phone,
  Navigation,
  CheckCircle2,
  Package,
  DollarSign,
  User,
  Truck,
} from 'lucide-react-native';
import { useAuthStore } from '../store';
export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: string;
  orderType: string;
  driverName?: string;
  customerAddress?: string;
  deliveryCost?: number;
  itemsSummary?: string;
}

interface Props {
  order: Order;
  onBack: () => void;
  onComplete: (id: string) => void;
}

// Maps are imported from MapComponent

/**
 * Detect whether an address string looks like raw coordinates.
 * Accepts formats: "24.7136,46.6753" or "24.7136, 46.6753"
 */
function parseCoordinates(address: string): { lat: number; lng: number } | null {
  const trimmed = address.trim();
  const match = trimmed.match(/^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { lat, lng };
    }
  }
  return null;
}

/**
 * Build a Google Maps driving navigation URL.
 * Tries to get the driver's current position via navigator.geolocation (works on web).
 */
function buildMapsUrl(address: string): Promise<string> {
  const coords = parseCoordinates(address);
  const destination = coords
    ? `${coords.lat},${coords.lng}`
    : encodeURIComponent(address);

  const base = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving&dir_action=navigate`;

  return new Promise((resolve) => {
    if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve(`${base}&origin=${latitude},${longitude}`);
        },
        () => {
          // Permission denied or unavailable – open without origin
          resolve(base);
        },
        { timeout: 5000 }
      );
    } else {
      resolve(base);
    }
  });
}

export default function OrderDetailScreen({ order, onBack, onComplete }: Props) {
  const currencySymbol = useAuthStore((state) => state.currencySymbol) || 'ر.س';
  const hasAddress = !!order.customerAddress;
  const coords = order.customerAddress ? parseCoordinates(order.customerAddress) : null;

  const handleOpenMaps = async () => {
    if (!hasAddress) {
      Alert.alert('خطأ', 'لا يوجد عنوان متاح لهذا الطلب.');
      return;
    }

    if (Platform.OS !== 'web' && coords) {
      // Native: prefer geo URI so native apps handle the intent
      const geoUrl = `geo:${coords.lat},${coords.lng}?q=${coords.lat},${coords.lng}`;
      const canOpen = await Linking.canOpenURL(geoUrl);
      if (canOpen) {
        Linking.openURL(geoUrl);
        return;
      }
    }

    // Fallback (web & native without geo handler): full Google Maps URL
    const url = await buildMapsUrl(order.customerAddress!);
    Linking.openURL(url);
  };

  const handleCall = () => {
    Linking.openURL(`tel:${order.customerPhone}`);
  };

  const handleComplete = () => {
    Alert.alert(
      'تأكيد إنهاء الطلب',
      'هل قمت بتوصيل الطلب واستلام المبلغ بنجاح؟',
      [
        { text: 'إلغاء', style: 'cancel' },
        {
          text: 'نعم، تم التوصيل',
          onPress: () => onComplete(order.id),
        },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      {/* ── Header ─────────────────────────────────────────────── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={onBack} activeOpacity={0.8}>
          <ArrowRight size={22} color="#1A1A1A" strokeWidth={3} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>تفاصيل الطلب</Text>
        <View style={styles.orderBadge}>
          <Text style={styles.orderBadgeText}>#{order.orderNumber}</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Map Preview ──────────────────────────────────────── */}
        <View style={styles.mapContainer}>
          <TouchableOpacity 
            style={styles.mapPlaceholder} 
            activeOpacity={0.8}
            onPress={handleOpenMaps}
          >
            <MapPin color="#FF6B35" size={52} strokeWidth={2.5} />
            <Text style={styles.mapPlaceholderText}>
              {hasAddress ? order.customerAddress : 'لا يوجد عنوان متاح'}
            </Text>
            <Text style={styles.mapPlaceholderSub}>
              {hasAddress ? 'اضغط لفتح الخريطة (Google Maps)' : 'لا يمكن بدء التوجيه'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── Info Cards ──────────────────────────────────────── */}
        <View style={styles.infoSection}>

          {/* Customer Name */}
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <User size={20} color="#1A1A1A" strokeWidth={3} />
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>اسم العميل</Text>
              <Text style={styles.infoValue}>{order.customerName || 'عميل بدون اسم'}</Text>
            </View>
          </View>

          {/* Phone */}
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <Phone size={20} color="#1A1A1A" strokeWidth={3} />
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>رقم الهاتف</Text>
              <Text style={styles.infoValue}>{order.customerPhone}</Text>
            </View>
          </View>

          {/* Address */}
          <View style={styles.infoCard}>
            <View style={styles.infoIcon}>
              <MapPin size={20} color="#1A1A1A" strokeWidth={3} />
            </View>
            <View style={styles.infoBody}>
              <Text style={styles.infoLabel}>العنوان</Text>
              <Text style={styles.infoValue}>
                {order.customerAddress || 'لا يوجد عنوان متاح'}
              </Text>
            </View>
          </View>

          {/* Items Summary */}
          {!!order.itemsSummary && (
            <View style={styles.infoCard}>
              <View style={styles.infoIcon}>
                <Package size={20} color="#1A1A1A" strokeWidth={3} />
              </View>
              <View style={styles.infoBody}>
                <Text style={styles.infoLabel}>محتويات الطلب</Text>
                <Text style={styles.infoValue}>{order.itemsSummary}</Text>
              </View>
            </View>
          )}

          {/* Totals row */}
          <View style={styles.totalsRow}>
            <View style={[styles.totalCard, { backgroundColor: '#FFD700' }]}>
              <DollarSign size={18} color="#1A1A1A" strokeWidth={3} />
              <Text style={styles.totalLabel}>إجمالي الطلب</Text>
              <Text style={styles.totalValue}>{order.totalAmount} {currencySymbol}</Text>
            </View>
            {order.deliveryCost !== undefined && (
              <View style={[styles.totalCard, { backgroundColor: '#FF6B35' }]}>
                <Truck size={18} color="#1A1A1A" strokeWidth={3} />
                <Text style={styles.totalLabel}>رسوم التوصيل</Text>
                <Text style={styles.totalValue}>{order.deliveryCost} {currencySymbol}</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Action Buttons ──────────────────────────────────── */}
        <View style={styles.actionsSection}>

          {/* Open in Maps */}
          <TouchableOpacity
            style={[styles.actionBtn, !hasAddress && styles.actionBtnDisabled]}
            onPress={handleOpenMaps}
            disabled={!hasAddress}
            activeOpacity={0.8}
          >
            <Navigation size={22} color="#1A1A1A" strokeWidth={2.5} />
            <Text style={styles.actionBtnText}>فتح في خرائط جوجل</Text>
          </TouchableOpacity>

          {/* Call Customer */}
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#00E6F6' }]}
            onPress={handleCall}
            activeOpacity={0.8}
          >
            <Phone size={22} color="#1A1A1A" strokeWidth={2.5} />
            <Text style={styles.actionBtnText}>الاتصال بالعميل</Text>
          </TouchableOpacity>

          {/* Complete Delivery */}
          <TouchableOpacity
            style={styles.completeBtn}
            onPress={handleComplete}
            activeOpacity={0.8}
          >
            <CheckCircle2 size={26} color="#1A1A1A" strokeWidth={2.5} />
            <Text style={styles.completeBtnText}>إنهاء الطلب ✓</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },

  /* Header */
  header: {
    paddingTop: Platform.OS === 'ios' ? 56 : 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderBottomColor: '#1A1A1A',
    gap: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: { boxShadow: '3px 3px 0px #1A1A1A' },
      default: {},
    }),
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '900',
    color: '#1A1A1A',
    textAlign: 'right',
  },
  orderBadge: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    ...Platform.select({
      web: { boxShadow: '2px 2px 0px #1A1A1A' },
      default: {},
    }),
  },
  orderBadgeText: {
    fontWeight: '900',
    color: '#1A1A1A',
    fontSize: 14,
  },

  /* Scroll */
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },

  /* Map */
  mapContainer: {
    height: 200,
    borderBottomWidth: 4,
    borderBottomColor: '#1A1A1A',
    backgroundColor: '#FFE5B4',
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  mapPlaceholderText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
  },
  mapPlaceholderSub: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },

  /* Info Section */
  infoSection: {
    padding: 20,
    gap: 12,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    padding: 14,
    gap: 12,
    ...Platform.select({
      web: { boxShadow: '4px 4px 0px #1A1A1A' },
      default: {},
    }),
  },
  infoIcon: {
    width: 36,
    height: 36,
    backgroundColor: '#FFFBEB',
    borderWidth: 2,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBody: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    marginBottom: 3,
    textAlign: 'right',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
    textAlign: 'right',
  },

  /* Totals */
  totalsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  totalCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    gap: 4,
    ...Platform.select({
      web: { boxShadow: '4px 4px 0px #1A1A1A' },
      default: {},
    }),
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A1A',
  },

  /* Actions */
  actionsSection: {
    paddingHorizontal: 20,
    gap: 14,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    ...Platform.select({
      web: { boxShadow: '4px 4px 0px #1A1A1A' },
      default: {},
    }),
  },
  actionBtnDisabled: {
    opacity: 0.4,
  },
  actionBtnText: {
    fontSize: 17,
    fontWeight: '900',
    color: '#1A1A1A',
  },
  completeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
    backgroundColor: '#00E676',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    marginTop: 4,
    ...Platform.select({
      web: { boxShadow: '5px 5px 0px #1A1A1A' },
      default: {},
    }),
  },
  completeBtnText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1A1A1A',
  },
});
