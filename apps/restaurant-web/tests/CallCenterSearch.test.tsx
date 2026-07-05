import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CallCenterPage from '../src/views/CallCenterPage';
import React from 'react';

// Mock the context
vi.mock('../src/context/DashboardContext', () => ({
  useDashboard: () => ({
    customers: [
      {
        id: '1',
        name: 'Test Customer',
        phoneNumber: '0551234567',
        customerAddresses: [
          { id: 101, addressDetails: 'Address One' },
          { id: 102, addressDetails: 'Address Two' }
        ]
      }
    ],
    refreshCustomers: vi.fn(),
    loading: false
  })
}));

// Mock the API utilities
vi.mock('../src/utils/api', () => ({
  menuApi: { getCategories: vi.fn(() => Promise.resolve({ data: [] })), getItems: vi.fn(() => Promise.resolve({ data: [] })) },
  branchesApi: { getAll: vi.fn(() => Promise.resolve({ data: [] })) },
  customersApi: { getAll: vi.fn(() => Promise.resolve({ data: [] })), create: vi.fn() },
  ordersApi: { getAll: vi.fn(() => Promise.resolve({ data: [] })), create: vi.fn() },
  deliveryApi: { getZones: vi.fn(() => Promise.resolve({ data: [] })), addCustomerAddress: vi.fn() },
  getImageUrl: (p: string) => p
}));

describe('CallCenterPage Customer Search', () => {
  it('displays addresses when searching for a customer by number', async () => {
    render(<CallCenterPage />);
    
    const phoneInput = screen.getByPlaceholderText(/رقم الجوال/);
    const searchButton = screen.getByText('بحث');

    // Simulate typing the phone number
    fireEvent.change(phoneInput, { target: { value: '0551234567' } });
    fireEvent.click(searchButton);

    // Check if the customer name appears in the search result area
    const nameInputs = screen.getAllByDisplayValue('Test Customer');
    expect(nameInputs.length).toBeGreaterThan(0);

    // Check if addresses are displayed as buttons in Step 1
    await waitFor(() => {
      const addr1 = screen.getByText('Address One');
      const addr2 = screen.getByText('Address Two');
      expect(addr1).toBeInTheDocument();
      expect(addr2).toBeInTheDocument();
      
      // Verify they are buttons
      expect(addr1.closest('button')).toBeInTheDocument();
    });
  });
});
