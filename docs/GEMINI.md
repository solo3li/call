<!-- SPECKIT START -->
- Current Plan: [specs/001-restaurant-saas-backend/plan.md](specs/001-restaurant-saas-backend/plan.md)
<!-- SPECKIT END -->

## Multitenancy Architecture

- **Schema-per-tenant:** Each tenant has its own dedicated schema in the database (e.g. `tenant_550e8400...`). The `IModelCacheKeyFactory` caches models per tenant, and EF Core's `modelBuilder.HasDefaultSchema` is dynamically set based on the active `TenantId`.
- **Global Data:** The `Tenants` and `Permissions` tables are strictly mapped to the `public` schema.
- **Template-based Provisioning & Incremental Migrations:** Migrations are generated against a `template_tenant` schema by default. At runtime or when provisioning a new tenant, the `ITenantService` sets the tenant context and `context.Database.MigrateAsync()` is executed. This applies EF Core incremental migrations seamlessly to each tenant's schema.

## Subscription Plans and Limits

- **Plan Entity:** A global `Plan` entity handles the subscription logic (`MaxBranches`, `MaxEmployees`, `Price`).
- **Tenant Integration:** The `Tenant` entity includes an optional `PlanId` that links to the selected `Plan`.
- **Enforcement:** Service layer operations (e.g. `BranchService.CreateAsync`, `StaffService.CreateAsync`) automatically pull the current tenant's limits and prevent exceeding the maximum allowed branches and employees, returning `InvalidOperationException` mapped to `400 BadRequest` in API Controllers.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
