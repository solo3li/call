import React from 'react';
import { render, screen, waitFor } from '@testing-library/react-native';
import App from '../../App';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

jest.mock('react-native-safe-area-context', () => {
  const inset = { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    SafeAreaProvider: jest.fn(({ children }) => children),
    SafeAreaConsumer: jest.fn(({ children }) => children(inset)),
    SafeAreaView: jest.fn(({ children }) => children),
    useSafeAreaInsets: jest.fn(() => inset),
  };
});

jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

jest.mock('axios', () => {
  return {
    create: jest.fn(() => ({
      interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
      get: jest.fn().mockResolvedValueOnce({ data: [] }),
      post: jest.fn(),
      put: jest.fn(),
    })),
    get: jest.fn(),
    post: jest.fn(),
  };
});

jest.mock('lucide-react-native', () => ({
  Truck: () => 'Truck',
  LogOut: () => 'LogOut',
  Navigation: () => 'Navigation',
  Phone: () => 'Phone',
  CheckCircle2: () => 'CheckCircle2',
  CheckCircle: () => 'CheckCircle',
  Package: () => 'Package',
  MapPin: () => 'MapPin',
  Home: () => 'Home',
  Settings: () => 'Settings',
  TrendingUp: () => 'TrendingUp',
  Star: () => 'Star'
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login screen when not logged in', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('دخول المندوب')).toBeTruthy();
    });
  });

  it('renders orders screen when logged in', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce('fake-token');
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('صباح الخير،')).toBeTruthy();
    });
  });
});
