import { render, screen } from '@testing-library/react';
import StatsCards from './StatsCards';
import { describe, it, expect } from 'vitest';

describe('StatsCards Component', () => {
 const mockStats = {
 totalRevenue: 50000,
 totalOrders: 150,
 activeTables: 12,
 pendingOrders: 5,
 summary: { totalRevenue: 50000, totalOrders: 150, growth: 10 },
 revenueData: [],
 ordersPerHour: [],
 topItems: [],
 notifications: [],
 preparingOrders: 0,
 inKitchenOrders: 0,
 deliveryOrders: 0,
 completedTodayOrders: 0,
 weeklyRatings: []
 };

 it('renders correctly with stats data', () => {
 render(<StatsCards stats={mockStats} />);
 
 expect(screen.getByText('إجمالي الإيرادات')).toBeInTheDocument();
 expect(screen.getByText('50,000')).toBeInTheDocument();
 
 expect(screen.getByText('الطلبات')).toBeInTheDocument();
 expect(screen.getByText('150')).toBeInTheDocument();
 });

 it('renders zero values when stats are null', () => {
 render(<StatsCards stats={null} />);
 
 const zeroValues = screen.getAllByText('٠');
 expect(zeroValues.length).toBeGreaterThan(0);
 });
});
