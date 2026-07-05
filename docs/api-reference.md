# FoodRMS — Backend API Reference

## Base URL

- **Development:** `http://localhost:5109`
- **Production:** `https://api.<subdomain>.foodrms.com`

All endpoints under `/api/...` require a valid JWT `Authorization: Bearer <token>` header unless marked as public.

---

## Authentication Endpoints

### `POST /api/auth/login`
**Public** — Password-based login for owners and managers.

**Request:**
```json
{
  "email": "owner@restaurant.com",
  "password": "password123"
}
```

**Response `200`:**
```json
{
  "token": "<jwt>",
  "user": {
    "id": "...",
    "fullName": "Ahmed",
    "role": "Owner",
    "tenantId": "..."
  }
}
```

---

### `POST /api/auth/totp-login`
**Public** — TOTP-based login for kitchen/cashier employees.

**Request:**
```json
{
  "employeeCode": "EMP-001",
  "totpCode": "123456",
  "tenantSubdomain": "my-restaurant"
}
```

**Response `200`:** Same structure as password login.

---

### `POST /api/auth/register`
**Public** — Register a new tenant (restaurant chain).

**Request:**
```json
{
  "restaurantName": "Burger Station",
  "ownerName": "Ahmed Mohamed",
  "email": "ahmed@burgerstation.com",
  "password": "secret123",
  "planId": "..."
}
```

**Response `200`:** Returns JWT and tenant info.

---

### `POST /api/auth/refresh`
Refresh an expiring JWT token.

---

## Orders

Base path: `/api/orders` — Policy: `orders.read` / `orders.write`

### `GET /api/orders`
Get all orders for the active tenant (optionally filtered by branch, date, status).

**Query params:** `branchId`, `status`, `date`, `orderType`

**Response:**
```json
[
  {
    "id": "...",
    "orderNumber": "ORD-001",
    "customerName": "Walid",
    "status": "Pending",
    "orderType": "DineIn",
    "totalAmount": 150.00,
    "items": [ ... ],
    "createdAt": "2026-05-31T10:00:00Z"
  }
]
```

---

### `POST /api/orders`
Create a new order. Policy: `orders.write`

**Request:**
```json
{
  "customerName": "Walid",
  "orderType": "Delivery",
  "branchId": "...",
  "customerId": "...",
  "customerAddressId": 1,
  "kitchenNotes": "No onions",
  "items": [
    { "menuItemId": "...", "quantity": 2, "notes": "" }
  ]
}
```

**Response `201`:** The created order object.

**Side effect:** `IOrderNotifier.NotifyAsync()` broadcasts `OrderCreated` to all connected KDS/POS SignalR clients.

---

### `PUT /api/orders/{id}/status`
Update order status. Policy: `orders.write`

**Request:**
```json
{ "status": "Preparing" }
```

**Status transitions allowed:**
```
Pending → Preparing → Ready → Delivering → Done
```

**Side effect:** SignalR broadcast `OrderStatusChanged`.

---

### `PUT /api/orders/{id}/rate`
Submit a customer rating (1–5 stars).

**Request:** `{ "rating": 5 }`

---

### `GET /api/orders/{id}`
Get a single order by ID.

---

## Menu

Base path: `/api/menu` — Policy: `menu.read` / `menu.write`

### `GET /api/menu`
Get all menu categories with items.

### `POST /api/menu/categories`
Create a new menu category.

### `POST /api/menu/items`
Create a new menu item.

```json
{
  "name": "Chicken Burger",
  "price": 35.00,
  "categoryId": "...",
  "kitchenStationId": "...",
  "imageUrl": "https://...",
  "isAvailable": true
}
```

### `PUT /api/menu/items/{id}`
Update a menu item.

### `DELETE /api/menu/items/{id}`
Remove a menu item.

---

## Branches

Base path: `/api/branches` — Policy: `branches.manage`

### `GET /api/branches`
List all branches for the tenant.

### `POST /api/branches`
Create a new branch.

> **Limit Enforcement:** Returns `400` if `MaxBranches` limit is reached for the tenant's plan.

### `PUT /api/branches/{id}`
Update branch details.

### `DELETE /api/branches/{id}`
Delete a branch.

---

## Staff / Employees

Base path: `/api/employees` — Policy: `staff.manage`

### `GET /api/employees`
List all employees (users) for the tenant.

