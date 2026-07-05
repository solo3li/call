# FoodRMS — Frontend (Web Portal)

## Overview

The FoodRMS web portal is a **Next.js 15** application targeting restaurant **owners and managers**. It provides a marketing landing page, authentication flows, and a full management dashboard.

The app is RTL-first (Arabic language), using the Cairo font and a **Neo-Brutalist** design system.

---

## Project Structure

```
project/frontend/
├── src/
│   ├── app/                          ← Next.js App Router
│   │   ├── layout.tsx                ← Root layout (fonts, metadata)
│   │   ├── globals.css               ← Global CSS + Tailwind base
│   │   ├── page.tsx                  ← Marketing homepage (/)
│   │   ├── login/                    ← /login page
│   │   ├── register/                 ← /register page
│   │   ├── dashboard/                ← /dashboard (authenticated)
│   │   ├── menu/                     ← /menu management
│   │   ├── pricing/                  ← /pricing page (public)
│   │   ├── contact/                  ← /contact page (public)
│   │   ├── download/                 ← /download apps page
│   │   └── profile/                  ← /profile settings
│   │
│   ├── components/                   ← Reusable UI components
│   │   ├── Header.tsx                ← Dashboard top bar
│   │   ├── Sidebar.tsx               ← Dashboard sidebar navigation
│   │   ├── MobileSidebar.tsx         ← Mobile sidebar (drawer)
│   │   ├── BranchesCard.tsx          ← Branches overview widget
│   │   ├── StaffCard.tsx             ← Staff overview widget
│   │   ├── StatsCards.tsx            ← KPI stat cards
│   │   ├── Charts.tsx                ← Revenue/order Recharts charts
│   │   ├── OrdersTable.tsx           ← Recent orders table
│   │   ├── TopItems.tsx              ← Best-selling items widget
│   │   ├── WeeklyRatings.tsx         ← Rating chart
│   │   ├── DeliveryDashboard.tsx     ← Driver tracking view
│   │   ├── LiveStatus.tsx            ← Real-time connection indicator
│   │   ├── QuickActions.tsx          ← Quick action buttons
│   │   ├── DashboardApp.tsx          ← Dashboard shell
│   │   └── EmployeeQrModal.tsx       ← TOTP QR code display modal
│   │
│   ├── views/                        ← Page-level view components
│   │   ├── AuthPage.tsx              ← Login + Register forms (25 KB)
│   │   ├── ManagementPages.tsx       ← All management sub-pages (122 KB!)
│   │   ├── MarketingPages.tsx        ← Header, footer, marketing sections
│   │   ├── KdsPage.tsx               ← Kitchen Display System view
│   │   ├── PosPage.tsx               ← Point of Sale cashier view
│   │   ├── DeliveryDriverView.tsx    ← Driver app view
│   │   ├── AnalyticsPage.tsx         ← Analytics + reports
│   │   ├── CustomersPage.tsx         ← Customer management
│   │   ├── HelpDeskPage.tsx          ← Support ticket management
│   │   ├── CallCenterPage.tsx        ← Call center / ordering
│   │   ├── RolesPermissionsPage.tsx  ← RBAC role management
│   │   ├── SupportComplaintsPage.tsx ← Complaints management
│   │   ├── ProfilePage.tsx           ← User profile settings
│   │   └── PublicMenuView.tsx        ← Public-facing menu (QR scan)
│   │
│   ├── context/                      ← React context providers
│   ├── types/                        ← TypeScript type definitions
│   ├── utils/                        ← API helpers, formatters
│   └── data/                         ← Static/seed data
│
├── package.json
├── next.config.mjs
├── tsconfig.json
├── postcss.config.mjs
└── Dockerfile
```

---

## Pages & Routes

| Route | Page | Auth Required | Description |
|-------|------|--------------|-------------|
| `/` | `page.tsx` | No | Marketing homepage |
| `/login` | `login/page.tsx` | No | Owner/manager login |
| `/register` | `register/page.tsx` | No | New tenant registration |
| `/pricing` | `pricing/` | No | Subscription plan pricing |
| `/contact` | `contact/` | No | Contact form |
| `/download` | `download/` | No | Desktop app download links |
| `/dashboard` | `dashboard/` | Yes | Main management dashboard |
| `/menu` | `menu/` | Yes | Menu management |
| `/profile` | `profile/` | Yes | Profile settings |

---

## Key Views

### `ManagementPages.tsx` (122 KB)

