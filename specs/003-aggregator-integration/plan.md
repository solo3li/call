# Implementation Plan: Aggregator Integration

**Branch**: `003-aggregator-integration` | **Date**: 2026-06-01 | **Spec**: [spec.md](file:///root/rms/foodRMS/specs/003-aggregator-integration/spec.md)

**Input**: Feature specification from `/specs/003-aggregator-integration/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

This feature allows HQ Administrators to configure external aggregator companies (like Talabat, elmenus) in the Desktop HQ App, and enables Call Center Agents to enter orders originating from these aggregators directly from the Call Center screen. The backend will be updated to store `ExternalCompany` configurations per tenant and associate `ExternalCompanyId` and `ExternalOrderId` with standard `Order` entities.

## Technical Context

**Language/Version**: TypeScript (Frontend), C# / .NET (Backend)

**Primary Dependencies**: Tauri, Next.js, React, Tailwind CSS (Desktop HQ) / ASP.NET Core, EF Core (Backend)

**Storage**: PostgreSQL (via EF Core, multitenant schemas)

**Testing**: vitest (Frontend), xUnit (Backend)

**Target Platform**: Windows/Linux (Tauri desktop app), Kubernetes/Linux (Backend server)

**Project Type**: Desktop App + Backend Service

**Performance Goals**: <200ms p95 API response for order creation

**Constraints**: Must adhere to strict multitenant architecture (schema per tenant). Must implement a visually excellent UI via the `impeccable` skill for HQ App.

**Scale/Scope**: Moderate load; standard restaurant call center concurrency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Clean and Organized Workspace**: Adhered to (new code will be properly separated).
- **II. Safe Deployment Process**: Will use Helm for backend deployment. (Pass)
- **III. Comprehensive Testing**: Tests will be written using vitest/xUnit. (Pass)
- **IV. Strict Project Structure**: Will place backend changes in `project/backend` and UI changes in `project/desktop/apps/hq`. (Pass)
- **V. Design & Implementation Standard**: Will apply `impeccable` skill for frontend interfaces. (Pass)
- **VI. Brand Identity and Theming**: UI will strictly use brand colors (neo-brutalist styling, `#FF6B35`, `#1A1A1A`). (Pass)

## Project Structure

### Documentation (this feature)

```text
specs/003-aggregator-integration/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
project/
├── desktop/apps/hq/       # Call center and administration UI
└── backend/               # Backend API and Database Models
```

**Structure Decision**: The feature requires changes to the central backend for database entity management (`ExternalCompany` and `Order` modifications) and to the Desktop HQ App for administration screens and call center enhancements.

