# FoodRMS — Deployment Guide

## Overview

FoodRMS supports two deployment modes:

| Mode | When | Tools |
|------|------|-------|
| **Local / Dev** | Development and testing | Docker Compose |
| **Production** | Live restaurants | Kubernetes + Helm + Traefik |

---

## Development with Docker Compose

### Prerequisites
- Docker + Docker Compose
- Node.js 22+ (for local frontend dev)
- .NET 9 SDK (for local backend dev)

### Services (docker-compose.yml)

| Service | Port | Description |
|---------|------|-------------|
| `db` | 5432 | PostgreSQL 15 |
| `backend` | 5109 | FoodRMS.Api (ASP.NET Core) |
| `frontend` | 3001 | Web portal (nginx) |
| `botworker` | — | Telegram Bot Worker |
| `pgadmin` | 5050 | pgAdmin 4 UI |
| `totp` | 8082 | TOTP utility service |
| `ollama` | 11434 | Local LLM (Ollama) |
| `mongodb` | 27017 | MongoDB (bot sessions) |

### Start Everything

```bash
cd project/
docker-compose up -d
```

### Start Backend Only (with local SQLite)

```bash
cd project/backend/src/FoodRMS.Api
# Edit appsettings.json: UseSqlite: true
dotnet run
```

### Start Frontend Only

```bash
cd project/frontend
npm install
npm run dev
# → http://localhost:3000
```

### Access Points (Dev)

| URL | Service |
|-----|---------|
| `http://localhost:3001` | Web portal |
| `http://localhost:5109` | API |
| `http://localhost:5109/api/swagger` | Swagger UI |
| `http://localhost:5050` | pgAdmin |
| `http://localhost:8082` | TOTP service |

---

## Production Deployment (Kubernetes)

### Prerequisites
- Kubernetes cluster (k3s or managed K8s)
- Helm 3
- Traefik ingress controller
- cert-manager (for TLS)

### Helm Chart

```
project/helm/
├── Chart.yaml
├── values.yaml
└── templates/
    ├── backend-deployment.yaml
    ├── frontend-deployment.yaml
    ├── botworker-deployment.yaml
    ├── ingress.yaml
    └── secrets.yaml
```

### Deploy with Helm

```bash
cd project/helm/

helm upgrade --install foodrms . \
  --set backend.image=ghcr.io/org/foodrms-api:latest \
  --set frontend.image=ghcr.io/org/foodrms-frontend:latest \
  --set botworker.image=ghcr.io/org/foodrms-botworker:latest \
  --set postgresql.host=your-postgres-host \
  --set postgresql.password=your-password \
  --namespace foodrms \
  --create-namespace
```

### Kubernetes Objects

| Object | File | Description |
|--------|------|-------------|
| Ingress (Traefik) | `k8s-dashboard-ingressroute-tls.yaml` | TLS IngressRoute for dashboard |
| Ingress (Standard) | `k8s-dashboard-standard-ingress.yaml` | Standard K8s Ingress |
| RBAC | `kubernetes-rbac.yaml` | ServiceAccount + ClusterRoleBinding |
| TLS Cert | `k8s-dashboard-cert.yaml` | cert-manager Certificate |
| TOTP Ingress | `totp-ingress.yaml` | TOTP service routing |
| Traefik Dashboard | `traefik-dashboard.yaml` | Traefik admin panel |

---

## Production Docker Compose (Simplified)

`docker-compose.prod.yml` strips development services (pgAdmin, ollama, mongodb) for minimal footprint:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## CI/CD

### GitHub Actions (`.github/`)

Typical workflow:

```yaml
on: [push]
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Build backend
        run: docker build -t foodrms-api ./project/backend/src/FoodRMS.Api
      
      - name: Build frontend
        run: docker build -t foodrms-frontend ./project/frontend
      
      - name: Push to registry
        run: |
          docker push ghcr.io/org/foodrms-api:${{ github.sha }}
          docker push ghcr.io/org/foodrms-frontend:${{ github.sha }}
      
      - name: Deploy via Helm
        run: helm upgrade --install foodrms ./project/helm ...
```

