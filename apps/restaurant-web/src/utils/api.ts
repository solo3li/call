import axios from 'axios';
import { 
  LoginResponse, 
  Branch, 
  Customer, 
  Staff, 
  MenuCategory, 
  MenuItem, 
  Order, 
  DashboardStats,
  Role,
  Permission,
  Department,
  Employee,
  Plan,
  SupportTicket,
  CustomerAddress,
  DeliveryZone,
  Currency,
  TenantSettings,
  SuggestedGroup,
  DeliveryTrip
} from '../types/api';

const getApiBaseUrl = () => {
  if (typeof process !== 'undefined' && process.env.VITEST) {
    return 'http://127.0.0.1:5109/api';
  }
  if (typeof window !== 'undefined') {
    // Use relative path to leverage Next.js rewrites/proxy
    return '/api';
  }
  // Server-side (SSR) should use the internal container name
  return 'http://backend:5109/api';
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
});

// Interceptor for Auth token and Tenant ID
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const tenantId = localStorage.getItem('tenantId');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (tenantId) {
    config.headers['X-Tenant-Id'] = tenantId;
  }

  return config;
});

// Interceptor for 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login') && !error.config?.url?.includes('/auth/login')) {
        localStorage.clear();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials: any) => api.post<LoginResponse>('/auth/login', credentials),
  loginEmployee: (credentials: { totpCode: string }) => api.post<LoginResponse>('/auth/login-employee', credentials),
  register: (data: any) => api.post<LoginResponse>('/auth/register', data),
  resetPassword: (data: { email: string; newPassword: string }) => api.post<{ message: string }>('/auth/reset-password', data),
};

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
};

export const branchesApi = {
  getAll: () => api.get<Branch[]>('/branches'),
  create: (data: Partial<Branch>) => api.post<Branch>('/branches', data),
  update: (id: string, data: Partial<Branch>) => api.put<Branch>(`/branches/${id}`, data),
  delete: (id: string) => api.delete(`/branches/${id}`),
};

