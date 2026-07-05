# Implementation Plan: Delivery Filters

**Branch**: `004-delivery-filters` | **Date**: 2026-06-01 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-delivery-filters/spec.md`

## Summary

Add "Delivery Type" (Internal/External) and "Delivery Company" filters to the orders dashboard (HQ desktop app), along with a new "Delivery Info" column. The filtering will be implemented server-side by adding new query parameters to the API to properly support pagination.

## Technical Context

**Language/Version**: TypeScript / React (Frontend), C# (Backend)

**Primary Dependencies**: React, MUI, EF Core, ASP.NET Core, SignalR

**Storage**: PostgreSQL (with schema-per-tenant architecture)

**Testing**: Jest (Frontend), xUnit (Backend)

**Target Platform**: Desktop browsers (HQ and branch desktop) and REST API

**Project Type**: Full-stack web application

**Performance Goals**: < 1 second response for filtering and real-time dashboard updates

**Constraints**: Server-side filtering must be implemented for pagination compatibility.

**Scale/Scope**: Local branch/HQ dashboard scale

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Clean and Organized Workspace**: Checked.
- **II. Safe Deployment Process**: Not applicable yet (design phase).
- **III. Comprehensive Testing**: Backend tests for new filter logic must be added.
- **IV. Strict Project Structure**: Using `project/desktop/apps/hq/` and `project/backend/`.
- **V. Design & Implementation Standard**: Will use the `impeccable` skill for frontend UI filter additions.
- **VI. Brand Identity and Theming**: UI additions will match existing neo-brutalist styling.

## Project Structure

### Documentation (this feature)

```text
specs/004-delivery-filters/
├── plan.md              
├── research.md          
├── data-model.md        
├── quickstart.md        
├── contracts/           
└── tasks.md             
```

### Source Code (repository root)

```text
project/
├── desktop/apps/hq/
│   └── src/
│       ├── components/
│       │   └── DeliveryDashboard.tsx
│       ├── context/
│       │   └── DashboardContext.tsx
│       └── utils/
│           └── api.ts
└── backend/
    ├── src/FoodRMS.Api/
    │   ├── Areas/Api/Controllers/OrdersController.cs
    │   ├── Entities/Order.cs
    │   ├── Interfaces/IOrderService.cs
    │   └── Infrastructure/Services/OrderService.cs
    └── tests/FoodRMS.IntegrationTests/
        └── Orders/OrdersControllerTests.cs
```

**Structure Decision**: Standard Project Structure. Modifying the HQ frontend dashboard and the Backend API services.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected.
