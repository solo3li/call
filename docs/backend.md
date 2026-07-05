# FoodRMS — Backend (FoodRMS.Api)

## Project Structure

```
project/backend/src/FoodRMS.Api/
├── Program.cs                        ← App entry point, DI container, middleware pipeline
├── FoodRMS.Api.csproj
├── appsettings.json
├── appsettings.Development.json
│
├── Areas/
│   ├── Admin/                        ← Razor MVC super-admin area
│   │   ├── Controllers/
│   │   ├── Models/
│   │   └── Views/
│   └── Api/                          ← REST API area
│       ├── Controllers/              ← All API controllers (18 total)
│       └── DTOs/                     ← Request/response data transfer objects
│
├── Controllers/
│   └── BotIntegrationController.cs  ← Webhook endpoint for Telegram
│
├── Data/
│   └── FoodRMSDbContext.cs           ← EF Core DbContext
│
├── Entities/                         ← Domain entities (24 files)
│   ├── Order.cs, OrderItem.cs, OrderAudit.cs, OrderItemStatus.cs
│   ├── MenuItem.cs, MenuCategory.cs
│   ├── Branch.cs, BusinessDay.cs
│   ├── User.cs, AppRole.cs, UserTenant.cs
│   ├── Customer.cs, CustomerAddress.cs, DeliveryZone.cs
│   ├── KitchenStation.cs, Department.cs
│   ├── Tenant.cs, Plan.cs, Currency.cs
│   ├── Permission.cs, RolePermission.cs, CasbinRule.cs
│   └── SupportTicket.cs, SupportMessage.cs
│
├── Hubs/
│   ├── OrderHub.cs                   ← SignalR hub for KDS real-time updates
│   └── SupportHub.cs                 ← SignalR hub for support chat
│
├── Infrastructure/
│   ├── Authorization/
│   │   ├── CasbinAuthorizationHandler.cs
│   │   ├── CasbinPolicyLoader.cs
│   │   ├── CasbinPolicySeeder.cs
│   │   ├── CasbinRequirement.cs
│   │   └── rbac_with_domains_model.conf
│   └── Services/                     ← Core business logic services (11 files)
│       ├── AuthService.cs
│       ├── OrderService.cs
│       ├── MenuService.cs
│       ├── BranchService.cs
│       ├── StaffService.cs
│       ├── CustomerService.cs
│       ├── DeliveryService.cs
│       ├── PlanService.cs
│       ├── TenantService.cs
│       ├── TenantAccessService.cs
│       └── TwoFactorService.cs
│
├── Interfaces/                       ← Service interfaces
├── Middleware/
│   ├── TenantMiddleware.cs
│   └── TenantAccessMiddleware.cs
├── Migrations/                       ← EF Core migration files
└── Services/
    └── OrderNotifier.cs              ← SignalR broadcast wrapper
```

---

## Program.cs — Service Registration

The `Program.cs` configures all dependencies in this order:

1. **Controllers + Swagger**
2. **Multi-tenancy services** (`ITenantService`, cache)
3. **Business logic services** (Auth, Order, Menu, Branch, Staff, Customer, Delivery, Plan, TOTP)
4. **EF Core DbContext** — dynamically schema-aware (PostgreSQL) or SQLite/InMemory (dev)
5. **ASP.NET Identity** (on `User`, `AppRole`)
6. **JWT Bearer Authentication**
7. **Casbin Authorization** — singleton `IEnforcer` + scoped `CasbinAuthorizationHandler`
8. **SignalR** — `OrderHub`, `SupportHub`
9. **CORS** — `AllowAll` policy (origin-agnostic with credentials for dev/docker)
10. **K8s HTTP client** — internal cluster communication

---

## Controllers Reference

All API controllers live in `Areas/Api/Controllers/` and are prefixed with `[Area("Api")]`.

