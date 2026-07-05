# FoodRMS — Multi-Tenancy Architecture

## Concept: Schema-Per-Tenant

FoodRMS uses **PostgreSQL schema isolation** to separate tenant data. Each registered restaurant chain owns a dedicated schema named `tenant_{tenantId:N}` (tenant UUID with no dashes).

This means:
- Zero risk of cross-tenant data leakage at the database level.
- Migrations can be applied per tenant independently.
- The `public` schema holds only global (cross-tenant) data: `Tenants`, `Plans`, `Permissions`, `CasbinRules`.

---

## How the Tenant Context Is Established

### 1. JWT Token Contains Tenant ID

When a user logs in, the JWT payload includes a `tid` claim with the tenant's `Guid`:

```json
{
  "sub": "user-uuid",
  "tid": "550e8400-e29b-41d4-a716-446655440000",
  "exp": 1234567890
}
```

### 2. `TenantMiddleware` Extracts the Claim

```csharp
// Middleware/TenantMiddleware.cs
public class TenantMiddleware
{
    public async Task InvokeAsync(HttpContext context, ITenantService tenantService)
    {
        var tidClaim = context.User.FindFirst("tid")?.Value;
        if (Guid.TryParse(tidClaim, out var tenantId))
            tenantService.TenantId = tenantId;
        await _next(context);
    }
}
```

### 3. `ITenantService` Holds the Scoped Tenant Context

```csharp
public interface ITenantService {
    Guid TenantId { get; set; }
}

// Registered as Scoped — one instance per HTTP request
builder.Services.AddScoped<ITenantService, TenantService>();
```

### 4. EF Core Uses `IModelCacheKeyFactory`

The `TenantModelCacheKeyFactory` ensures EF Core compiles a **separate model** (with the correct schema) per tenant:

```csharp
public class TenantModelCacheKeyFactory : IModelCacheKeyFactory
{
    public object Create(DbContext context, bool designTime)
    {
        var tenantService = /* resolve from context */;
        return (context.GetType(), tenantService.TenantId, designTime);
    }
}
```

Inside `FoodRMSDbContext.OnModelCreating`:
```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    var tenantId = _tenantService.TenantId;
    if (tenantId != Guid.Empty)
        modelBuilder.HasDefaultSchema($"tenant_{tenantId:N}");
    else
        modelBuilder.HasDefaultSchema("public");
    
    // Map Tenants + Plans to public schema explicitly
    modelBuilder.Entity<Tenant>().ToTable("Tenants", "public");
    modelBuilder.Entity<Plan>().ToTable("Plans", "public");
    // ...
}
```

---

## Tenant Provisioning

When a new restaurant registers:

1. A new `Tenant` row is inserted into `public.Tenants`.
2. The `ITenantService` sets the new tenant context.
3. `context.Database.MigrateAsync()` is called — EF Core applies **all pending migrations** to the new `tenant_{UUID}` schema.
4. `DbInitializer.SeedAsync()` seeds default roles, Casbin policies, and optionally demo data.

This pattern means **no manual SQL scripts** are needed for tenant provisioning. The EF Core migration history for each schema is tracked in `tenant_{UUID}.__EFMigrationsHistory`.

---

## Middleware Pipeline (Tenant-Aware)

```
Request
  │
  ├─ TenantMiddleware         ← sets ITenantService.TenantId from JWT "tid"
  ├─ JwtBearer Authentication ← validates token signature/expiry
  ├─ TenantAccessMiddleware   ← ensures user.TenantId == ITenantService.TenantId
  └─ CasbinAuthorizationHandler ← enforces (user, tenant) → resource:action
```

`TenantAccessMiddleware` is a security layer that prevents token reuse across tenants. Even if an attacker has a valid JWT for Tenant A, they cannot send it to endpoints scoped to Tenant B.

---

## Subscription Plans & Limits

### The `Plan` Entity

```csharp
public class Plan {
    public Guid Id { get; set; }
    public string Name { get; set; }
    public decimal Price { get; set; }
    public int MaxBranches { get; set; }
    public int MaxEmployees { get; set; }
    public bool IsCustom { get; set; }
}
```

### Enforcement Points

**`BranchService.CreateAsync`:**
```csharp
var tenant = await _db.Tenants
    .Include(t => t.Plan)
    .FirstAsync(t => t.Id == tenantId);

var currentCount = await _db.Branches.CountAsync(b => b.TenantId == tenantId);
if (currentCount >= tenant.Plan.MaxBranches)
    throw new InvalidOperationException("Branch limit reached for your subscription plan.");
```

**`StaffService.CreateAsync`:**
```csharp
var currentCount = await _db.Users.CountAsync(u => u.TenantId == tenantId);
if (currentCount >= tenant.Plan.MaxEmployees)
    throw new InvalidOperationException("Employee limit reached for your subscription plan.");
```

Both exceptions are caught in the API controller and mapped to `400 Bad Request`.

---

## Development Database

In development (`UseSqlite: true`), a single SQLite file (`foodrms_shared.db`) is used. There is no schema separation in SQLite; the multi-schema behavior is a PostgreSQL production feature. The SQLite dev mode supports rapid iteration without a running Postgres instance.

---

## Key Config Flags

```json
// appsettings.json
{
  "UseSqlite": true,        // true = SQLite dev mode
  "UseInMemoryDatabase": false, // true = in-memory (test/CI)
  "ConnectionStrings": {
    "DefaultConnection": "Host=db;Database=foodrms;..."
  }
}
```
