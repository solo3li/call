import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import * as Pages from '../src/views/ManagementPages';
import { AnalyticsPage } from '../src/views/AnalyticsPage';
import CustomersPage from '../src/views/CustomersPage';
import PosPage from '../src/views/PosPage';

// Mock hooks and API
vi.mock('../src/context/DashboardContext', () => ({
  useDashboard: vi.fn(() => ({
    stats: { 
      totalRevenue: 1000, totalOrders: 10, activeTables: 5, pendingOrders: 2,
      revenueData: [], ordersPerHour: [], topItems: [], notifications: []
    },
    recentOrders: [],
    customers: [],
    refreshCustomers: vi.fn(),
    loading: false,
    error: null,
    refresh: vi.fn()
  })),
  DashboardProvider: ({ children }: any) => <>{children}</>
}));

vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
    };
  }
}));

vi.mock('../src/utils/api', () => ({
  dashboardApi: {
    getStats: vi.fn(() => Promise.resolve({ data: { 
        totalRevenue: 1000, totalOrders: 10, activeTables: 5, pendingOrders: 2,
        summary: { totalRevenue: 1000, totalOrders: 10, growth: 10 },
        revenueData: [], ordersPerHour: [], topItems: [], notifications: []
    } }))
  },
  customersApi: {
    getAll: vi.fn(() => Promise.resolve({ data: [] }))
  },
  menuApi: {
    getCategories: vi.fn(() => Promise.resolve({ data: [] })),
    getItems: vi.fn(() => Promise.resolve({ data: [] }))
  },
  branchesApi: {
    getAll: vi.fn(() => Promise.resolve({ data: [] }))
  },
  ordersApi: {
    getAll: vi.fn(() => Promise.resolve({ data: [] }))
  },
  staffApi: {
    getAll: vi.fn(() => Promise.resolve({ data: [] }))
  },
  rolesApi: {
    getAll: vi.fn(() => Promise.resolve({ data: [] })),
    getPermissions: vi.fn(() => Promise.resolve({ data: [] }))
  }
}));

const renderWithRouter = (ui: React.ReactElement) => {
  return render(ui);
};

describe('Smoke Test for Pages', () => {
  it('renders AnalyticsPage', async () => {
    renderWithRouter(<AnalyticsPage />);
    await waitFor(() => expect(screen.getByText(/تحليلات الأداء/)).toBeInTheDocument());
  });

  it('renders CustomersPage', async () => {
    renderWithRouter(<CustomersPage />);
    await waitFor(() => expect(screen.getByText(/قاعدة بيانات العملاء/)).toBeInTheDocument());
  });

  it('renders PosPage', async () => {
    renderWithRouter(<PosPage />);
    await waitFor(() => expect(screen.getByText(/سلة الطلبات/)).toBeInTheDocument());
  });

  it('renders BranchesPage', async () => {
    renderWithRouter(<Pages.BranchesPage />);
    await waitFor(() => expect(screen.getByText(/إدارة الفروع/)).toBeInTheDocument());
  });

  it('renders MenuPage', async () => {
    renderWithRouter(<Pages.MenuPage />);
    await waitFor(() => expect(screen.getByText(/قائمة الطعام/)).toBeInTheDocument());
  });
});
