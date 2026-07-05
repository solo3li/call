# FoodRMS — Full Project Documentation

> **FoodRMS** (فود بورد) is a multi-tenant Restaurant Management SaaS platform. It serves restaurant chains with a full-stack system: a .NET backend API, a Next.js web portal, Tauri-based desktop KDS/POS apps, a Telegram bot worker, and Kubernetes-based deployment.

---

## Documentation Index

| Doc | Description |
|-----|-------------|
| [architecture.md](./architecture.md) | High-level system architecture, component map, and data-flow diagrams |
| [backend.md](./backend.md) | ASP.NET Core API — entities, services, controllers, auth, SignalR |
| [frontend.md](./frontend.md) | Next.js web portal — pages, components, design system |
| [desktop.md](./desktop.md) | Tauri desktop apps — Branch KDS/POS and HQ apps |
| [bot-worker.md](./bot-worker.md) | Telegram Bot Worker microservice |
| [multitenancy.md](./multitenancy.md) | Schema-per-tenant architecture deep dive |
| [auth.md](./auth.md) | Authentication and authorization — JWT, TOTP, Casbin RBAC |
| [api-reference.md](./api-reference.md) | Full REST API endpoint reference |
| [deployment.md](./deployment.md) | Docker Compose, Kubernetes, Helm, and CI/CD |
| [data-model.md](./data-model.md) | Entity-Relationship overview of all database entities |
| [design-system.md](./design-system.md) | Neo-Brutalist design system, tokens, and UI conventions |

---

## Quick Project Summary

| Attribute | Value |
|-----------|-------|
| **Product Name** | FoodRMS / فود بورد |
| **Target Market** | Arabic-speaking restaurant operators (Saudi Arabia, Gulf) |
| **Architecture** | Multi-tenant SaaS, schema-per-tenant (PostgreSQL) |
| **Backend** | ASP.NET Core 9, EF Core, SignalR, Casbin RBAC |
| **Frontend (Web)** | Next.js 15, React 19, Tailwind CSS 4, Framer Motion |
| **Desktop Apps** | Tauri + Next.js (Branch KDS/POS, HQ dashboard) |
| **Bot** | Telegram Bot, Ollama LLM, .NET BackgroundService |
| **Database** | PostgreSQL (prod), SQLite (dev/test) |
| **Deployment** | Docker Compose / Kubernetes (Helm) |
| **Auth** | JWT + TOTP (employees), Casbin RBAC per tenant |
