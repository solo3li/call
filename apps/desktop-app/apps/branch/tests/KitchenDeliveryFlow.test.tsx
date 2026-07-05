import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import DeliveryDriverView from '../src/views/DeliveryDriverView';
import DeliveryDashboard from '../src/components/DeliveryDashboard';
import KdsStationPage from '../src/views/KdsStationPage';
import KdsMonitorPage from '../src/views/KdsMonitorPage';

// --- Global Mocks ---
vi.mock('../src/utils/useCurrency', () => ({
  useCurrency: () => ({ currencySymbol: 'SAR' }),
}));

vi.mock('../src/context/DashboardContext', () => ({
  useDashboard: () => ({
    recentOrders: [
      { id: '1', orderNumber: '1001', status: 'Ready', orderType: 'Delivery', totalAmount: 150, customerName: 'Ahmed', createdAt: new Date().toISOString() }
    ],
    refresh: vi.fn(),
  }),
}));

vi.mock('../src/utils/permissions', () => ({
  hasPermission: () => true,
  getUserBranchId: () => null,
  isManagerOrOwner: () => true,
}));

const { mockOrdersApi, mockKitchenStationsApi, mockEmployeesApi, mockAuthApi } = vi.hoisted(() => ({
  mockOrdersApi: {
    getDeliveryOrders: vi.fn<any>(() => Promise.resolve({ data: [] })),
    getDriverOrders: vi.fn<any>(() => Promise.resolve({ data: [] })),
    assignDriver: vi.fn<any>(() => Promise.resolve({ data: {} })),
    updateStatus: vi.fn<any>(() => Promise.resolve({ data: {} })),
    getAll: vi.fn<any>(() => Promise.resolve({ data: [] })),
    getActiveKds: vi.fn<any>(() => Promise.resolve({ data: [] })),
    updateItemStatus: vi.fn<any>(() => Promise.resolve({ data: {} })),
  },
  mockKitchenStationsApi: {
    getAll: vi.fn<any>(() => Promise.resolve({ data: [{ id: 1, name: 'Grill' }] })),
  },
  mockEmployeesApi: {
    getAll: vi.fn<any>(() => Promise.resolve({ data: [{ id: 'driver-1', fullName: 'Sami Driver', roleName: 'Driver', isDelivery: true }] })),
  },
  mockAuthApi: {
    loginEmployee: vi.fn<any>(() => Promise.resolve({ data: { token: 'mock-token', tenant: { id: 'tenant-1' } } })),
  }
}));

vi.mock('../src/utils/api', () => ({
  ordersApi: mockOrdersApi,
  kitchenStationsApi: mockKitchenStationsApi,
  employeesApi: mockEmployeesApi,
  authApi: mockAuthApi,
}));

describe('Kitchen and Delivery Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    // Default logged in for driver
    localStorage.setItem('driverName', 'Sami Driver');
    localStorage.setItem('tenantId', 'tenant-1');
    localStorage.setItem('kds_station', '1');
  });

  describe('1. KdsStationPage (Kitchen Display System)', () => {
    it('renders kitchen orders and allows changing item status', async () => {
      mockOrdersApi.getActiveKds.mockResolvedValue({
        data: [{
          id: 'order-1',
          orderNumber: 'KDS-01',
          status: 'Pending',
          orderType: 'Dine-in',
          createdAt: new Date().toISOString(),
          items: [{ id: 1, menuItemName: 'Burger', quantity: 1, status: 'Pending', kitchenStationId: 1, kitchenStationName: 'Grill' }]
        }]
      });

      render(<KdsStationPage />);

      // Wait for stations to load and click 'Grill'
      const grillBtn = await screen.findByRole('button', { name: /Grill/i });
      fireEvent.click(grillBtn);

      // Wait for order to load
      await waitFor(() => {
        expect(screen.getByText(/KDS-01/i)).toBeInTheDocument();
      });

      expect(screen.getByText('Burger')).toBeInTheDocument();
      
      // Simulate status change
      const itemBtn = screen.getByRole('button', { name: /Burger/i });
      fireEvent.click(itemBtn);
      
      await waitFor(() => {
        expect(mockOrdersApi.updateItemStatus).toHaveBeenCalledWith('order-1', 1, 'Preparing');
      });
    });
  });

  describe('2. KdsMonitorPage (Kitchen Monitoring)', () => {
    it('renders all kitchen orders for monitoring', async () => {
      mockOrdersApi.getActiveKds.mockResolvedValue({
        data: [{
          id: 'order-2',
          orderNumber: 'KDS-02',
          status: 'Preparing',
          orderType: 'Takeaway',
          createdAt: new Date().toISOString(),
          items: [{ id: 2, menuItemName: 'Pizza', quantity: 2, status: 'Preparing', kitchenStationId: null }]
        }]
      });

      render(<KdsMonitorPage />);

      await waitFor(() => {
        expect(screen.getByText(/KDS-02/i)).toBeInTheDocument();
      });

      expect(screen.getByText('Pizza')).toBeInTheDocument();
    });
  });

  describe('3. DeliveryDashboard (Delivery Management)', () => {
    it('renders delivery dashboard and allows assigning a driver', async () => {
      // It uses useDashboard context for orders, which is mocked to return order '1001'
      render(<DeliveryDashboard />);

      await waitFor(() => {
        expect(screen.getByText(/1001/i)).toBeInTheDocument();
        expect(screen.getByText('Ahmed')).toBeInTheDocument();
      });
      
      // Assign driver interaction
      const assignButton = await screen.findByRole('button', { name: /تعيين/i });
      fireEvent.click(assignButton);

      // Wait for the dropdown and loadingDrivers to resolve
      const driverButton = await screen.findByRole('button', { name: /Sami Driver/i }, { timeout: 3000 });
      fireEvent.click(driverButton);

      // Verify the API was called with the correct driver ID
      await waitFor(() => {
        // the id in mock for 1001 is '1', the name is 'Sami Driver', phone is ''
        expect(mockOrdersApi.assignDriver).toHaveBeenCalledWith('1', 'Sami Driver', '');
      });
    });
  });

  describe('4. DeliveryDriverView (Driver Screen)', () => {
    it('renders assigned orders and allows marking as completed', async () => {
      mockOrdersApi.getAll.mockResolvedValue({
        data: [{
          id: 'order-3',
          orderNumber: 'DLV-03',
          status: 'Out for Delivery',
          orderType: 'Delivery',
          driverName: 'Sami Driver',
          customerName: 'Sara',
          customerPhone: '0500000000',
          customerAddress: 'Main St 123',
          totalAmount: 120,
        }]
      });

      render(<DeliveryDriverView />);

      await waitFor(() => {
        expect(screen.getByText(/DLV-03/i)).toBeInTheDocument();
        expect(screen.getByText('Sara')).toBeInTheDocument();
        expect(screen.getByText(/Main St 123/i)).toBeInTheDocument();
      });

      // Complete order flow
      const confirmBtn = screen.getByRole('button', { name: /تم التوصيل/i });
      fireEvent.click(confirmBtn);

      const completeBtn = await screen.findByRole('button', { name: /تأكيد التوصيل/i });
      fireEvent.click(completeBtn);

      await waitFor(() => {
        expect(mockOrdersApi.updateStatus).toHaveBeenCalledWith('order-3', 'Completed');
      });
    });
  });
});