| Controller | Route | Key Operations |
|------------|-------|----------------|
| `AuthController` | `/api/auth` | login, totp-login, register, refresh |
| `OrdersController` | `/api/orders` | CRUD orders, status updates, ratings |
| `MenuController` | `/api/menu` | categories + items CRUD |
| `BranchesController` | `/api/branches` | branch CRUD with plan limit check |
| `EmployeesController` | `/api/employees` | staff CRUD, TOTP QR, status |
| `StaffController` | `/api/staff` | staff lookup by branch/role |
| `CustomersController` | `/api/customers` | customer + address CRUD |
| `DeliveryController` | `/api/delivery` | zones + driver assignment |
| `DashboardController` | `/api/dashboard` | KPIs, charts, staff performance |
| `BusinessDaysController` | `/api/business-days` | open/close business day |
| `RolesController` | `/api/roles` | custom roles + Casbin permission management |
| `TenantSettingsController` | `/api/tenant-settings` | tenant config + Telegram bot |
| `KitchenStationsController` | `/api/kitchen-stations` | kitchen station CRUD |
| `DepartmentsController` | `/api/departments` | department CRUD |
| `CurrenciesController` | `/api/currencies` | currency selection |
| `PlansController` | `/api/plans` | list subscription plans |
| `SupportController` | `/api/support` | support tickets + messages |
| `TelegramBotController` | `/api/telegram` | bot webhook + inline query handling |

---

## Key Services

### `AuthService`

Located at `Infrastructure/Services/AuthService.cs` (28 KB — most complex service).

Responsibilities:
- Password-based login → JWT issuance
- TOTP-based employee login (via `ITwoFactorService`)
- Tenant registration and provisioning
- Token refresh
- Role assignment on registration

### `OrderService`

Located at `Infrastructure/Services/OrderService.cs` (25 KB — second most complex).

Responsibilities:
- Create orders with item lines
- Update order/item status
- Calculate totals, daily sequence numbers
- Trigger `IOrderNotifier` on every status change
- Delivery cost computation based on `DeliveryZone`

### `OrderNotifier`

A **singleton** (not scoped) because SignalR `IHubContext` is singleton-safe.

```csharp
public class OrderNotifier : IOrderNotifier
{
    private readonly IHubContext<OrderHub> _hub;
    
    public async Task NotifyAsync(Guid tenantId, string eventName, object payload)
    {
        await _hub.Clients.Group(tenantId.ToString())
                  .SendAsync(eventName, payload);
    }
}
```

KDS/POS clients join the `tenantId` group on connection, receiving only their restaurant's events.

### `TwoFactorService`

Handles TOTP secret generation and code verification using RFC 6238 compatible algorithms. Secrets are stored Base32-encoded on the `User.TotpSecretKey` field.

---

## Database

### `FoodRMSDbContext`

The context is schema-aware:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    var tenantId = _tenantService.TenantId;
    var schema = tenantId != Guid.Empty
        ? $"tenant_{tenantId:N}"
        : "public";
    
    modelBuilder.HasDefaultSchema(schema);
    
    // Pin global tables to public always
    modelBuilder.Entity<Tenant>().ToTable("Tenants", "public");
    modelBuilder.Entity<Plan>().ToTable("Plans", "public");
}
```

### `DbInitializer`

Seeds:
- Default `Plan` records (e.g., Basic, Pro, Enterprise)
- Default `AppRole` records (Owner, Manager, Cashier, Kitchen, etc.)
- An initial admin `Tenant` and `User` for the super-admin area
- Casbin policies for each default role

---

## SignalR Hubs

### `OrderHub`

```csharp
[Authorize]
public class OrderHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        var tenantId = Context.User?.FindFirst("tid")?.Value;
        if (tenantId != null)
            await Groups.AddToGroupAsync(Context.ConnectionId, tenantId);
        await base.OnConnectedAsync();
    }
}
```

Group key = `tenantId` → tenant isolation at the SignalR layer too.

### `SupportHub`

Similar grouping pattern. Also supports joining per-ticket rooms for real-time ticket chat.

---

## Middleware Pipeline Order

```
UseStaticFiles
UseCors("AllowAll")
UseMiddleware<TenantMiddleware>      ← sets ITenantService.TenantId from JWT
UseAuthentication                    ← validates JWT
UseMiddleware<TenantAccessMiddleware> ← cross-tenant guard
UseAuthorization                     ← Casbin policy check
MapControllers
MapHub<OrderHub>("/api/orderHub")
MapHub<SupportHub>("/api/supportHub")
```

---

## The `BotWorker` Companion (Separate Project)

Located at `backend/src/FoodRMS.BotWorker/`. Documented separately in [bot-worker.md](./bot-worker.md). It is deployed as an independent container and calls `FoodRMS.Api` internally over the Docker network.
