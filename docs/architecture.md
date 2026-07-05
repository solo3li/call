# FoodRMS — System Architecture

## Overview

FoodRMS is a **multi-tenant SaaS** platform for restaurant management. Each restaurant chain (called a **Tenant**) gets its own isolated data schema in a shared PostgreSQL database. A single deployment serves all tenants simultaneously.

---

## Component Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                   │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Web Portal   │  │ Branch App   │  │    HQ App            │  │
│  │ (Next.js 15) │  │ (Tauri/Next) │  │  (Tauri/Next)        │  │
│  │  :3001       │  │  Desktop     │  │   Desktop            │  │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                 │                      │              │
│         └─────────────────┴──────────────────────┘             │
│                           │ HTTPS + WebSocket (SignalR)         │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                ┌───────────▼───────────┐
                │   Traefik Ingress     │
                │   (TLS Termination)   │
                └───────────┬───────────┘
                            │
         ┌──────────────────┴──────────────────┐
         │                                      │
┌────────▼────────┐                  ┌──────────▼───────┐
│  FoodRMS.Api    │                  │ FoodRMS.BotWorker │
│  ASP.NET Core 9 │                  │  .NET Worker Svc  │
│  :5109          │◄─ REST ─────────►│  (Telegram Bot)  │
│                 │                  │                   │
│  Controllers    │                  │  Polls Telegram   │
│  SignalR Hubs   │                  │  API every 2s     │
│  Casbin RBAC    │                  │  Ollama LLM       │
└────────┬────────┘                  └──────────┬────────┘
         │                                      │
         │ EF Core                              │ EF Core
         ▼                                      ▼
┌─────────────────────────────────────────────────────┐
│                  PostgreSQL 15                       │
│                                                      │
│  public schema:                                      │
│    Tenants, Plans, Permissions, CasbinRules          │
│                                                      │
│  tenant_{UUID} schemas (per restaurant chain):       │
│    Orders, OrderItems, OrderAudit                    │
│    MenuItems, MenuCategories                         │
│    Branches, Users, Departments                      │
│    Customers, CustomerAddresses                      │
│    BusinessDays, KitchenStations                     │
│    DeliveryZones, SupportTickets                     │
└─────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐     ┌───────────────┐
│   MongoDB       │     │   pgAdmin 4   │
│  (Bot Sessions) │     │  :5050        │
└─────────────────┘     └───────────────┘
```

---

## Request Lifecycle

```
1. Client sends HTTP request with JWT Bearer token
   (or WebSocket upgrade for SignalR)

2. Traefik routes to FoodRMS.Api

3. TenantMiddleware
   → Extracts tenant context from JWT claim "tid"
   → Sets ITenantService.TenantId
   → EF Core ModelBuilder uses HasDefaultSchema("tenant_{tid:N}")

4. JwtBearer validates token (issuer, audience, expiry, signature)

5. TenantAccessMiddleware
   → Checks that the authenticated user belongs to the active tenant
   → 403 if mismatch

6. CasbinAuthorizationHandler
   → Loads permissions for (user, tenant) from in-memory Casbin enforcer
   → Enforces resource:action policies (e.g., "orders:read")

7. Controller / Service processes request

8. Response returned; if order state changed →
   OrderNotifier.NotifyAsync() broadcasts via SignalR to KDS clients
```

---

## Service Dependency Graph

```
AuthService
  ├── UserManager<User>
  ├── ITwoFactorService     (TOTP generation/verification)
  └── ITenantService

OrderService
  ├── FoodRMSDbContext
  ├── IOrderNotifier        (SignalR broadcast)
  └── ITenantService

BranchService / StaffService
  ├── FoodRMSDbContext
  └── Plan limits enforcement (MaxBranches / MaxEmployees)

DeliveryService
  ├── FoodRMSDbContext
  └── DeliveryZone + CustomerAddress resolution

TelegramBotProcessor (BotWorker)
  ├── FoodRmsApiClient      (internal REST calls to FoodRMS.Api)
  ├── OllamaClient          (LLM for natural language order taking)
  └── MongoDB               (bot session state per chat)
```

---

## Inter-Service Communication

| From | To | Protocol | Purpose |
|------|----|----------|---------|
| Web/Desktop clients | FoodRMS.Api | HTTPS REST | CRUD operations |
| Web/Desktop clients | FoodRMS.Api | WebSocket (SignalR) | Real-time order updates |
| FoodRMS.BotWorker | Telegram API | HTTPS (long polling) | Receive bot messages |
| FoodRMS.BotWorker | FoodRMS.Api | HTTPS REST | Place orders, fetch menus |
| FoodRMS.BotWorker | Ollama | HTTPS | LLM inference for NL order parsing |

---

## Technology Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| API Runtime | ASP.NET Core | 9.0 |
| ORM | Entity Framework Core | 9.x |
| Auth | ASP.NET Identity + JWT | — |
| Authorization | Casbin (RBAC with Domains) | — |
| Real-time | SignalR | — |
| Web Framework | Next.js | 15.x |
| UI Library | React | 19.x |
| Styling | Tailwind CSS | 4.x |
| Animations | Framer Motion | 12.x |
| Desktop Shell | Tauri | 2.x |
| Bot Runtime | .NET BackgroundService | 9.0 |
| LLM | Ollama (local) | — |
| Primary DB | PostgreSQL | 15 |
| Bot State DB | MongoDB | latest |
| Dev DB | SQLite | — |
| Container | Docker + Docker Compose | — |
| Orchestration | Kubernetes + Helm | — |
| Ingress | Traefik | — |