The largest file. Contains all sub-pages of the management dashboard:
- **Orders management** — table view, filters, status updates
- **Branch management** — CRUD with plan limit display
- **Staff management** — employee list, create/edit, TOTP QR display
- **Menu management** — categories and items with image upload
- **Kitchen stations** — assignment for order routing
- **Departments** — organizational grouping
- **Customers** — customer database with address book
- **Delivery zones** — zone pricing configuration
- **Roles & Permissions** — visual Casbin permission editor
- **Telegram bot settings** — bot token configuration, activation
- **Tenant settings** — branding, currency, business info
- **Analytics** — revenue charts, top items, staff performance
- **Support tickets** — HelpDesk view

### `KdsPage.tsx`

Kitchen Display System view. Features:
- Real-time order cards grouped by status (Pending, Preparing, Ready)
- Neo-Brutalist color coding: Orange (Pending), Purple (Preparing), Green (Ready)
- SignalR connection with automatic reconnect
- One-tap status advancement ("بدأ التحضير", "جاهز")
- Order cards show: order number, items, kitchen notes, timer
- Filtered per `KitchenStation` if applicable

### `PosPage.tsx`

Point of Sale cashier interface:
- Menu browsing by category
- Cart management (add/remove items, quantities)
- Order type selection (DineIn / Delivery / Takeaway)
- Customer lookup + address selection for delivery
- Payment submission → creates order via API

### `AuthPage.tsx`

Handles both password login (owners/managers) and TOTP login (employees). Includes:
- Email + password form
- Employee code + 6-digit TOTP input
- Tab switcher between modes

---

## Design System

See [design-system.md](./design-system.md) for the full token reference.

### Core Principles (from DESIGN.md)
- **Neo-Brutalist** visual language: stark black borders, hard drop shadows
- **RTL-first** layout for Arabic content
- **Cairo** font (Google Fonts)
- Color palette: Warm off-white bg, black borders, brand orange/purple/green/yellow accents
- Buttons have press states: shadow reduction on `:active`

### Tailwind Configuration

Custom tokens defined in `globals.css` / Tailwind config:

```css
/* Neo-Brutalist tokens */
--neo-border: #1A1A1A;
--neo-shadow: 4px 4px 0px #1A1A1A;
--neo-bg: #FFFBEB;

/* Brand accent colors */
--brand-orange: #FF6B35;
--brand-purple: #AA00FF;
--brand-green: #00E676;
--brand-yellow: #FFD700;
--brand-blue: #1565C0;
--brand-pink: #FF4081;
--brand-cyan: #00BCD4;
--brand-lime: #C6FF00;
```

---

## State Management

FoodRMS web portal does **not** use a global state library (Redux/Zustand). State is managed via:

1. **React Context** (`context/`) — auth state, tenant info, active branch selection
2. **Local component state** — form values, UI toggles
3. **Server state** — direct `fetch`/`axios` calls to the API, no caching layer (no React Query)

---

## Real-Time (SignalR)

SignalR is used in `KdsPage.tsx` and `DeliveryDashboard.tsx`:

```typescript
import * as signalR from "@microsoft/signalr";

const connection = new signalR.HubConnectionBuilder()
  .withUrl(`${API_BASE}/api/orderHub?access_token=${token}`)
  .withAutomaticReconnect()
  .build();

connection.on("OrderCreated", (order) => { /* update state */ });
connection.on("OrderStatusChanged", ({ orderId, newStatus }) => { /* update state */ });

await connection.start();
```

---

## Build & Run

```bash
# Development
cd project/frontend
npm install
npm run dev    # → http://localhost:3000

# Production build
npm run build
npm start

# Tests
npm test       # Vitest
```

### Environment Variables

```env
# project/frontend/.env
NEXT_PUBLIC_API_URL=http://localhost:5109
```

### Docker

```dockerfile
# Builds a static Next.js export served via nginx
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM nginx:alpine
COPY --from=builder /app/out /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
```

The frontend is served as static files through nginx in production (Next.js static export mode).

---

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `next` | 15.x | App Router framework |
| `react` / `react-dom` | 19.x | UI library |
| `tailwindcss` | 4.x | Utility CSS |
| `framer-motion` | 12.x | Animations |
| `lucide-react` | 1.16 | Icons |
| `recharts` | 3.x | Charts (dashboard analytics) |
| `@microsoft/signalr` | 10.x | Real-time connection |
| `axios` | 1.x | HTTP client |
| `qrcode.react` | 4.x | TOTP QR code rendering |
| `clsx` / `tailwind-merge` | — | Conditional class utilities |
