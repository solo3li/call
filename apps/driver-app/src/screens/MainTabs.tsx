import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { Home, Package, Settings, LogOut, CheckCircle2, MapPin } from 'lucide-react-native';
import OrdersScreen from './OrdersScreen';
import DashboardScreen from './DashboardScreen';
import HistoryScreen from './HistoryScreen';
import SettingsScreen from './SettingsScreen';
import { useAuthStore } from '../store';

export default function MainTabs() {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const { logout } = useAuthStore();

  const renderScreen = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardScreen />;
      case 'Orders':
        return <OrdersScreen />;
      case 'History':
        return <HistoryScreen />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  const tabs = [
    { name: 'Dashboard', label: 'الرئيسية', icon: Home },
    { name: 'Orders', label: 'الطلبات', icon: Package },
    { name: 'History', label: 'السجل', icon: CheckCircle2 },
    { name: 'Settings', label: 'الإعدادات', icon: Settings },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {renderScreen()}
      </View>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <TouchableOpacity 
              key={tab.name} 
              style={[styles.tabItem, isActive && styles.activeTabItem]}
              onPress={() => setActiveTab(tab.name)}
              activeOpacity={0.8}
            >
              <Icon color={isActive ? '#1A1A1A' : '#64748B'} size={28} strokeWidth={isActive ? 3 : 2.5} />
              <Text style={[styles.tabText, isActive && styles.activeTabText]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Floating Action Button for Quick Orders Access */}
      {activeTab !== 'Orders' && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => setActiveTab('Orders')}
          activeOpacity={0.9}
        >
          <Package color="#FFFFFF" size={32} strokeWidth={2.5} />
          <View style={styles.fabBadge}>
            <Text style={styles.fabBadgeText}>!</Text>
          </View>
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
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 4,
    borderTopColor: '#1A1A1A',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 28 : 12,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeTabItem: {
    backgroundColor: '#FFD700',
    borderColor: '#1A1A1A',
    ...Platform.select({
      web: { boxShadow: '2px 2px 0px #1A1A1A' },
      default: { elevation: 0 }
    }),
  },
  tabText: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '700',
  },
  activeTabText: {
    color: '#1A1A1A',
    fontWeight: '900',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF1744',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 0,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    ...Platform.select({
      web: { boxShadow: '4px 4px 0px #1A1A1A' },
      default: { elevation: 0 }
    }),
  },
  logoutText: {
    color: '#1A1A1A',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 85,
    right: 20,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1A1A1A',
    ...Platform.select({
      web: { boxShadow: '4px 4px 0px #1A1A1A' },
      default: { elevation: 8 }
    }),
  },
  fabBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#EF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  fabBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 14,
  }
});
