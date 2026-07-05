export interface LoginResponse {
  token: string;
  userName: string;
  userRole: string;
  branchId?: string | null;
  permissions: string[];
  tenant: {
    id: string;
    name: string;
    subdomain: string;
    currencyCode: string;
    currencySymbol: string;
  };
}

export interface Currency {
  id: string;
  name: string;
  code: string;
  symbol: string;
  isActive: boolean;
}

export interface TenantSettings {
  restaurantName: string;
  currencyId?: string;
  currencyCode: string;
  currencySymbol: string;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  status: string;
  rating: number;
  ordersCount: number;
  revenue: number;
}

export interface Customer {
  id: string;
  name: string;
  phoneNumber: string;
  customerAddresses: CustomerAddress[];
  totalOrders: number;
  totalSpent: number;
  lastVisit: string | null;
}

export interface CustomerAddress {
  id: number;
  addressDetails: string;
  deliveryZoneId?: number;
  deliveryZoneName?: string;
  deliveryCost?: number;
  latitude?: number;
  longitude?: number;
}

export interface DeliveryZone {
  id: number;
  name: string;
  deliveryCost: number;
  branchId: string;
  coordinates?: string; // JSON polygon array stored as string
}

export interface KitchenStation {
  id: number;
  name: string;
  branchId?: string | null;
}

export interface Staff {
  id: string;
  fullName: string;
  role: string;
  ordersHandled: number;
  rating: number;
  status: string;
  avatar: string;
  employeeCode?: string;
  hasTotp?: boolean;
  /** Only returned immediately after creation — the QR code for FoodRMS TOTP setup */
  qrCodeDataUri?: string;
}

export interface MenuCategory {
  id: number;
  name: string;
  icon: string;
  imageUrl?: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: number;
  imageUrl?: string;
  branchId?: string | null;
  kitchenStationId?: number | null;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  branchId?: string;
  itemsSummary: string;
  totalAmount: number;
  status: string;
  orderType: string;
  createdAt: string;
  isExternalDelivery: boolean;
  driverName?: string;
  driverPhone?: string;
  customerAddress?: string;
  customerLatitude?: number;
  customerLongitude?: number;
  deliveryCost?: number;
  externalCompanyId?: string;
  externalOrderId?: string;
}

export interface RevenuePoint {
  name: string;
  revenue: number;
  expenses: number;
}

export interface HourlyOrders {
  hour: string;
  orders: number;
}

export interface DailyRating {
  day: string;
  rating: number;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  activeTables: number;
  pendingOrders: number;
  preparingOrders: number;
  inKitchenOrders: number;
  deliveryOrders: number;
  completedTodayOrders: number;
  revenueData: RevenuePoint[];
  ordersPerHour: HourlyOrders[];
  weeklyRatings: DailyRating[];
  topItems: any[];
  topBranches?: any[];
  notifications: any[];
}

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface Role {
  id: string;
  name: string;
  departmentId?: string;
  departmentName?: string;
  permissions: string[]; // List of Permission IDs
  staffCount?: number;
}

export interface Department {
  id: string;
  name: string;
  employeeCount?: number;
}

export interface Employee {
  id: string;
  fullName: string;
  mobileNumber?: string;
  departmentId?: string | null;
  departmentName?: string;
  branchId?: string | null;
  branchName?: string;
  roles?: string[];
  status?: string;
  employeeCode?: string;
  isDelivery?: boolean;
  hasTotp?: boolean;
  /** Only returned on creation — QR code for FoodRMS TOTP */
  qrCodeDataUri?: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  maxBranches: number;
  maxEmployees: number;
  features?: string[];
}

export interface SupportTicket {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  messageCount?: number;
  lastMessage?: string;
  messages?: any[];
}


// ── Smart Delivery Routing ─────────────────────────────────────────────────

export interface SuggestedOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerAddress?: string;
  latitude?: number;
  longitude?: number;
  totalAmount: number;
  status: string;
}

export interface SuggestedGroup {
  groupIndex: number;
  label: string;
  avgLatitude?: number;
  avgLongitude?: number;
  avgDistanceKm: number;
  hasCoordinates: boolean;
  orders: SuggestedOrderItem[];
}

export interface DeliveryTrip {
  id: string;
  tripNumber: string;
  driverName: string;
  driverPhone: string;
  status: string; // Pending | InProgress | Completed
  createdAt: string;
  completedAt?: string;
  branchId?: string;
  orders: SuggestedOrderItem[];
  mapsUrl?: string;
}
