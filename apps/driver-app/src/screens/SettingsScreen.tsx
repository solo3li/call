import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, Platform, Alert, ScrollView } from 'react-native';
import { LogOut, MapPin, Navigation } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store';

export default function SettingsScreen() {
  const { logout } = useAuthStore();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [overlayEnabled, setOverlayEnabled] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const notif = await AsyncStorage.getItem('settings_notifications');
      const overlay = await AsyncStorage.getItem('settings_overlay');
      if (notif !== null) setNotificationsEnabled(notif === 'true');
      if (overlay !== null) setOverlayEnabled(overlay === 'true');
    } catch (e) {
      console.error('Error loading settings', e);
    }
  };

  const toggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('settings_notifications', String(value));
    
    if (value && Platform.OS === 'web') {
      if ('Notification' in window) {
        Notification.requestPermission().then(permission => {
          if (permission !== 'granted') {
            setNotificationsEnabled(false);
            AsyncStorage.setItem('settings_notifications', 'false');
            alert('يجب السماح بالإشعارات من إعدادات المتصفح');
          }
        });
      }
    }
  };

  const toggleOverlay = async (value: boolean) => {
    setOverlayEnabled(value);
    await AsyncStorage.setItem('settings_overlay', String(value));
    
    if (value && Platform.OS !== 'web') {
      // In a real native app, this would request the SYSTEM_ALERT_WINDOW permission
      Alert.alert(
        'إذن الظهور فوق التطبيقات',
        'سيتم نقلك إلى إعدادات النظام للسماح للتطبيق بالظهور فوق التطبيقات الأخرى'
      );
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      if (window.confirm('هل تريد الخروج من حسابك؟')) {
        logout();
      }
    } else {
      Alert.alert('تسجيل الخروج', 'هل تريد الخروج من حسابك؟', [
        { text: 'إلغاء', style: 'cancel' },
        { 
          text: 'خروج', 
          style: 'destructive',
          onPress: logout
        }
      ]);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات</Text>
        <Text style={styles.headerSubtitle}>تفضيلات التطبيق والأذونات</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الأذونات والإشعارات</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={[styles.iconBox, { backgroundColor: '#DBEAFE' }]}>
              <MapPin color="#2563EB" size={24} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.settingTitle}>الإشعارات</Text>
              <Text style={styles.settingDesc}>الحصول على تنبيهات للطلبات الجديدة</Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: '#CBD5E1', true: '#10B981' }}
            thumbColor={'#FFFFFF'}
            onValueChange={toggleNotifications}
            value={notificationsEnabled}
            style={styles.switch}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
              <Navigation color="#D97706" size={24} strokeWidth={2.5} />
            </View>
            <View>
              <Text style={styles.settingTitle}>الظهور فوق التطبيقات</Text>
              <Text style={styles.settingDesc}>إظهار تنبيه الطلب فوق الخرائط</Text>
            </View>
          </View>
          <Switch
            trackColor={{ false: '#CBD5E1', true: '#10B981' }}
            thumbColor={'#FFFFFF'}
            onValueChange={toggleOverlay}
            value={overlayEnabled}
            style={styles.switch}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الحساب</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <LogOut color="#FFFFFF" size={20} strokeWidth={3} />
          <Text style={styles.logoutText}>تسجيل الخروج</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  content: {
    paddingBottom: 40,
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
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 16,
    textAlign: 'right',
  },
  settingItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#1A1A1A',
    ...Platform.select({
      web: { boxShadow: '2px 2px 0px #1A1A1A' },
      default: { elevation: 0 }
    }),
  },
  settingInfo: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1A1A1A',
    textAlign: 'right',
  },
  settingDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  switch: {
    transform: [{ scale: Platform.OS === 'ios' ? 0.8 : 1.1 }],
  },
  logoutBtn: {
    backgroundColor: '#EF4444', // Red color for logout
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    gap: 12,
    ...Platform.select({
      web: { boxShadow: '4px 4px 0px #1A1A1A' },
      default: { elevation: 0 }
    }),
  },
  logoutText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
  },
});