### `POST /api/employees`
Create a new employee.

```json
{
  "fullName": "Khalid Mahmoud",
  "email": "khalid@restaurant.com",
  "role": "Kitchen",
  "branchId": "...",
  "departmentId": "...",
  "isDelivery": false
}
```

> **Returns:** Created user + generated `employeeCode` + `totpQrCodeUrl`

> **Limit Enforcement:** Returns `400` if `MaxEmployees` limit reached.

### `GET /api/employees/{id}/totp-qr`
Get the TOTP QR code for an employee (for scanning with authenticator app).

### `PUT /api/employees/{id}/status`
Update employee status (`Available`, `Busy`, `Offline`).

---

## Customers

Base path: `/api/customers`

### `GET /api/customers`
List all customers.

### `POST /api/customers`
Create a customer with optional address.

### `GET /api/customers/{id}/addresses`
Get delivery addresses for a customer.

### `POST /api/customers/{id}/addresses`
Add a delivery address.

---

## Delivery

Base path: `/api/delivery`

### `GET /api/delivery/zones`
List delivery zones for the tenant.

### `POST /api/delivery/zones`
Create a delivery zone with optional extra cost.

### `PUT /api/orders/{id}/assign-driver`
Assign a delivery driver to an order.

```json
{
  "driverName": "Fahad",
  "driverPhone": "+966501234567"
}
```

---

## Dashboard

Base path: `/api/dashboard` — Policy: `dashboard.read`

### `GET /api/dashboard/stats`
Returns KPIs: total revenue, order count, top items, ratings.

### `GET /api/dashboard/orders-over-time`
Returns time-series revenue/order data for charts.

### `GET /api/dashboard/top-items`
Returns best-selling menu items.

### `GET /api/dashboard/staff-performance`
Returns per-employee stats (orders handled, ratings).

---

## Business Days

Base path: `/api/business-days`

### `POST /api/business-days/open`
Open a new business day for a branch.

### `POST /api/business-days/close`
Close the current business day.

### `GET /api/business-days/current`
Get the currently open business day.

---

## Roles & Permissions

Base path: `/api/roles` — Policy: `roles.manage`

### `GET /api/roles`
List all roles for the tenant.

### `POST /api/roles`
Create a custom role.

### `PUT /api/roles/{roleId}/permissions`
Update Casbin permissions for a role.

```json
{
  "permissions": ["orders:read", "orders:write", "menu:read"]
}
```

---

## Tenant Settings

Base path: `/api/tenant-settings`

### `GET /api/tenant-settings`
Get current tenant configuration (name, currency, bot status, etc.).

### `PUT /api/tenant-settings`
Update tenant settings.

### `PUT /api/tenant-settings/telegram-bot`
Configure the Telegram bot token for the tenant.

### `POST /api/tenant-settings/telegram-bot/activate`
Activate the Telegram bot.

---

## Plans

Base path: `/api/plans` — Public

### `GET /api/plans`
List all available subscription plans.

---

## Kitchen Stations

Base path: `/api/kitchen-stations`

### `GET /api/kitchen-stations`
List all kitchen stations for the tenant.

### `POST /api/kitchen-stations`
Create a new kitchen station (e.g., "Grill", "Cold Station").

---

## Support

Base path: `/api/support`

### `GET /api/support/tickets`
List support tickets for the tenant.

### `POST /api/support/tickets`
Open a new support ticket.

### `POST /api/support/tickets/{id}/messages`
Add a message to a support ticket.

---

## Real-Time — SignalR Hubs

### Order Hub — `/api/orderHub`

Connect with JWT via query string:
```
wss://api.foodrms.com/api/orderHub?access_token=<jwt>
```

**Events received by clients:**

| Event | Payload | When |
|-------|---------|------|
| `OrderCreated` | Order object | New order placed |
| `OrderStatusChanged` | `{ orderId, newStatus }` | Status updated |
| `OrderItemStatusChanged` | `{ orderId, itemId, status }` | Item-level status update |

### Support Hub — `/api/supportHub`

```
wss://api.foodrms.com/api/supportHub?access_token=<jwt>
```

**Events:**

| Event | Payload |
|-------|---------|
| `NewMessage` | Support message object |
| `TicketStatusChanged` | `{ ticketId, status }` |

---

## Swagger UI

Available at: `http://localhost:5109/api/swagger`
