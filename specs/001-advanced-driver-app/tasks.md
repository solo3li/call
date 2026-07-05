---
description: "Task list template for feature implementation"
---

# Tasks: advanced-driver-app

**Input**: Design documents from `/specs/001-advanced-driver-app/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/driver-sync.yaml

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize React Native with TypeScript project in project/driver-app/
- [x] T002 Configure Mapbox SDK and WatermelonDB dependencies in project/driver-app/package.json
- [x] T003 [P] Configure ESLint and Prettier for the impeccable standard in project/driver-app/.eslintrc.js

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Setup WatermelonDB schema and sync logic foundation in project/driver-app/src/database/index.ts
- [x] T005 [P] Setup React Navigation structure in project/driver-app/src/screens/index.tsx
- [x] T006 Implement base reusable UI components (impeccable standard) in project/driver-app/src/components/index.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Optimized Routing & Navigation (Priority: P1) 🎯 MVP

**Goal**: Provide real-time, traffic-aware optimized routing for faster deliveries.

**Independent Test**: Can be fully tested by assigning a delivery to a driver and verifying the app provides turn-by-turn navigation that updates based on simulated traffic.

### Implementation for User Story 1

- [x] T007 [P] [US1] Create DeliveryRoute model schema in project/driver-app/src/database/schema.ts
- [x] T008 [US1] Implement Mapbox routing service in project/driver-app/src/services/MapboxService.ts
- [x] T009 [US1] Implement Routing Screen UI in project/driver-app/src/screens/RoutingScreen.tsx
- [x] T010 [US1] Integrate Mapbox with routing screen and dynamic traffic updates in project/driver-app/src/screens/RoutingScreen.tsx

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Earnings Dashboard & Analytics (Priority: P2)

**Goal**: Comprehensive earnings dashboard tracking daily, weekly, and monthly income.

**Independent Test**: Can be fully tested by completing mock deliveries and verifying the earnings are accurately reflected in the dashboard.

### Implementation for User Story 2

- [x] T011 [P] [US2] Create DriverEarnings model schema in project/driver-app/src/database/schema.ts
- [x] T012 [US2] Implement Earnings service for data aggregation in project/driver-app/src/services/EarningsService.ts
- [x] T013 [US2] Implement Earnings Dashboard UI in project/driver-app/src/screens/EarningsDashboard.tsx
- [x] T014 [US2] Integrate earnings service with dashboard and historical data view in project/driver-app/src/screens/EarningsDashboard.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Low-Connectivity Resilience (Priority: P3)

**Goal**: App functions offline so drivers can view order details and mark delivered in dead zones.

**Independent Test**: Can be tested by turning off network connectivity, completing an active order, and verifying it syncs once connectivity is restored.

### Implementation for User Story 3

- [x] T015 [P] [US3] Create OfflineSyncAction model schema in project/driver-app/src/database/schema.ts
- [x] T016 [US3] Implement Sync API contract logic in project/driver-app/src/database/sync.ts
- [x] T017 [US3] Add offline banner and local state handling to App layout in project/driver-app/src/screens/App.tsx
- [x] T018 [US3] Test offline action queuing and sync trigger on connection restore in project/driver-app/src/database/sync.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T019 [P] Update Quickstart docs based on final layout in specs/001-advanced-driver-app/quickstart.md
- [x] T020 Optimize map load times to be under 1s across target devices in project/driver-app/src/services/MapboxService.ts
- [x] T021 Apply Dark Mode toggle logic throughout all screens in project/driver-app/src/components/ThemeProvider.tsx

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch models for User Story 1 in parallel:
Task: "Create DeliveryRoute model schema in project/driver-app/src/database/schema.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories
