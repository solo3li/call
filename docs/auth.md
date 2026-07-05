# FoodRMS — Authentication & Authorization

## Overview

FoodRMS uses a layered security model:

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Identity | ASP.NET Identity + JWT | User registration, password login, token issuance |
| TOTP | Custom Base32 TOTP | Passwordless login for kitchen/POS employees |
| Tenant Isolation | `TenantAccessMiddleware` | Prevent cross-tenant token reuse |
| Authorization | Casbin RBAC with Domains | Resource-level permission enforcement per tenant |

---

## 1. JWT Authentication

### Token Issuance

Tokens are issued by `AuthService` after verifying credentials. The JWT payload contains:

```json
{
  "sub": "<userId>",
  "tid": "<tenantId>",
  "role": "Owner",
  "exp": <unix_timestamp>,
  "iss": "FoodRMS",
  "aud": "FoodRMS"
}
```

Key claim: **`tid`** — this is how `TenantMiddleware` knows which tenant schema to activate.

### Configuration

```json
// appsettings.json
{
  "Jwt": {
    "Key": "super_secret_key_that_is_long_enough_123",
    "Issuer": "FoodRMS",
    "Audience": "FoodRMS",
    "ExpiryMinutes": 1440
  }
}
```

### SignalR Token Passthrough

SignalR connections cannot use Authorization headers in browser environments. FoodRMS passes the JWT as a query parameter:

```
wss://api.foodrms.com/api/orderHub?access_token=<jwt>
```

The `JwtBearerEvents.OnMessageReceived` handler reads it:

```csharp
OnMessageReceived = context => {
    var accessToken = context.Request.Query["access_token"];
    var path = context.HttpContext.Request.Path;
    if (!string.IsNullOrEmpty(accessToken) &&
        (path.StartsWithSegments("/api/orderHub") ||
         path.StartsWithSegments("/api/supportHub")))
        context.Token = accessToken;
    return Task.CompletedTask;
}
```

---

## 2. TOTP Authentication (Employee Passwordless Login)

Kitchen staff and cashiers authenticate using a **Time-based One-Time Password (TOTP)** instead of a password. This is optimized for fast login on touchscreens.

### Flow

```
1. Employee is created → TotpSecretKey generated (Base32, stored on User entity)
2. Manager scans QR code → employee TOTP app seeded
3. Employee enters 6-digit code on KDS/POS login screen
4. Server: ITwoFactorService.VerifyTotp(user.TotpSecretKey, enteredCode)
5. If valid → JWT issued (same flow as password login)
```

### `User.TotpSecretKey`

```csharp
/// <summary>
/// Base32-encoded TOTP secret key for FoodRMS TOTP.
/// Generated when an employee is created; null for owners/managers
/// who use password login.
/// </summary>
public string? TotpSecretKey { get; set; }
```

### The TOTP Microservice

There is a separate containerized TOTP utility (`/TOTP`) running at `:8082` used internally for QR code generation and verification during development/testing.

---

## 3. Tenant Access Middleware

After JWT validation, `TenantAccessMiddleware` runs a critical check:

```csharp
// Pseudo-code of TenantAccessMiddleware
var userTenantId = context.User.FindFirst("tid")?.Value;
var activeTenantId = tenantService.TenantId.ToString();

if (userTenantId != activeTenantId) {
    context.Response.StatusCode = 403;
    return;
}
```

This prevents scenarios where:
- A user from Tenant A presents their token to a Tenant B endpoint.
- A compromised token from one tenant is replayed against another.

---

## 4. Casbin RBAC Authorization

### Model

FoodRMS uses **RBAC with Domains** (Casbin model `rbac_with_domains_model.conf`):

```
[request_definition]
r = sub, dom, obj, act

[policy_definition]
p = sub, dom, obj, act

[role_definition]
g = _, _, _   # user, role, domain(tenant)

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub, r.dom) && r.dom == p.dom && r.obj == p.obj && (r.act == p.act || p.act == "*")
```

- **sub**: user ID or role name
- **dom**: tenant ID (the domain)
- **obj**: resource (`orders`, `menu`, `staff`, `branches`, `roles`, `dashboard`)
- **act**: action (`read`, `write`, `*`)

### Defined Policies

| Policy Name | Resource | Action |
|-------------|----------|--------|
| `orders.read` | `orders` | `read` |
| `orders.write` | `orders` | `write` |
| `menu.read` | `menu` | `read` |
| `menu.write` | `menu` | `write` |
| `staff.manage` | `staff` | `*` |
| `branches.manage` | `branches` | `*` |
| `roles.manage` | `roles` | `*` |
| `dashboard.read` | `dashboard` | `read` |

### Usage on Controllers

```csharp
[Authorize(Policy = "orders.write")]
[HttpPost]
public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
{ ... }
```

### Policy Storage

`CasbinRules` are stored in the database and loaded into a singleton `IEnforcer` at startup:

```csharp
await CasbinPolicySeeder.SeedAsync(services);
await CasbinPolicyLoader.LoadPoliciesFromDbAsync(enforcer, services);
```

This means policy changes require either an API call to reload or a service restart (depending on implementation).

---

## 5. Password Policy

ASP.NET Identity is configured with relaxed rules suitable for restaurant operators:

```csharp
options.Password.RequireDigit = false;
options.Password.RequiredLength = 6;
options.Password.RequireNonAlphanumeric = false;
options.Password.RequireUppercase = false;
```

---

## 6. Default Roles

Seeded by `DbInitializer`:

| Role | Description |
|------|-------------|
| `Owner` | Full access to all resources |
| `Manager` | Branch-level management, no billing |
| `Cashier` | POS + order creation |
| `Kitchen` | KDS read + order status updates |
| `Delivery` | Delivery driver view |
| `Waiter` | Order creation, table management |

Each role's Casbin policies are seeded in `CasbinPolicySeeder`.

---

## 7. Admin Area

The `Areas/Admin` controllers provide a server-rendered Razor/MVC interface for super-admin operations (tenant management, system-level configuration). These routes are prefixed with `/Admin` and redirect unauthenticated requests to the admin login page.

```csharp
app.MapGet("/", () => Results.Redirect("/Admin"));
```
