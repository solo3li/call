import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

// In a real app, use environment variables (e.g., process.env.EXPO_PUBLIC_API_URL)
// 10.0.2.2 is the special IP alias to the host loopback interface on Android Emulator
const API_URL = 'https://167.71.66.188.nip.io/api'; 

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to inject the JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

import { useAuthStore } from './store';

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('Unauthorized or Forbidden. Logging out...');
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('driverName');
      try {
        useAuthStore.getState().logout();
      } catch (e) {
        // ignore
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  loginEmployee: (totpCode: string) => api.post('/auth/login-employee', { totpCode }),
};

export const ordersApi = {
  getAll: () => api.get('/orders'),
  updateStatus: (id: string, status: string) => api.put(`/orders/${id}/status`, { status }),
};

export const deliveryApi = {
  getTrips: (branchId?: string) => api.get('/delivery/trips', { params: { branchId } }),
  getTripMapsUrl: (id: string) => api.get(`/delivery/trips/${id}/maps-url`),
  updateTripStatus: (id: string, status: string) => api.put(`/delivery/trips/${id}/status`, { status }),
};

export default api;
