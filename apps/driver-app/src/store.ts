import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  token: string | null;
  driverName: string | null;
  currencySymbol: string | null;
  isHydrated: boolean;
  login: (token: string, driverName: string, currencySymbol: string) => Promise<void>;
  logout: () => Promise<void>;
  hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  driverName: null,
  currencySymbol: null,
  isHydrated: false,
  login: async (token, driverName, currencySymbol) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('driverName', driverName);
    await AsyncStorage.setItem('currencySymbol', currencySymbol);
    set({ token, driverName, currencySymbol });
  },
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('driverName');
    await AsyncStorage.removeItem('currencySymbol');
    set({ token: null, driverName: null, currencySymbol: null });
  },
  hydrate: async () => {
    const token = await AsyncStorage.getItem('token');
    const driverName = await AsyncStorage.getItem('driverName');
    const currencySymbol = await AsyncStorage.getItem('currencySymbol') || 'ر.س';
    set({ token, driverName, currencySymbol, isHydrated: true });
  },
}));
