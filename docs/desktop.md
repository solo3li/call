# FoodRMS — Desktop Apps (Tauri)

## Overview

FoodRMS ships **two desktop applications** built with [Tauri 2](https://tauri.app/) + Next.js. They are distributed to restaurant branches and the headquarters as native executables (Windows/Linux/macOS).

| App | Target Users | Primary Use |
|-----|-------------|-------------|
| **Branch App** | Kitchen staff, cashiers, waiters at a single branch | KDS, POS, helpdesk |
| **HQ App** | Restaurant chain owners, regional managers | Multi-branch dashboard, analytics |

---

## Project Structure

```
project/desktop/
├── package.json                  ← Workspace root
├── Dockerfile.branch             ← Docker container for Branch app
├── Dockerfile.hq                 ← Docker container for HQ app
├── deploy-desktop.sh             ← Deployment helper script
└── apps/
    ├── branch/                   ← Branch KDS/POS app
    │   ├── src/                  ← Next.js pages + components
    │   ├── src-tauri/            ← Tauri Rust core (window, IPC, OS integration)
    │   ├── package.json
    │   ├── next.config.mjs
    │   ├── Dockerfile
    │   ├── lifecycle-script.cjs  ← App lifecycle hooks
    │   └── PRODUCT.md / DESIGN.md
    └── hq/                       ← HQ dashboard app
        ├── src/
        ├── src-tauri/
        └── ...
```

---

## Branch App

### Purpose

The Branch App is a **full-screen kiosk-style application** running on a dedicated machine at each restaurant branch. It combines:

1. **Kitchen Display System (KDS)** — Shows incoming orders to kitchen staff in real time
2. **Point of Sale (POS)** — Cashier interface for taking dine-in and takeaway orders
3. **HelpDesk** — Internal support ticket submission from the branch

### Key Features

- **Auto-login via TOTP** — The app stores the branch's credentials; employees scan their code to switch users
- **Real-time order streaming** — SignalR connection maintained 24/7
- **Offline resilience** — Local order queue with sync when connectivity restored
- **Full-screen mode** — Tauri configured to start maximized/kiosk
- **No browser chrome** — Tauri window has no scrollbars, no context menu in production

### Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | Next.js 15 + React 19 |
| Styling | Tailwind CSS 4 (Neo-Brutalist) |
| Animations | Framer Motion 12 |
| Shell | Tauri 2 (Rust) |
| Real-time | SignalR (`@microsoft/signalr`) |

### Views (Branch)

The Branch app shares views with the web portal but with branch-specific context:

| View | Route | Description |
|------|-------|-------------|
| KDS | `/kds` | Full-screen kitchen display |
| POS | `/pos` | Cashier point of sale |
| Delivery Driver | `/driver` | Driver delivery tracking |
| Help Desk | `/helpdesk` | Support ticket creation |
| Auth | `/login` | Branch employee TOTP login |

### `lifecycle-script.cjs`

Handles Tauri app lifecycle events:
- On **first launch**: prompts for branch/API configuration
- On **update available**: triggers in-app update dialog
- **Periodic health check**: pings the API and shows offline banner

---

## HQ App

### Purpose

The HQ App is the **management console** for restaurant chain owners and regional managers. Unlike the Branch app (single-branch kiosk), the HQ app:

- Switches between all branches in the chain
- Shows aggregate analytics across all branches
- Manages staff, roles, menu, and delivery zones globally

### Key Features

- Multi-branch selector in the sidebar
- Real-time per-branch order status monitors
- Franchise-wide analytics dashboard
- Full management suite (same as web portal management pages)

---

## Build Process

### Development

```bash
# Branch app
cd apps/branch
npm install
npm run dev      # Next.js dev server (for hot reload)
npm run tauri dev  # Full Tauri + Next.js dev mode

# HQ app
cd apps/hq
npm run tauri dev
```

### Production Build

```bash
# Creates platform-specific binary in src-tauri/target/release/
npm run tauri build
```

Output artifacts:
- **Windows**: `.msi` installer + `.exe`
- **Linux**: `.deb` + `.AppImage`
- **macOS**: `.dmg`

---

## Docker Deployment

The desktop apps can also be deployed as **web apps inside Docker** (for organizations that prefer browser-based access on managed devices):

```dockerfile
# Dockerfile.branch
FROM node:22-alpine AS builder
WORKDIR /app
COPY apps/branch .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
COPY apps/branch/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

In this mode the Tauri shell is replaced by a browser, but the Next.js UI is identical.

---

## Configuration

### API Endpoint

The apps communicate with `FoodRMS.Api`. The base URL is configured at build time or via environment variable:

```env
NEXT_PUBLIC_API_URL=https://api.my-restaurant.foodrms.com
```

For branch-specific deployments, each branch machine points to its tenant's API subdomain.

### Tauri Permissions (`src-tauri/tauri.conf.json`)

Key permissions granted to the Tauri shell:
- `shell:open` — open external URLs (e.g. Telegram)
- `notification:all` — system tray notifications for new orders
- `fs:read` — read local config file
- `http:all` — all HTTP requests to the API

---

## Security Considerations

- JWT tokens are stored in Tauri's secure storage (encrypted keychain on macOS/Windows, libsecret on Linux)
- No `localStorage` token storage (unlike web portal)
- The `lifecycle-script.cjs` clears stored tokens on logout
- In kiosk/branch mode, the window is locked to the app domain

---

## Relation to Web Portal

The Branch and HQ apps **reuse the same view components** from `project/frontend/src/views/`. They share:

- Design system (same Tailwind tokens)
- API client utilities
- Type definitions
- SignalR connection logic

The only difference is the Tauri shell wrapper and some branch-specific lifecycle logic.
