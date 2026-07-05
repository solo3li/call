# Tasks: Delivery Filters

**Input**: Design documents from `specs/004-delivery-filters/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Verify project structure and active feature branch

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 Update `Order` entity to include `public bool IsExternalDelivery { get; set; }` in `project/backend/src/FoodRMS.Api/Entities/Order.cs`
- [X] T003 Generate EF Core migration for `IsExternalDelivery` using `dotnet ef migrations add`

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Filter by Delivery Type (Priority: P1) 🎯 MVP

**Goal**: Filter the orders table by whether the delivery is internal or external.

**Independent Test**: Can be fully tested by selecting "Internal" or "External" in the delivery type filter and verifying matching orders.

### Implementation for User Story 1

- [X] T004 [P] [US1] Update `IOrderService.cs` and `OrdersController.cs` methods to accept `string? deliveryType` query parameter.
- [X] T005 [US1] Implement filtering logic in `OrderService.cs` (`GetAllOrdersAsync` and `GetRecentOrdersAsync`) based on `deliveryType`.
- [X] T006 [P] [US1] Add integration test for delivery type filtering in `project/backend/tests/FoodRMS.IntegrationTests/Orders/OrdersControllerTests.cs`.
- [X] T007 [P] [US1] Update `ordersApi.getAll` in `project/desktop/apps/hq/src/utils/api.ts` to accept and pass the `deliveryType` parameter.
- [X] T008 [US1] Update `DashboardContext.tsx` to hold `deliveryType` state and pass it to API calls.
- [X] T009 [US1] Add "Delivery Type" dropdown filter to `DeliveryDashboard.tsx` UI.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Filter by External Delivery Company (Priority: P1)

**Goal**: Filter external delivery orders by the specific company name or find orders where the company is unspecified.

**Independent Test**: Can be tested by selecting a specific company in the filter and verifying the table updates correctly.

### Implementation for User Story 2

- [X] T010 [P] [US2] Update `IOrderService.cs` and `OrdersController.cs` methods to accept `string? externalCompanyId` query parameter.
- [X] T011 [US2] Implement filtering logic in `OrderService.cs` based on `externalCompanyId`.
- [X] T012 [P] [US2] Add integration test for external company filtering in `OrdersControllerTests.cs`.
- [X] T013 [P] [US2] Update `ordersApi.getAll` in `api.ts` to pass the `externalCompanyId` parameter.
- [X] T014 [US2] Update `DashboardContext.tsx` to hold `externalCompanyId` state and pass it to API calls.
- [X] T015 [US2] Add "Delivery Company" dropdown filter to `DeliveryDashboard.tsx`.
- [X] T016 [US2] Add logic to `DeliveryDashboard.tsx` to reset the company filter to "All" and disable it when "Internal" delivery type is selected.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: User Story 3 - View Delivery Info in Table (Priority: P2)

**Goal**: See the delivery type and company name directly in the orders table/kanban cards.

**Independent Test**: Verify the new column/badge displays the correct info for different order types.

### Implementation for User Story 3

- [X] T017 [US3] Update Kanban cards in `DeliveryDashboard.tsx` to prominently display "Internal" or "External - [Company Name]" based on the order data.

**Checkpoint**: All user stories should now be independently functional.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T018 [P] Verify neo-brutalist styling of new filters using the `impeccable` skill on `DeliveryDashboard.tsx`.
- [X] T019 Run manual verification based on `quickstart.md`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can proceed sequentially (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2).
- **User Story 2 (P1)**: Can start after Foundational (Phase 2). Integrates closely with US1 UI logic.
- **User Story 3 (P2)**: Can start after Foundational (Phase 2).

### Parallel Opportunities

- Backend API parameter updates (T004, T010) and Frontend API signature updates (T007, T013) can run in parallel.
- Integration tests (T006, T012) can be written in parallel to implementation.

---

## Implementation Strategy

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (Delivery Type Filter) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (Company Filter) → Test independently → Deploy/Demo
4. Add User Story 3 (UI Badges) → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories.
