# FoodRMS — Data Model

## Entity Overview

All entities live in PostgreSQL. Global entities are in the `public` schema. Tenant-specific entities are in `tenant_{tenantId:N}` schemas.

---

## Schema Assignment

| Schema | Entities |
|--------|----------|
| `public` | `Tenants`, `Plans`, `Permissions`, `RolePermissions`, `CasbinRules` |
| `tenant_{UUID}` | Everything else (Orders, Users, Branches, Menu, Customers, etc.) |

---

## Entity Relationship Diagram

```
public schema
─────────────
Plans ──────────────────────────────────────────────────────┐
  id, name, price, maxBranches, maxEmployees, isCustom       │
                                                             ▼
Tenants ─────────────────────────────────────────── PlanId (FK)
  id, name, subdomain, createdAt, isActive
  planId (→ Plans)
  currencyId (→ Currencies)
  telegramBotToken, telegramBotUsername, telegramBotStatus


tenant_{UUID} schema
────────────────────

Currencies
  id, code, name, symbol, decimalPlaces

Branches
  id, name, tenantId (→ Tenants)
  [soft boundary: each user/order may belong to one branch]

Departments
  id, name, tenantId

Users (extends ASP.NET Identity IdentityUser<Guid>)
  id, fullName, email, passwordHash, ...
  tenantId (→ Tenants)
  branchId (→ Branches)
  departmentId (→ Departments)
  role, status (Available|Busy|Offline)
  ordersHandled, rating
  employeeCode
  isDelivery
  totpSecretKey    ← Base32 TOTP secret (employees only)

KitchenStations
  id, name, tenantId

MenuCategories
  id, name, tenantId

MenuItems
  id, name, description, price, imageUrl
  categoryId (→ MenuCategories)
  kitchenStationId (→ KitchenStations)
  isAvailable, tenantId

Customers
  id, name, phone, email, tenantId
  addresses → [CustomerAddresses]

CustomerAddresses
  id, customerId (→ Customers)
  addressLine, city, district, latitude, longitude
  deliveryZoneId (→ DeliveryZones)

DeliveryZones
  id, name, extraCost, tenantId

BusinessDays
  id, openedAt, closedAt, isClosed, tenantId, branchId

Orders ──────────────────────────────────────────────────────┐
  id (Guid, PK)                                              │
  dailySequenceNumber                                        │
  orderNumber (string, e.g. "ORD-001")                      │
  customerName, itemsSummary                                 │
  totalAmount, deliveryCost                                  │
  status: Pending | Preparing | Ready | Delivering | Done   │
  orderType: DineIn | Delivery | Takeaway                   │
  kitchenNotes                                               │
  isRecurring                                                │
  rating (1–5)                                               │
  driverName, driverPhone (set on Delivering)               │
  createdAt                                                  │
  businessDayId (→ BusinessDays)                            │
  branchId (→ Branches)                                     │
  customerId (→ Customers)                                   │
  customerAddressId (→ CustomerAddresses)                   │
  staffId (→ Users)                                         │
  tenantId (→ Tenants)                                      │
  items → [OrderItems]                                      │
                                                             │
OrderItems ──────────────────────────────────────────────────┘
  id, orderId (→ Orders)
  menuItemId (→ MenuItems)
  name (snapshot), quantity, unitPrice, notes
  status: Pending | Preparing | Ready (OrderItemStatus enum)

OrderAudit
  id, orderId (→ Orders)
  action, performedBy, timestamp, details

AppRoles (extends IdentityRole<Guid>)
  standard ASP.NET Identity role

CasbinRules
  id, pType, v0–v5
  [RBAC policies stored in DB, loaded into singleton enforcer at startup]

SupportTickets
  id, subject, status, tenantId, branchId
  messages → [SupportMessages]

SupportMessages
  id, ticketId, senderName, body, createdAt, isFromStaff
```

---

## Key Relationships Summary

```
Tenant 1 ────── * User
Tenant 1 ────── * Branch
Tenant 1 ────── * Order
Tenant 1 ────── 1 Plan (subscription)
Tenant 1 ────── 1 Currency

Branch 1 ────── * User
Branch 1 ────── * Order
Branch 1 ────── * BusinessDay

BusinessDay 1 ── * Order

Order 1 ────── * OrderItem
Order * ────── 1 Customer (optional)
Order * ────── 1 CustomerAddress (delivery orders)
Order * ────── 1 Staff/User (assigned waiter/cashier)

OrderItem * ─── 1 MenuItem
MenuItem * ──── 1 MenuCategory
MenuItem * ──── 1 KitchenStation (optional)

Customer 1 ──── * CustomerAddress
CustomerAddress * ─ 1 DeliveryZone
```

---

## Status Enumerations

### Order Status Flow

```
Pending → Preparing → Ready → Delivering (delivery only) → Done
                            ↘ Done (dine-in / takeaway)
```

### User Status
- `Available` — ready to take orders
- `Busy` — currently handling an order
- `Offline` — clocked out

### Telegram Bot Status (per Tenant)
- `Inactive` — bot not configured
- `Active` — bot running and polling
- `Error` — bot token invalid or API error

---

## Multi-Tenancy Isolation

- All tenant-schema entities implement `ITenantEntity`:
  ```csharp
  public interface ITenantEntity {
      Guid TenantId { get; set; }
  }
  ```
- EF Core `HasDefaultSchema($"tenant_{tenantId:N}")` is applied dynamically per request via `IModelCacheKeyFactory`.
- The global `Tenants` and `Plans` tables in `public` schema are always reachable without schema switching.
