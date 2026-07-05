import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OrdersPage } from '../src/views/ManagementPages';
import React from 'react';

// Mock the API utilities
vi.mock('../src/utils/api', () => ({
  ordersApi: { 
    getAll: vi.fn(() => Promise.resolve({ data: [{ id: 1, orderNumber: '#123', status: 'Pending', customerName: 'Test', totalAmount: 100, createdAt: '2026-05-18T21:19:36Z' }] })),
    getById: vi.fn(() => Promise.resolve({ data: { id: 1, orderNumber: '#123', status: 'Pending', customerName: 'Test', orderType: 'Delivery', totalAmount: 100, createdAt: '2026-05-18T21:19:36Z', items: [{ menuItemId: 1, menuItemName: 'Burger', quantity: 1, price: 10 }] } })),
    update: vi.fn(() => Promise.resolve({ data: {} })),
    updateStatus: vi.fn()
  },
  menuApi: {
    getItems: vi.fn(() => Promise.resolve({ data: [{ id: 2, name: 'Fries', price: 5 }] }))
  },
  dashboardApi: { getStats: vi.fn(() => Promise.resolve({ data: {} })) },
  branchesApi: { getAll: vi.fn(() => Promise.resolve({ data: [] })) },
  staffApi: { getAll: vi.fn(() => Promise.resolve({ data: [] })) },
  telegramBotApi: { getStatus: vi.fn(() => Promise.resolve({ data: {} })) }
}));

describe('OrdersPage details and edit', () => {
  it('opens order details and calls onEditOrder when edit button is clicked', async () => {
    const handleEditOrder = vi.fn();
    render(<OrdersPage onEditOrder={handleEditOrder} />);
    
    // Click on the order to open details
    await waitFor(() => {
      expect(screen.getByText('#123')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('#123'));

    // Verify details page loaded
    await waitFor(() => {
      expect(screen.getByText('فتح الطلب للتعديل في مركز الاتصال')).toBeInTheDocument();
    });

    // Enter edit mode
    fireEvent.click(screen.getByText('فتح الطلب للتعديل في مركز الاتصال'));

    expect(handleEditOrder).toHaveBeenCalledWith("1");
  });
});