---

## Deployment Scripts

| Script | Location | Purpose |
|--------|----------|---------|
| `deploy.sh` | `project/` | Full Docker Compose deploy |
| `deploy_frontend.sh` | `foodRMS/` | Frontend-only redeploy |
| `deploy_web_apps.sh` | `foodRMS/` | Deploy web apps bundle |
| `deploy_extra_apps.sh` | `foodRMS/` | Deploy auxiliary services |
| `deploy-desktop.sh` | `project/desktop/` | Build + distribute desktop apps |

---

## Environment Configuration

### Backend (`FoodRMS.Api`)

```env
# project/backend/src/FoodRMS.Api/.env
ASPNETCORE_ENVIRONMENT=Production
ConnectionStrings__DefaultConnection=Host=db;Database=foodrms;Username=postgres;Password=secret
Jwt__Key=your-very-long-jwt-secret-key-here
Jwt__Issuer=FoodRMS
Jwt__Audience=FoodRMS
UseSqlite=false
UseInMemoryDatabase=false
RUNNING_IN_DOCKER=true
```

### Frontend (`Web Portal`)

```env
# project/frontend/.env
NEXT_PUBLIC_API_URL=https://api.yourrestaurant.com
```

### BotWorker

```env
ConnectionStrings__DefaultConnection=Host=db;Database=foodrms;...
Ollama__Url=http://ollama:11434/api/chat
FoodRmsApi__BaseUrl=http://backend:5109
MongoDbSettings__ConnectionString=mongodb://mongodb:27017
MongoDbSettings__DatabaseName=FoodRMS_BotSession
```

---

## TLS / SSL

Production uses **Traefik** with automatic TLS via Let's Encrypt.

- `traefik-dashboard-cert.yaml` — cert for Traefik admin
- `k8s-dashboard-cert.yaml` — cert for K8s dashboard
- `totp-cert.yaml` — cert for TOTP service

The `test-dynamic-ssl.sh` and `test-ssl-polling.sh` scripts in `project/` can verify certificate issuance and HTTPS connectivity.

---

## Database Migrations

### Running Migrations

EF Core migrations are applied **automatically at startup** via `context.Database.MigrateAsync()` in `Program.cs`. No manual `dotnet ef database update` is needed in production.

### Creating New Migrations

```bash
cd project/backend/src/FoodRMS.Api

# Create a new migration (targets template_tenant schema by default)
dotnet ef migrations add MyNewMigration \
  --project FoodRMS.Api.csproj

# The migration will be applied to all tenant schemas at next startup
```

### Schema Per Tenant

When a new tenant is provisioned, the API:
1. Creates `public.Tenants` record
2. Sets tenant context
3. Calls `MigrateAsync()` → creates `tenant_{UUID}` schema + all tables
4. Seeds Casbin policies for the new tenant

---

## Monitoring

| Tool | URL | Purpose |
|------|-----|---------|
| Swagger UI | `/api/swagger` | API documentation + testing |
| pgAdmin | `:5050` | Database inspection |
| Traefik Dashboard | Traefik admin port | Ingress routing inspection |
| `backend.log` | Project root | API application logs |
| `botlogs.txt` | Project root | Bot worker logs |

---

## Scaling

| Component | Scaling Strategy |
|-----------|-----------------|
| `FoodRMS.Api` | Horizontal (stateless, JWT auth) — multiple replicas behind Traefik |
| `FoodRMS.BotWorker` | Single replica (stateful: in-memory offset tracking). Use Redis for distributed state before scaling |
| `Frontend` | Horizontal (static nginx) — CDN recommended |
| `PostgreSQL` | Vertical + read replicas. PgBouncer for connection pooling |
| `MongoDB` | Replica set for bot session HA |
