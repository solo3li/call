import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Theme } from '../constants/Theme';
import { apiClient } from '../api/client';
import { ExtractedOrderData } from '../api/ocr';
import { Ionicons } from '@expo/vector-icons';

export default function VerificationScreen() {
  const { data, imageUri } = useLocalSearchParams<{ data: string; imageUri: string }>();
  const router = useRouter();

  const [orderData, setOrderData] = useState<ExtractedOrderData | null>(null);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (data) {
      setOrderData(JSON.parse(data));
    }
    fetchCompanies();
  }, [data]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/ExternalCompanies');
      setCompanies(res.data);
      
      // Auto match if name matches loosely
      if (data) {
        const parsed = JSON.parse(data);
        const match = res.data.find((c: any) => c.name.toLowerCase().includes(parsed.companyName.toLowerCase()));
        if (match) {
          setOrderData(prev => prev ? { ...prev, externalCompanyId: match.id } : null);
        }
      }
    } catch (e) {
      console.error('Failed to fetch companies', e);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    if (!orderData) return;
    const newItems = [...orderData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setOrderData({ ...orderData, items: newItems });
  };

  const addItem = () => {
    if (!orderData) return;
    setOrderData({
      ...orderData,
      items: [...orderData.items, { name: '', quantity: 1, price: 0 }]
    });
  };

  const removeItem = (index: number) => {
    if (!orderData) return;
    const newItems = orderData.items.filter((_, i) => i !== index);
    setOrderData({ ...orderData, items: newItems });
  };

  const handleSubmit = async () => {
    if (!orderData) return;
    if (!orderData.externalCompanyId || orderData.externalCompanyId === '00000000-0000-0000-0000-000000000000') {
      Alert.alert('خطأ', 'يرجى التأكد من ربط الطلب بشركة التوصيل الصحيحة (تحديث المعرف إذا لزم)');
      // For testing, we might bypass strict ID check or use a default one.
      // But keeping it to encourage correct flow.
    }

    try {
      setSubmitting(true);
      const payload = {
        deliveryType: 'External',
        externalCompanyId: orderData.externalCompanyId,
        externalOrderId: orderData.externalOrderId,
        customerPhone: orderData.customerPhone,
        isExternalDelivery: true,
        items: orderData.items.map(item => ({
          menuItemId: null,
          itemName: item.name,
          quantity: Number(item.quantity) || 1,
          price: Number(item.price) || 0,
        }))
      };

      await apiClient.post('/Orders', payload);
      Alert.alert('نجاح', 'تم تسجيل الطلب بنجاح');
      router.replace('/(tabs)/camera');
    } catch (e: any) {
      Alert.alert('خطأ', e.response?.data?.message || 'فشل إرسال الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  if (!orderData || loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>مراجعة تفاصيل الطلب</Text>
      
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.thumbnail} resizeMode="cover" />
      )}

      <Card>
        <Text style={styles.sectionTitle}>البيانات الأساسية</Text>
        <Input 
          label="اسم الشركة المستخرجة" 
          value={orderData.companyName} 
          onChangeText={(v) => setOrderData({...orderData, companyName: v})}
        />
        <Text style={styles.hintText}>الشركات المسجلة بالنظام للمطابقة: {companies.map(c => c.name).join('، ') || 'جاري التحميل...'}</Text>
        
        <Input 
          label="رقم الطلب الخارجي" 
          value={orderData.externalOrderId} 
          onChangeText={(v) => setOrderData({...orderData, externalOrderId: v})} 
        />
        <Input 
          label="هاتف العميل" 
          value={orderData.customerPhone} 
          onChangeText={(v) => setOrderData({...orderData, customerPhone: v})} 
          keyboardType="phone-pad"
        />
        <Input 
          label="طريقة الدفع" 
          value={orderData.paymentMethod} 
          onChangeText={(v) => setOrderData({...orderData, paymentMethod: v as 'Cash'|'Visa'})} 
        />
      </Card>

      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>الأصناف</Text>
          <Button title="إضافة صنف +" onPress={addItem} variant="secondary" style={{ paddingVertical: 6, paddingHorizontal: 12, minHeight: 0 }} />
        </View>

        {orderData.items.map((item, idx) => (
          <View key={idx} style={styles.itemRowContainer}>
            <View style={styles.itemInputsRow}>
              <View style={{ flex: 2 }}>
                <Input 
                  label="الاسم" 
                  value={item.name} 
                  onChangeText={(v) => updateItem(idx, 'name', v)} 
                />
              </View>
              <View style={{ flex: 1, marginHorizontal: 8 }}>
                <Input 
                  label="الكمية" 
                  value={String(item.quantity)} 
                  onChangeText={(v) => updateItem(idx, 'quantity', v)} 
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Input 
                  label="السعر" 
                  value={String(item.price)} 
                  onChangeText={(v) => updateItem(idx, 'price', v)} 
                  keyboardType="numeric"
                />
              </View>
            </View>
            <TouchableOpacity onPress={() => removeItem(idx)} style={styles.trashBtn}>
              <Ionicons name="trash-outline" size={24} color={Theme.colors.danger} />
            </TouchableOpacity>
          </View>
        ))}
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>الملخص المالي (ر.س)</Text>
        <View style={styles.financialRow}>
          <View style={{ flex: 1, marginEnd: 8 }}>
            <Input 
              label="المجموع الفرعي" 
              value={String(orderData.subtotal || '')} 
              onChangeText={(v) => setOrderData({...orderData, subtotal: Number(v)})} 
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1, marginStart: 8 }}>
            <Input 
              label="الضريبة" 
              value={String(orderData.tax || '')} 
              onChangeText={(v) => setOrderData({...orderData, tax: Number(v)})} 
              keyboardType="numeric"
            />
          </View>
        </View>
        <View style={styles.financialRow}>
          <View style={{ flex: 1, marginEnd: 8 }}>
            <Input 
              label="رسوم التوصيل" 
              value={String(orderData.deliveryFee || '')} 
              onChangeText={(v) => setOrderData({...orderData, deliveryFee: Number(v)})} 
              keyboardType="numeric"
            />
          </View>
          <View style={{ flex: 1, marginStart: 8 }}>
            <Input 
              label="الإجمالي النهائي" 
              value={String(orderData.total)} 
              onChangeText={(v) => setOrderData({...orderData, total: Number(v)})} 
              keyboardType="numeric"
            />
          </View>
        </View>
      </Card>

      <View style={styles.actionButtons}>
        <Button 
          title="اعتماد الطلب" 
          onPress={handleSubmit} 
          variant="success" 
          disabled={submitting} 
          style={styles.mainActionBtn}
        />
        <Button 
          title="إلغاء وإعادة مسح" 
          onPress={() => router.back()} 
          variant="danger" 
          style={styles.mainActionBtn}
        />
      </View>
      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
    padding: Theme.spacing.md,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
  },
  title: {
    fontFamily: Theme.typography.fontFamilyBlack,
    fontSize: 26,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.md,
    marginTop: Theme.spacing.xl,
  },
  thumbnail: {
    width: '100%',
    height: 180,
    borderRadius: Theme.components.borderRadius,
    borderWidth: Theme.components.borderWidth,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  sectionTitle: {
    fontFamily: Theme.typography.fontFamilyBold,
    fontSize: 18,
    color: Theme.colors.text,
    marginBottom: Theme.spacing.sm,
  },
  hintText: {
    fontFamily: Theme.typography.fontFamily,
    fontSize: 12,
    color: Theme.colors.primary,
    marginBottom: Theme.spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 8,
    borderRadius: 4,
  },
  itemRowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
    backgroundColor: '#FAFAFA',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EEE',
  },
  itemInputsRow: {
    flex: 1,
    flexDirection: 'row-reverse',
  },
  trashBtn: {
    padding: 8,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  financialRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
  },
  actionButtons: {
    marginTop: Theme.spacing.md,
    gap: Theme.spacing.sm,
  },
  mainActionBtn: {
    paddingVertical: 16,
  },
  bottomSpacer: {
    height: 60,
  }
});