export const customersApi = {
  getAll: () => api.get<Customer[]>('/customers'),
  create: (data: Partial<Customer>) => api.post<Customer>('/customers', data),
  update: (id: string, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
};

export const deliveryApi = {
  // Zones
  getZones: (branchId?: string) => api.get<DeliveryZone[]>('/delivery/zones', { params: { branchId } }),
  createZone: (data: Partial<DeliveryZone>) => api.post<DeliveryZone>('/delivery/zones', data),
  deleteZone: (id: number) => api.delete(`/delivery/zones/${id}`),
  addCustomerAddress: (customerId: string, data: Partial<CustomerAddress>) => api.post<CustomerAddress>(`/delivery/customers/${customerId}/addresses`, data),
  deleteCustomerAddress: (id: number) => api.delete(`/delivery/customers/addresses/${id}`),
  // Smart Routing
  suggestGroups: (branchId?: string) => api.get<SuggestedGroup[]>('/delivery/suggest-groups', { params: { branchId } }),
  createTrip: (data: { driverName: string; driverPhone: string; orderIds: string[]; branchId?: string }) => api.post<DeliveryTrip>('/delivery/trips', data),
  getTrips: (branchId?: string) => api.get<DeliveryTrip[]>('/delivery/trips', { params: { branchId } }),
  getTripMapsUrl: (id: string) => api.get<{ url: string }>(`/delivery/trips/${id}/maps-url`),
  updateTripStatus: (id: string, status: string) => api.put<DeliveryTrip>(`/delivery/trips/${id}/status`, { status }),
};

export const staffApi = {
  getAll: () => api.get<Staff[]>('/staff'),
  create: (data: any) => api.post<Staff>('/staff', data),
  update: (id: string, data: Partial<Staff>) => api.put<Staff>(`/staff/${id}`, data),
  delete: (id: string) => api.delete(`/staff/${id}`),
};

export const getImageUrl = (path?: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Use absolute URL to the main server IP to ensure images load on subdomains
  const mainServerUrl = 'https://167.71.66.188.nip.io';
  
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  // If the path doesn't start with /uploads and isn't a known static asset, assume it's a menu upload
  if (!cleanPath.startsWith('/uploads/') && !cleanPath.startsWith('/images/') && cleanPath !== '/logo.png') {
    cleanPath = `/uploads/menu${cleanPath}`;
  }
  
  return `${mainServerUrl}${cleanPath}`;
};

export const menuApi = {
  getCategories: () => api.get<MenuCategory[]>('/menu/categories'),
  createCategory: (data: Partial<MenuCategory>) => api.post<MenuCategory>('/menu/categories', data),
  updateCategory: (id: number, data: Partial<MenuCategory>) => api.put<MenuCategory>(`/menu/categories/${id}`, data),
  deleteCategory: (id: number) => api.delete(`/menu/categories/${id}`),
  getItems: (branchId?: string) => api.get<MenuItem[]>('/menu/items', { params: { branchId } }),
  getPublicMenu: (tenantId: string, branchId?: string) => api.get<{ categories: MenuCategory[], items: MenuItem[] }>(`/menu/public/${tenantId}`, { params: { branchId } }),
  createItem: (data: Partial<MenuItem>) => api.post<MenuItem>('/menu/items', data),
  updateItem: (id: number, data: Partial<MenuItem>) => api.put<MenuItem>(`/menu/items/${id}`, data),
  deleteItem: (id: number) => api.delete(`/menu/items/${id}`),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ url: string }>('/menu/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export const ordersApi = {
  create: (order: any) => api.post<Order>('/orders', order),
  getAll: (branchId?: string) => api.get<Order[]>('/orders', branchId ? { params: { branchId } } : undefined),
  getById: (id: string) => api.get<any>(`/orders/${id}`),
  updateStatus: (id: string, status: string) => api.put<Order>(`/orders/${id}/status`, { status }),
  update: (id: string, data: any) => api.put<Order>(`/orders/${id}`, data),
  assignDriver: (id: string, driverName: string, driverPhone: string) =>
    api.put<Order>(`/orders/${id}/driver`, { driverName, driverPhone }),
};

export const rolesApi = {
  getAll: () => api.get<Role[]>('/roles'),
  create: (data: Partial<Role>) => api.post<Role>('/roles', data),
  update: (id: string, data: Partial<Role>) => api.put<Role>(`/roles/${id}`, data),
  delete: (id: string) => api.delete(`/roles/${id}`),
  getPermissions: () => api.get<Permission[]>('/roles/permissions'),
};

export const telegramBotApi = {
  getConfig: () => api.get('/telegrambot/config'),
  updateConfig: (data: { telegramBotToken: string }) => api.post('/telegrambot/config', data),
  testConnection: (data?: { telegramBotToken?: string }) => api.post('/telegrambot/test', data || {}),
  simulateMessage: (data: { message: string; username?: string }) => api.post('/telegrambot/simulate', data),
};

export const departmentsApi = {
  getAll: () => api.get<Department[]>('/departments'),
  create: (data: { name: string }) => api.post<Department>('/departments', data),
  delete: (id: string) => api.delete(`/departments/${id}`),
};

export const employeesApi = {
  getAll: () => api.get<Employee[]>('/employees'),
  create: (data: any) => api.post<Employee>('/employees', data),
  updateRoles: (id: string, data: { departmentId?: string | null; roles: string[] }) => api.put(`/employees/${id}/roles`, data),
  delete: (id: string) => api.delete(`/employees/${id}`),
  regenerateTotp: (id: string) => api.post<Employee>(`/employees/${id}/regenerate-totp`),
};

export const plansApi = {
  getAll: () => api.get<Plan[]>('/plans'),
  getById: (id: string) => api.get<Plan>(`/plans/${id}`),
  create: (data: Partial<Plan>) => api.post<Plan>('/plans', data),
  update: (id: string, data: Partial<Plan>) => api.put<Plan>(`/plans/${id}`, data),
  delete: (id: string) => api.delete(`/plans/${id}`),
};

export const supportApi = {
  getTicket: () => api.get<SupportTicket>('/support/ticket'),
  getTickets: () => api.get<SupportTicket[]>('/support/tickets'),
  getTicketById: (id: string) => api.get<SupportTicket>(`/support/ticket/${id}`),
  createTicket: (data: any) => api.post<SupportTicket>('/support/ticket', data),
  sendMessage: (data: FormData) => api.post('/support/sendmessage', data),
};

export default api;
export const currenciesApi = {
  getAll: () => api.get<Currency[]>('/currencies'),
};

export const tenantSettingsApi = {
  get: () => api.get<TenantSettings>('/tenantsettings'),
  update: (data: Partial<TenantSettings>) => api.put('/tenantsettings', data),
  getMyProfile: () => api.get<any>('/tenantsettings/my-profile'),
  generateMyTotp: () => api.post<{ qrCodeDataUri: string }>('/tenantsettings/generate-totp'),
};

export const businessDaysApi = {
  getActive: () => api.get<{isActive: boolean}>('/businessdays/active'),
  start: () => api.post('/businessdays/start'),
  end: () => api.post('/businessdays/end'),
};
