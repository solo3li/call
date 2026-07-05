---
description: "Task list for Aggregator Integration implementation"
---

# Tasks: Aggregator Integration

**Input**: Design documents from `/specs/003-aggregator-integration/`

**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api.md, research.md, quickstart.md

**Tests**: Test tasks are not included as they were not explicitly requested.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Exact file paths are included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify project structure in project/backend and project/desktop/apps/hq

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 Update DB Context to include ExternalCompany in project/backend/src/FoodRMS.Api/Data/AppDbContext.cs (or appropriate DB context file)
- [x] T003 Create foundational migrations framework setup check in project/backend/src/FoodRMS.Api

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Configure External Companies (Priority: P1) 🎯 MVP

**Goal**: HQ Administrators need to manage (add, edit, toggle) external aggregator companies in the HQ Desktop App.

**Independent Test**: Log into HQ admin panel, navigate to External Companies, and create/disable a company successfully.

### Implementation for User Story 1

- [x] T004 [P] [US1] Create ExternalCompany model in project/backend/src/FoodRMS.Api/Models/ExternalCompany.cs
- [x] T005 [US1] Generate and apply EF Core Migration for ExternalCompany in project/backend
- [x] T006 [P] [US1] Implement ExternalCompanyController endpoints (GET, POST, PUT) in project/backend/src/FoodRMS.Api/Controllers/ExternalCompanyController.cs
- [x] T007 [P] [US1] Create External Companies management UI page in project/desktop/apps/hq/src/pages/settings/external-companies.tsx (or equivalent routing path)
- [x] T008 [US1] Integrate UI with backend API for ExternalCompany CRUD operations in project/desktop/apps/hq/src/services/externalCompanyService.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Enter External Order in Call Center (Priority: P1)

**Goal**: Call center agents need to enter orders originating from external companies directly from the Call Center screen.

**Independent Test**: Create an order, select an external company (e.g., Talabat), enter external ID and customer phone, submit, and verify receipt contains external details.

### Implementation for User Story 2

- [x] T009 [P] [US2] Update Order entity with ExternalCompanyId, ExternalOrderId, CustomerPhone in project/backend/src/FoodRMS.Api/Models/Order.cs
- [x] T010 [US2] Generate and apply EF Core Migration for Order table changes in project/backend
- [x] T011 [US2] Update Order endpoint and DTOs to accept new fields in project/backend/src/FoodRMS.Api/Controllers/OrderController.cs
- [x] T012 [P] [US2] Update Call Center screen UI to add External Company dropdown and input fields in project/desktop/apps/hq/src/components/CallCenter/OrderForm.tsx
- [x] T013 [P] [US2] Update receipt printing template to include external company and external order ID in project/desktop/apps/hq/src/components/Receipt/ReceiptTemplate.tsx
- [x] T014 [US2] Integrate Call Center UI updates with updated Order API in project/desktop/apps/hq/src/services/orderService.ts

**Checkpoint**: User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T015 Polish UI for External Companies using `impeccable` standards
- [x] T016 Run quickstart.md validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately
- **Foundational (Phase 2)**: Depends on Setup
- **User Stories (Phase 3+)**: Depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational
- **User Story 2 (P1)**: Can start after Foundational. While logically it uses ExternalCompany, the backend and UI models can be built in parallel, only integrating at the end.

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- Models and Controllers for US1 can be developed simultaneously with the frontend pages for US1.
- Updating Order entity (US2) can happen at the same time as updating the Call Center UI.

---

## Parallel Example: User Story 1

```bash
# Launch backend API and frontend UI for User Story 1 together:
Task: "Implement ExternalCompanyController endpoints (GET, POST, PUT)"
Task: "Create External Companies management UI page"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2
2. Complete Phase 3: User Story 1
3. **STOP and VALIDATE**: Test User Story 1 independently

### Incremental Delivery

1. Complete Setup + Foundational
2. Add User Story 1 (External Companies Admin) → Test independently → MVP
3. Add User Story 2 (Call Center Integration) → Test independently
