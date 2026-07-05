import { describe, it, expect, beforeAll } from 'vitest';
import api, { 
  authApi, 
  dashboardApi, 
  branchesApi, 
  customersApi, 
  staffApi, 
  menuApi, 
  ordersApi, 
  rolesApi,
  telegramBotApi,
  departmentsApi,
  employeesApi,
  plansApi,
  supportApi
} from '../utils/api';

describe('Frontend to Backend Live Endpoints Integration', () => {
  let authToken = '';
  let activeTenantId = '';

  beforeAll(async () => {
    // Ensure localStorage is clean
    localStorage.clear();
  });

  it('1. Should successfully authenticate admin and receive JWT & Tenant info', async () => {
    const response = await authApi.login({
      email: 'admin@foodrms.com',
      password: 'Admin123!'
    });

    expect(response.status).toBe(200);
    expect(response.data.token).toBeDefined();
    expect(response.data.tenant).toBeDefined();
    expect(response.data.tenant.id).toBeDefined();

    authToken = response.data.token;
    activeTenantId = response.data.tenant.id;

    // Set in localStorage so api interceptors pick them up
    localStorage.setItem('token', authToken);
    localStorage.setItem('tenantId', activeTenantId);
  });

  it('2. Should fetch Dashboard stats successfully', async () => {
    try {
      const response = await dashboardApi.getStats();
      expect(response.status).toBe(200);
      expect(response.data).toBeDefined();
      expect(response.data.totalRevenue).toBeDefined();
      expect(response.data.totalOrders).toBeDefined();
      expect(response.data.pendingOrders).toBeDefined();
    } catch (err: any) {
      console.error("Dashboard Stats 500 Error:", err.response?.data || err.message);
      throw err;
    }
  });

  it('3. Should fetch Branches successfully', async () => {
    const response = await branchesApi.getAll();
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
  });

  it('4. Should fetch Customers successfully', async () => {
    const response = await customersApi.getAll();
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('5. Should fetch Staff successfully', async () => {
    const response = await staffApi.getAll();
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('6. Should fetch Menu Categories successfully', async () => {
    const response = await menuApi.getCategories();
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data.length).toBeGreaterThan(0);
  });

  it('7. Should fetch Orders successfully', async () => {
    const response = await ordersApi.getAll();
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('8. Should fetch Roles successfully', async () => {
    const response = await rolesApi.getAll();
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('9. Should fetch Telegram Bot config successfully', async () => {
    const response = await telegramBotApi.getConfig();
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
  });

  it('10. Should fetch Departments successfully', async () => {
    const response = await departmentsApi.getAll();
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('11. Should fetch Employees successfully', async () => {
    const response = await employeesApi.getAll();
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('12. Should fetch Plans successfully', async () => {
    const response = await plansApi.getAll();
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('13. Should fetch Support Tickets successfully', async () => {
    const response = await supportApi.getTickets();
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('14. Should fetch Menu Items successfully', async () => {
    const response = await menuApi.getItems();
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('15. Should fetch Role Permissions successfully', async () => {
    const response = await rolesApi.getPermissions();
    expect(response.status).toBe(200);
    expect(Array.isArray(response.data)).toBe(true);
  });

  it('16. Should fetch Public Menu successfully', async () => {
    const response = await menuApi.getPublicMenu(activeTenantId);
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
    expect(response.data.categories).toBeDefined();
    expect(response.data.items).toBeDefined();
  });
});
