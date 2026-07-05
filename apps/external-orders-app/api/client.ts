import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use relative path so the browser uses the same origin, avoiding CORS issues
export const BASE_URL = '/api'; 

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
